import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const leadStatuses = ["new", "reviewed", "contact_ready", "contacted", "approved", "rejected", "archived"] as const;
const permissionStatuses = ["pending", "approved", "rejected", "expired"] as const;
const sourceTypes = ["website", "google", "google_images", "instagram", "other"] as const;

type Venue = { id: string; name: string; slug: string; rank: number; photo_count: bigint; lead_count: bigint; photographer_count: bigint; open_count: bigint; contacted_count: bigint; approved_count: bigint; rejected_count: bigint };
type Photographer = { id: string; name: string; website_url: string | null; instagram_url: string | null; email: string | null; region: string | null; notes: string | null };
type Lead = { id: string; venue_id: string; photographer_id: string; photographer_name: string; source_type: string; source_url: string; source_title: string | null; confidence_score: number; status: string; notes: string | null; email: string | null; permission_id: string | null; permission_status: string | null; attribution_text: string | null; attribution_url: string | null };

const value = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const optional = (form: FormData, key: string) => value(form, key) || null;
function requireValue(form: FormData, key: string) {
  const result = value(form, key);
  if (!result) throw new Error(`${key} ist erforderlich`);
  return result;
}
function safeUrl(input: string) {
  const parsed = new URL(input);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error("Nur HTTP(S)-URLs sind erlaubt");
  return parsed.toString();
}
function optionalSafeUrl(form: FormData, key: string) {
  const input = value(form, key);
  return input ? safeUrl(input) : null;
}
function done(venueId?: string) {
  revalidatePath("/admin/photo-discovery");
  redirect(`/admin/photo-discovery${venueId ? `?venue=${venueId}` : ""}`);
}

async function createPhotographer(form: FormData) {
  "use server";
  await prisma.$executeRaw`INSERT INTO photographers
    (id, name, website_url, instagram_url, email, region, notes, metadata_json, created_at, updated_at, created_by, updated_by)
    VALUES (${randomUUID()}::uuid, ${requireValue(form, "name")}, ${optional(form, "website_url")}, ${optional(form, "instagram_url")}, ${optional(form, "email")}, ${optional(form, "region")}, ${optional(form, "notes")}, '{}'::json, now(), now(), 'website_admin', 'website_admin')`;
  done(value(form, "venue_id"));
}

async function updatePhotographer(form: FormData) {
  "use server";
  await prisma.$executeRaw`UPDATE photographers SET name=${requireValue(form, "name")}, website_url=${optional(form, "website_url")}, instagram_url=${optional(form, "instagram_url")}, email=${optional(form, "email")}, region=${optional(form, "region")}, notes=${optional(form, "notes")}, updated_at=now(), updated_by='website_admin' WHERE id=${requireValue(form, "id")}::uuid`;
  done(value(form, "venue_id"));
}

async function createLead(form: FormData) {
  "use server";
  const sourceType = requireValue(form, "source_type");
  if (!sourceTypes.includes(sourceType as typeof sourceTypes[number])) throw new Error("Ungültige Quelle");
  const score = Number(requireValue(form, "confidence_score"));
  if (!Number.isInteger(score) || score < 0 || score > 100) throw new Error("Score muss zwischen 0 und 100 liegen");
  const venueId = requireValue(form, "venue_id");
  await prisma.$executeRaw`INSERT INTO photo_leads
    (id, venue_id, photographer_id, source_type, source_url, source_title, discovered_at, confidence_score, status, notes, created_at, updated_at, created_by, updated_by)
    SELECT ${randomUUID()}::uuid, v.id, ${requireValue(form, "photographer_id")}::uuid, ${sourceType}, ${safeUrl(requireValue(form, "source_url"))}, ${optional(form, "source_title")}, now(), ${score}, 'new', ${optional(form, "notes")}, now(), now(), 'website_admin', 'website_admin'
    FROM wedding_venues v JOIN public_entity_profiles p ON p.entity_id=v.id AND p.entity_type='wedding_venue' AND p.kind='website_v1'
    WHERE v.id=${venueId}::uuid AND p.metadata_json->>'website_priority' LIKE 'Top20:%'`;
  done(venueId);
}

async function updateLead(form: FormData) {
  "use server";
  const status = requireValue(form, "status");
  if (!leadStatuses.includes(status as typeof leadStatuses[number])) throw new Error("Ungültiger Lead-Status");
  const score = Number(requireValue(form, "confidence_score"));
  if (!Number.isInteger(score) || score < 0 || score > 100) throw new Error("Score muss zwischen 0 und 100 liegen");
  await prisma.$executeRaw`UPDATE photo_leads SET status=${status}, confidence_score=${score}, notes=${optional(form, "notes")}, updated_at=now(), updated_by='website_admin' WHERE id=${requireValue(form, "id")}::uuid`;
  done(value(form, "venue_id"));
}

