import { prisma } from "@/lib/prisma";
import { VerificationAdminCreate } from "@/components/VerificationAdminCreate";
import { publicOfficesForVerification, type VerificationSnapshot } from "@/lib/verification";

export const dynamic="force-dynamic";
type Proposal={id:string;entity_type:string;entity_id:string;field_name:string;old_value:unknown;proposed_value:unknown;source_name:string;created_at:Date;snapshot:VerificationSnapshot};
export default async function VerificationsAdminPage(){
  const [offices,proposals,requests]=await Promise.all([
    publicOfficesForVerification(),
    prisma.$queryRaw<Proposal[]>`SELECT p.id::text,p.entity_type,p.entity_id::text,p.field_name,p.old_value,p.proposed_value,r.source_name,p.created_at,r.snapshot FROM verification_change_proposals p JOIN verification_requests r ON r.id=p.verification_request_id WHERE p.status='pending' ORDER BY p.created_at`,
    prisma.$queryRaw<Array<{id:string;source_name:string;venue_id:string|null;status:string;language_code:string;expires_at:Date}>>`SELECT id::text,source_name,venue_id::text,status,language_code,expires_at FROM verification_requests ORDER BY created_at DESC LIMIT 50`
  ]);
  const display=(value:unknown)=>value==null?"–":typeof value==="string"?value:JSON.stringify(value);
  const proposalName=(proposal:Proposal)=>proposal.entity_type==="civil_registry_office"
    ? proposal.snapshot.office.name
    : proposal.snapshot.venues.find((venue)=>venue.id===proposal.entity_id)?.name ?? proposal.source_name;
  return <main className="mx-auto grid max-w-6xl gap-7 px-4 py-10 sm:px-6"><div><p className="text-sm font-semibold uppercase tracking-widest text-champagne">Admin</p><h1 className="mt-2 text-4xl font-semibold">Datenverifikation</h1></div><VerificationAdminCreate offices={offices}/>
    <section><h2 className="mb-3 text-2xl font-semibold">Offene Änderungen</h2><div className="grid gap-3">{proposals.map(p=><article key={p.id} className="rounded-xl border border-linen bg-white p-5"><h3 className="text-lg font-semibold">{proposalName(p)}</h3><p className="mt-2 font-medium">{p.field_name}</p><p className="text-sm text-soft-ink">Aktuell: {display(p.old_value)}</p><p className="text-sm text-ink">Gemeldet: {display(p.proposed_value)}</p><p className="mt-1 text-xs text-soft-ink">Quelle: {p.source_name}</p><form action={`/admin/api/verification-proposals/${p.id}`} method="post" className="mt-4 flex gap-2"><button name="decision" value="approved" className="rounded-lg bg-sage px-4 py-2 font-semibold text-white">Übernehmen</button><button name="decision" value="rejected" className="rounded-lg border border-linen px-4 py-2 font-semibold">Ablehnen</button></form></article>)}{!proposals.length?<p className="rounded-xl border border-linen bg-white p-5 text-soft-ink">Keine offenen Vorschläge.</p>:null}</div></section>
    <section><h2 className="mb-3 text-2xl font-semibold">Letzte Links</h2><div className="overflow-x-auto rounded-xl border border-linen bg-white"><table className="min-w-full text-left text-sm"><thead><tr><th className="p-3">Amt / Trauort</th><th>Sprache</th><th>Status</th><th>Ablauf</th></tr></thead><tbody>{requests.map(r=><tr key={r.id} className="border-t border-linen"><td className="p-3">{r.source_name}</td><td>{r.language_code.toUpperCase()}</td><td>{r.status}</td><td>{r.expires_at.toLocaleDateString("de-CH")}</td></tr>)}</tbody></table></div></section>
  </main>;
}
