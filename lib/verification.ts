import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import pg from "pg";
import { prisma } from "@/lib/prisma";

export const officeFields = ["name", "website", "phone", "email", "booking_url", "information_url"] as const;
export const venueFields = ["name", "website", "phone", "email", "booking_url", "information_url", "official_ceremony_possible", "ceremony_days", "ceremony_times", "capacity_min", "capacity_max", "indoor", "outdoor", "wheelchair_accessible", "reservation_required"] as const;
export const coreVenueFields = ["name", "official_ceremony_possible", "ceremony_days", "capacity_max", "wheelchair_accessible", "reservation_required"] as const;

export type VerificationEntity = { entityType: "civil_registry_office" | "wedding_venue"; id: string; name: string; fields: Record<string, unknown> };
export type VerificationSnapshot = { office: VerificationEntity; venues: VerificationEntity[] };
export type VerificationRequestView = { id: string; languageCode: "de" | "fr" | "it"; status: string; sourceType: string; sourceName: string; expiresAt: Date; venueId: string | null; snapshot: VerificationSnapshot };

const globalReplica = globalThis as unknown as { verificationReplicaPool?: pg.Pool };
function replicaPool() {
  const connectionString = process.env.WEB_PUBLIC_REPLICA_DATABASE_URL
    ?? process.env.PUBLIC_REPLICA_DATABASE_URL;
  if (!connectionString) {
    throw new Error("WEB_PUBLIC_REPLICA_DATABASE_URL or PUBLIC_REPLICA_DATABASE_URL is not configured");
  }
  globalReplica.verificationReplicaPool ??= new pg.Pool({ connectionString, ssl: process.env.PUBLIC_REPLICA_DATABASE_SSL === "require" ? { rejectUnauthorized: process.env.PUBLIC_REPLICA_DATABASE_SSL_VERIFY !== "false" } : undefined });
  return globalReplica.verificationReplicaPool;
}

export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function valueHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value ?? null)).digest("hex");
}

export function createSecureToken() {
  return randomBytes(32).toString("base64url");
}

type SnapshotRow = { office_id: string; office_name: string; office_fields: Record<string, unknown>; venues: VerificationEntity[] | null };

export async function buildOfficeSnapshot(officeId: string, onlyVenueId?: string): Promise<VerificationSnapshot | null> {
  const result = await replicaPool().query<SnapshotRow>(`
    SELECT o.id::text office_id, o.name office_name,
      jsonb_build_object('name',o.name,'website',o.website,'phone',o.profile->>'telephone','email',o.profile->>'email','booking_url',o.profile->>'appointment_url','information_url',o.profile->>'information_url') office_fields,
      COALESCE(jsonb_agg(jsonb_build_object(
        'entityType','wedding_venue','id',v.id::text,'name',v.name,'fields',jsonb_build_object(
          'name',v.name,'website',v.website,'phone',v.profile->>'telephone','email',v.profile->>'email','booking_url',v.profile->>'booking_url','information_url',v.profile->>'information_url',
          'official_ceremony_possible',v.profile->'official_ceremony_possible','ceremony_days',v.profile->'ceremony_days','ceremony_times',v.profile->'ceremony_times',
          'capacity_min',v.profile->'capacity_min','capacity_max',v.profile->'capacity_max','indoor',v.profile->'indoor','outdoor',v.profile->'outdoor',
          'wheelchair_accessible',v.profile->'wheelchair_accessible','reservation_required',v.profile->'reservation_required'
        )) ORDER BY v.name) FILTER (WHERE v.id IS NOT NULL), '[]'::jsonb) venues
    FROM web_public_offices o
    LEFT JOIN web_public_venue_office_assignments a ON a.office_id=o.id
    LEFT JOIN web_public_venues v ON v.id=a.venue_id AND ($2::uuid IS NULL OR v.id=$2::uuid)
    WHERE o.id=$1::uuid GROUP BY o.id,o.name,o.website,o.profile
  `,[officeId,onlyVenueId ?? null]);
  const row = result.rows[0];
  if (!row || (onlyVenueId && !row.venues?.length)) return null;
  return { office: { entityType: "civil_registry_office", id: row.office_id, name: row.office_name, fields: row.office_fields }, venues: row.venues ?? [] };
}