async function savePermission(form: FormData) {
  "use server";
  const status = requireValue(form, "status");
  if (!permissionStatuses.includes(status as typeof permissionStatuses[number])) throw new Error("Ungültiger Freigabestatus");
  const leadId = requireValue(form, "photo_lead_id");
  const venueId = requireValue(form, "venue_id");
  await prisma.$executeRaw`INSERT INTO photo_permissions
    (id, photo_lead_id, photographer_id, venue_id, requested_at, responded_at, status, usage_conditions, attribution_text, attribution_url, internal_notes, created_at, updated_at, created_by, updated_by)
    SELECT ${randomUUID()}::uuid, l.id, l.photographer_id, l.venue_id, now(), CASE WHEN ${status}='pending' THEN NULL ELSE now() END, ${status}, ${optional(form, "usage_conditions")}, ${optional(form, "attribution_text")}, ${optionalSafeUrl(form, "attribution_url")}, ${optional(form, "internal_notes")}, now(), now(), 'website_admin', 'website_admin'
    FROM photo_leads l WHERE l.id=${leadId}::uuid
    ON CONFLICT (photo_lead_id) DO UPDATE SET status=EXCLUDED.status, responded_at=EXCLUDED.responded_at, usage_conditions=EXCLUDED.usage_conditions, attribution_text=EXCLUDED.attribution_text, attribution_url=EXCLUDED.attribution_url, internal_notes=EXCLUDED.internal_notes, updated_at=now(), updated_by='website_admin'`;
  if (status === "approved") await prisma.$executeRaw`UPDATE photo_leads SET status='approved', updated_at=now(), updated_by='website_admin' WHERE id=${leadId}::uuid`;
  done(venueId);
}

async function assignImage(form: FormData) {
  "use server";
  const permissionId = requireValue(form, "photo_permission_id");
  const venueId = requireValue(form, "venue_id");
  const assetId = randomUUID();
  const linkId = randomUUID();
  const rightId = randomUUID();
  const imageUrl = safeUrl(requireValue(form, "image_url"));
  await prisma.$transaction(async (tx) => {
    const approved = await tx.$queryRaw<Array<{ photographer_id: string; photo_lead_id: string; attribution_text: string | null; attribution_url: string | null; source_url: string }>>`
      SELECT pp.photographer_id, pp.photo_lead_id, pp.attribution_text, pp.attribution_url, pl.source_url
      FROM photo_permissions pp JOIN photo_leads pl ON pl.id=pp.photo_lead_id
      WHERE pp.id=${permissionId}::uuid AND pp.venue_id=${venueId}::uuid AND pp.status='approved'`;
    if (approved.length !== 1) throw new Error("Bilder können nur einer genehmigten Freigabe zugeordnet werden");
    const permission = approved[0];
    await tx.$executeRaw`INSERT INTO media_assets (id, storage_uri, workflow_status, metadata_json, created_at, updated_at, created_by, updated_by) VALUES (${assetId}::uuid, ${imageUrl}, 'approved', '{}'::json, now(), now(), 'website_admin', 'website_admin')`;
    await tx.$executeRaw`INSERT INTO media_entity_links (id, media_asset_id, venue_id, is_primary, sort_order, alt_text, metadata_json, created_at, updated_at, created_by, updated_by) VALUES (${linkId}::uuid, ${assetId}::uuid, ${venueId}::uuid, ${form.get("is_primary") === "on"}, ${Number(value(form, "sort_order") || 0)}, ${optional(form, "alt_text")}, '{}'::json, now(), now(), 'website_admin', 'website_admin')`;
    await tx.$executeRaw`INSERT INTO media_rights (id, media_asset_id, photographer_id, photo_lead_id, photo_permission_id, permission_status, photo_source, attribution_text, attribution_url, permission_received_at, permission_source, metadata_json, created_at, updated_at, created_by, updated_by) VALUES (${rightId}::uuid, ${assetId}::uuid, ${permission.photographer_id}::uuid, ${permission.photo_lead_id}::uuid, ${permissionId}::uuid, ${permission.attribution_text ? "allowed_with_attribution" : "allowed"}, ${permission.source_url}, ${permission.attribution_text}, ${permission.attribution_url}, now(), 'photo_discovery', '{}'::json, now(), now(), 'website_admin', 'website_admin')`;
  });
  done(venueId);
}

