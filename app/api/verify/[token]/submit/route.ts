import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fieldKey, requestByToken, snapshotEntities, valueHash } from "@/lib/verification";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const limited = await rateLimit(request, "verification-submit", 12, 15 * 60_000);
  if (limited) return limited;
  const { token } = await params;
  const verification = await requestByToken(token);
  if (!verification) return NextResponse.json({ message: "Ungültiger oder abgelaufener Link." }, { status: 404 });
  const body = await request.json().catch(() => null) as { changes?: Record<string, unknown>; confirmAll?: boolean } | null;
  if (!body?.changes || Array.isArray(body.changes)) return NextResponse.json({ message: "Ungültige Eingabe." }, { status: 400 });
  const allowed = new Map<string, { entityType: string; entityId: string; venueId: string|null; field: string; oldValue: unknown }>();
  for (const entity of snapshotEntities(verification.snapshot)) for (const [field, oldValue] of Object.entries(entity.fields)) {
    if (verification.venueId && entity.entityType !== "wedding_venue") continue;
    allowed.set(fieldKey(entity, field), { entityType: entity.entityType, entityId: entity.id, venueId: entity.entityType === "wedding_venue" ? entity.id : null, field, oldValue });
  }
  if (Object.keys(body.changes).some((key) => !allowed.has(key))) return NextResponse.json({ message: "Feld liegt ausserhalb dieses Prüflinks." }, { status: 403 });

  await prisma.$transaction(async (tx) => {
    for (const [key, meta] of allowed) {
      const newValue = Object.hasOwn(body.changes!, key) ? body.changes![key] : meta.oldValue;
      const changed = JSON.stringify(newValue ?? null) !== JSON.stringify(meta.oldValue ?? null);
      if (changed && !body.confirmAll) {
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO verification_change_proposals (id,verification_request_id,office_id,venue_id,entity_type,entity_id,field_name,old_value,proposed_value,source_type,status,created_at,updated_at,created_by)
          VALUES (gen_random_uuid(),${verification.id}::uuid,${verification.snapshot.office.id}::uuid,${meta.venueId}::uuid,${meta.entityType},${meta.entityId}::uuid,${meta.field},${JSON.stringify(meta.oldValue ?? null)}::jsonb,${JSON.stringify(newValue ?? null)}::jsonb,${verification.sourceType},'pending',now(),now(),'public_verification')
        `);
      } else {
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO field_verifications (id,entity_type,entity_id,field_name,verified_value,value_hash,verified_at,verified_by_type,verified_by_name,verification_request_id,status,created_at,updated_at,created_by)
          VALUES (gen_random_uuid(),${meta.entityType},${meta.entityId}::uuid,${meta.field},${JSON.stringify(meta.oldValue ?? null)}::jsonb,${valueHash(meta.oldValue)},now(),${verification.sourceType},${verification.sourceName},${verification.id}::uuid,'active',now(),now(),'public_verification')
          ON CONFLICT (entity_type,entity_id,field_name,verified_by_type) DO UPDATE SET verified_value=EXCLUDED.verified_value,value_hash=EXCLUDED.value_hash,verified_at=now(),verified_by_name=EXCLUDED.verified_by_name,verification_request_id=EXCLUDED.verification_request_id,status='active',invalidated_at=NULL,updated_at=now()
        `);
      }
    }
    await tx.$executeRaw(Prisma.sql`UPDATE verification_requests SET status=${body.confirmAll ? "completed" : "submitted"},submitted_at=now(),completed_at=${body.confirmAll ? new Date() : null},updated_at=now() WHERE id=${verification.id}::uuid AND status='active'`);
  });
  return NextResponse.json({ ok: true });
}