export async function createVerificationRequest(input: { officeId: string; venueId?: string; languageCode: "de" | "fr" | "it"; sourceType: "civil_registry_office" | "venue" | "internal"; sourceName?: string; parentRequestId?: string; days?: number }) {
  const existing = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT id::text FROM verification_requests
    WHERE office_id=${input.officeId}::uuid AND venue_id IS NOT DISTINCT FROM ${input.venueId ?? null}::uuid
      AND status='active' AND expires_at>now() AND revoked_at IS NULL LIMIT 1
  `);
  if (existing[0]) throw new Error("active_request_exists");
  const snapshot = await buildOfficeSnapshot(input.officeId, input.venueId);
  if (!snapshot) throw new Error("scope_not_found");
  const token = createSecureToken();
  const expiresAt = new Date(Date.now() + (input.days ?? 30) * 86_400_000);
  const sourceName = input.sourceName ?? (input.venueId ? snapshot.venues[0].name : snapshot.office.name);
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    INSERT INTO verification_requests (id,office_id,venue_id,parent_request_id,token_hash,language_code,status,source_type,source_name,snapshot,expires_at,created_at,updated_at,created_by)
    VALUES (gen_random_uuid(),${input.officeId}::uuid,${input.venueId ?? null}::uuid,${input.parentRequestId ?? null}::uuid,${tokenHash(token)},${input.languageCode},'active',${input.sourceType},${sourceName},${JSON.stringify(snapshot)}::jsonb,${expiresAt},now(),now(),'website_admin')
    RETURNING id::text
  `);
  return { id: rows[0].id, token, expiresAt, snapshot };
}

export async function requestByToken(token: string): Promise<VerificationRequestView | null> {
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) return null;
  const rows = await prisma.$queryRaw<Array<{ id: string; language_code: "de"|"fr"|"it"; status: string; source_type: string; source_name: string; expires_at: Date; venue_id: string|null; snapshot: VerificationSnapshot }>>(Prisma.sql`
    SELECT id::text,language_code,status,source_type,source_name,expires_at,venue_id::text,snapshot
    FROM verification_requests WHERE token_hash=${tokenHash(token)} LIMIT 1
  `);
  const row = rows[0];
  if (!row || row.status !== "active") return null;
  if (row.expires_at <= new Date()) {
    await prisma.$executeRaw(Prisma.sql`UPDATE verification_requests SET status='expired',updated_at=now() WHERE id=${row.id}::uuid AND status='active'`);
    return null;
  }
  return { id: row.id, languageCode: row.language_code, status: row.status, sourceType: row.source_type, sourceName: row.source_name, expiresAt: row.expires_at, venueId: row.venue_id, snapshot: row.snapshot };
}

export function snapshotEntities(snapshot: VerificationSnapshot) {
  return [snapshot.office, ...snapshot.venues];
}

export function fieldKey(entity: VerificationEntity, field: string) {
  return `${entity.entityType}:${entity.id}:${field}`;
}

export async function publicVenueVerification(venueId: string) {
  try {
    const currentResult = await replicaPool().query<{ profile: Record<string,unknown>; name:string }>("SELECT name,profile FROM web_public_venues WHERE id=$1::uuid",[venueId]);
    const current = currentResult.rows[0];
    if (!current) return null;
    const activeRows = await prisma.$queryRaw<Array<{verified_by_type:string;verified_by_name:string;verified_at:Date;field_name:string;value_hash:string}>>(Prisma.sql`SELECT verified_by_type,verified_by_name,verified_at,field_name,value_hash FROM field_verifications WHERE entity_type='wedding_venue' AND entity_id=${venueId}::uuid AND status='active' AND field_name=ANY(${coreVenueFields as unknown as string[]}::text[])`);
    const valid = activeRows.filter((row)=>valueHash(row.field_name === "name" ? current.name : current.profile[row.field_name]) === row.value_hash);
    const grouped = new Map<string,typeof valid>(); for(const row of valid){const key=`${row.verified_by_type}:${row.verified_by_name}`;grouped.set(key,[...(grouped.get(key)??[]),row]);}
    const sourceRows=[...grouped.values()].map(items=>({verified_by_type:items[0].verified_by_type,verified_by_name:items[0].verified_by_name,verified_at:items.reduce((a,b)=>a>b.verified_at?a:b.verified_at,items[0].verified_at),fields:BigInt(new Set(items.map(i=>i.field_name)).size)}));
    const complete = sourceRows.find((row) => row.verified_by_type === "civil_registry_office" && Number(row.fields) === coreVenueFields.length);
    if (!complete) return null;
    const venue = sourceRows.find((row) => row.verified_by_type === "venue" && Number(row.fields) === coreVenueFields.length);
    return { names: [complete.verified_by_name, ...(venue ? [venue.verified_by_name] : [])], verifiedAt: sourceRows.reduce((latest, row) => row.verified_at > latest ? row.verified_at : latest, complete.verified_at) };
  } catch { return null; }
}

export async function publicOfficesForVerification(){ const result=await replicaPool().query<{id:string;name:string}>("SELECT id::text,name FROM web_public_offices ORDER BY name"); return result.rows; }