async function data() {
  const venues = await prisma.$queryRaw<Venue[]>`SELECT v.id::text, v.name, v.canonical_slug AS slug, substring(p.metadata_json->>'website_priority' from 7)::int AS rank,
    (SELECT count(*) FROM media_entity_links ml JOIN media_assets ma ON ma.id=ml.media_asset_id WHERE ml.venue_id=v.id AND ma.workflow_status='approved') AS photo_count,
    (SELECT count(*) FROM photo_leads l WHERE l.venue_id=v.id) AS lead_count,
    (SELECT count(DISTINCT l.photographer_id) FROM photo_leads l WHERE l.venue_id=v.id) AS photographer_count,
    (SELECT count(*) FROM photo_permissions pp WHERE pp.venue_id=v.id AND pp.status='pending') AS open_count,
    (SELECT count(*) FROM photo_leads l WHERE l.venue_id=v.id AND l.status='contacted') AS contacted_count,
    (SELECT count(*) FROM photo_permissions pp WHERE pp.venue_id=v.id AND pp.status='approved') AS approved_count,
    (SELECT count(*) FROM photo_permissions pp WHERE pp.venue_id=v.id AND pp.status='rejected') AS rejected_count
    FROM wedding_venues v JOIN public_entity_profiles p ON p.entity_id=v.id AND p.entity_type='wedding_venue' AND p.kind='website_v1'
    WHERE p.metadata_json->>'website_priority' LIKE 'Top20:%' ORDER BY rank`;
  const photographers = await prisma.$queryRaw<Photographer[]>`SELECT id::text, name, website_url, instagram_url, email, region, notes FROM photographers ORDER BY name`;
  const leads = await prisma.$queryRaw<Lead[]>`SELECT l.id::text, l.venue_id::text, l.photographer_id::text, ph.name AS photographer_name, l.source_type, l.source_url, l.source_title, l.confidence_score, l.status, l.notes, ph.email, pp.id::text AS permission_id, pp.status AS permission_status, pp.attribution_text, pp.attribution_url
    FROM photo_leads l JOIN photographers ph ON ph.id=l.photographer_id LEFT JOIN photo_permissions pp ON pp.photo_lead_id=l.id ORDER BY l.discovered_at DESC`;
  return { venues, photographers, leads };
}

const n = (number: bigint) => Number(number);
const input = "focus-ring rounded-lg border border-linen px-3 py-2";

export default async function PhotoDiscoveryPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const { venues, photographers, leads } = await data();
  const selected = venues.find((venue) => venue.id === params.venue) ?? venues[0];
  const selectedLeads = selected ? leads.filter((lead) => lead.venue_id === selected.id) : [];
  return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
    <div><p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Admin</p><h1 className="mt-2 text-4xl font-semibold text-ink">Photo Discovery</h1><p className="mt-2 text-soft-ink">Semi-manueller MVP für die strukturiert markierten Top‑20‑Trauorte.</p></div>
    <form><select name="venue" defaultValue={selected?.id} className={input}>{venues.map((venue) => <option key={venue.id} value={venue.id}>#{venue.rank} {venue.name}</option>)}</select><button className="ml-2 rounded-lg bg-sage px-4 py-2 font-semibold text-white">Anzeigen</button></form>
    {selected ? <>
      <section className="grid gap-3 sm:grid-cols-4 lg:grid-cols-7">{[["Fotos", n(selected.photo_count)], ["Leads", n(selected.lead_count)], ["Fotografen", n(selected.photographer_count)], ["Offen", n(selected.open_count)], ["Kontaktiert", n(selected.contacted_count)], ["Freigegeben", n(selected.approved_count)], ["Abgelehnt", n(selected.rejected_count)]].map(([label, count]) => <div key={String(label)} className="rounded-xl border border-linen bg-white p-4 shadow-soft"><div className="text-2xl font-semibold text-ink">{String(count)}</div><div className="text-sm text-soft-ink">{String(label)}</div></div>)}</section>
      <section className="grid gap-4 rounded-xl border border-linen bg-white p-5 shadow-soft lg:grid-cols-2">
        <form action={createPhotographer} className="grid gap-3"><h2 className="text-xl font-semibold">Fotograf ergänzen</h2><input type="hidden" name="venue_id" value={selected.id}/><input required name="name" placeholder="Name" className={input}/><input name="website_url" placeholder="Website" className={input}/><input name="instagram_url" placeholder="Instagram" className={input}/><input type="email" name="email" placeholder="E-Mail" className={input}/><input name="region" placeholder="Region" className={input}/><textarea name="notes" placeholder="Notiz" className={input}/><button className="rounded-lg bg-sage px-4 py-2 font-semibold text-white">Fotograf speichern</button></form>
        <form action={createLead} className="grid gap-3"><h2 className="text-xl font-semibold">Foto-Lead erfassen</h2><input type="hidden" name="venue_id" value={selected.id}/><select required name="photographer_id" className={input}><option value="">Fotograf wählen</option>{photographers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select name="source_type" className={input}>{sourceTypes.map((item) => <option key={item}>{item}</option>)}</select><input required type="url" name="source_url" placeholder="Fundstellen-URL" className={input}/><input name="source_title" placeholder="Titel" className={input}/><input required type="number" min="0" max="100" name="confidence_score" defaultValue="50" className={input}/><textarea name="notes" placeholder="Notiz" className={input}/><button className="rounded-lg bg-sage px-4 py-2 font-semibold text-white">Lead speichern</button></form>
      </section>
      <section className="grid gap-4"><h2 className="text-2xl font-semibold">Leads</h2><div className="hidden grid-cols-6 gap-3 px-5 text-xs font-semibold uppercase tracking-wide text-soft-ink lg:grid"><span>Fotograf</span><span className="col-span-2">Fundstelle</span><span>Score</span><span>Status / Kontakt</span><span>Aktion</span></div>{selectedLeads.map((lead) => <article key={lead.id} className="rounded-xl border border-linen bg-white p-5 shadow-soft">
        <div className="flex flex-wrap justify-between gap-3"><div><h3 className="text-lg font-semibold">{lead.photographer_name}</h3><a href={lead.source_url} target="_blank" rel="noreferrer" className="text-sm text-sage underline">{lead.source_title || lead.source_url}</a><p className="text-sm text-soft-ink">{lead.source_type} · Score {lead.confidence_score} · Kontakt {lead.email || "–"}</p></div><span className="font-semibold">{lead.status}</span></div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <form action={updateLead} className="grid gap-2"><input type="hidden" name="id" value={lead.id}/><input type="hidden" name="venue_id" value={selected.id}/><select name="status" defaultValue={lead.status} className={input}>{leadStatuses.map((item) => <option key={item}>{item}</option>)}</select><input type="number" min="0" max="100" name="confidence_score" defaultValue={lead.confidence_score} className={input}/><textarea name="notes" defaultValue={lead.notes || ""} placeholder="Lead-Notiz" className={input}/><button className="rounded-lg border border-sage px-3 py-2 font-semibold text-sage">Lead aktualisieren</button></form>
          <form action={savePermission} className="grid gap-2"><input type="hidden" name="photo_lead_id" value={lead.id}/><input type="hidden" name="venue_id" value={selected.id}/><select name="status" defaultValue={lead.permission_status || "pending"} className={input}>{permissionStatuses.map((item) => <option key={item}>{item}</option>)}</select><input name="attribution_text" defaultValue={lead.attribution_text || lead.photographer_name} placeholder="Attributionstext" className={input}/><input type="url" name="attribution_url" defaultValue={lead.attribution_url || ""} placeholder="Attribution-Link" className={input}/><textarea name="usage_conditions" placeholder="Nutzungsbedingungen" className={input}/><textarea name="internal_notes" placeholder="Interne Notiz" className={input}/><button className="rounded-lg border border-sage px-3 py-2 font-semibold text-sage">Freigabe dokumentieren</button></form>
          {lead.permission_status === "approved" && lead.permission_id ? <form action={assignImage} className="grid gap-2"><input type="hidden" name="photo_permission_id" value={lead.permission_id}/><input type="hidden" name="venue_id" value={selected.id}/><input required type="url" name="image_url" placeholder="Bild-URL" className={input}/><input name="alt_text" placeholder="Alt-Text" className={input}/><input type="number" name="sort_order" defaultValue="0" className={input}/><label className="text-sm"><input type="checkbox" name="is_primary"/> Primärbild</label><button className="rounded-lg bg-sage px-3 py-2 font-semibold text-white">Freigegebenes Bild zuordnen</button></form> : <p className="text-sm text-soft-ink">Bildzuordnung wird erst nach Freigabe aktiviert.</p>}
        </div>
      </article>)}{selectedLeads.length === 0 ? <p className="rounded-xl border border-linen bg-white p-5 text-soft-ink">Noch keine Foto-Leads.</p> : null}</section>
      <details className="rounded-xl border border-linen bg-white p-5"><summary className="cursor-pointer font-semibold">Fotografen bearbeiten</summary><div className="mt-4 grid gap-3">{photographers.map((item) => <form action={updatePhotographer} key={item.id} className="grid gap-2 border-t border-linen pt-3 sm:grid-cols-3"><input type="hidden" name="id" value={item.id}/><input type="hidden" name="venue_id" value={selected.id}/><input required name="name" defaultValue={item.name} className={input}/><input name="website_url" defaultValue={item.website_url || ""} placeholder="Website" className={input}/><input name="instagram_url" defaultValue={item.instagram_url || ""} placeholder="Instagram" className={input}/><input name="email" defaultValue={item.email || ""} placeholder="E-Mail" className={input}/><input name="region" defaultValue={item.region || ""} placeholder="Region" className={input}/><input name="notes" defaultValue={item.notes || ""} placeholder="Notiz" className={input}/><button className="rounded-lg border border-sage px-3 py-2 font-semibold text-sage sm:col-span-3">Speichern</button></form>)}</div></details>
    </> : <p>Keine Top‑20‑Trauorte gefunden.</p>}
  </main>;
}
