import { readFile } from "node:fs/promises";
import path from "node:path";

type Lead = {
  lead_type: string;
  source_page: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  canton: string;
  wedding_location: string;
  wedding_date: string;
  legal_topic: string;
  message: string;
  consent_privacy: boolean;
  consent_forwarding: boolean;
  created_at: string;
  status: "new" | "contacted" | "forwarded" | "closed";
};

async function getLeads() {
  try {
    const file = await readFile(path.join(process.cwd(), "storage", "leads.jsonl"), "utf8");
    return file
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Lead)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  } catch {
    return [];
  }
}

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const leads = (await getLeads()).filter((lead) => {
    if (params.canton && lead.canton !== params.canton) return false;
    if (params.topic && lead.legal_topic !== params.topic) return false;
    if (params.location && !lead.wedding_location.toLowerCase().includes(params.location.toLowerCase())) return false;
    if (params.status && lead.status !== params.status) return false;
    if (params.date && !lead.created_at.startsWith(params.date)) return false;
    return true;
  });

  const cantons = Array.from(new Set(leads.map((lead) => lead.canton).filter(Boolean))).sort();
  const topics = Array.from(new Set(leads.map((lead) => lead.legal_topic).filter(Boolean))).sort();
  const statuses = ["new", "contacted", "forwarded", "closed"];

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Admin</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Leads</h1>
      </div>

      <form className="grid gap-3 rounded-xl border border-linen bg-white p-5 shadow-soft sm:grid-cols-5">
        <select name="canton" defaultValue={params.canton ?? ""} className="focus-ring rounded-lg border border-linen px-3 py-3">
          <option value="">Alle Kantone</option>
          {cantons.map((canton) => <option key={canton}>{canton}</option>)}
        </select>
        <select name="topic" defaultValue={params.topic ?? ""} className="focus-ring rounded-lg border border-linen px-3 py-3">
          <option value="">Alle Themen</option>
          {topics.map((topic) => <option key={topic}>{topic}</option>)}
        </select>
        <input name="location" defaultValue={params.location ?? ""} placeholder="Heiratsort" className="focus-ring rounded-lg border border-linen px-3 py-3" />
        <input name="date" defaultValue={params.date ?? ""} type="date" className="focus-ring rounded-lg border border-linen px-3 py-3" />
        <select name="status" defaultValue={params.status ?? ""} className="focus-ring rounded-lg border border-linen px-3 py-3">
          <option value="">Alle Status</option>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
        <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white sm:col-span-5">Filtern</button>
      </form>

      <div className="grid gap-3">
        {leads.map((lead) => (
          <article key={`${lead.created_at}-${lead.email}`} className="rounded-xl border border-linen bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-champagne">{lead.lead_type} · {lead.status}</p>
                <h2 className="mt-1 text-xl font-semibold text-ink">{lead.first_name} {lead.last_name}</h2>
                <p className="mt-1 text-sm text-soft-ink">{lead.email}{lead.phone ? ` · ${lead.phone}` : ""}</p>
              </div>
              <p className="text-sm text-soft-ink">{new Date(lead.created_at).toLocaleString("de-CH")}</p>
            </div>
            <dl className="mt-4 grid gap-2 text-sm text-soft-ink sm:grid-cols-3">
              <div><dt className="font-semibold text-ink">Kanton</dt><dd>{lead.canton || "-"}</dd></div>
              <div><dt className="font-semibold text-ink">Thema</dt><dd>{lead.legal_topic || "-"}</dd></div>
              <div><dt className="font-semibold text-ink">Heiratsort</dt><dd>{lead.wedding_location || "-"}</dd></div>
              <div><dt className="font-semibold text-ink">Datum</dt><dd>{lead.wedding_date || "-"}</dd></div>
              <div><dt className="font-semibold text-ink">Adresse</dt><dd>{lead.address || "-"}</dd></div>
              <div><dt className="font-semibold text-ink">Quelle</dt><dd>{lead.source_page}</dd></div>
            </dl>
            {lead.message ? <p className="mt-4 rounded-lg bg-paper p-3 text-sm leading-6 text-soft-ink">{lead.message}</p> : null}
          </article>
        ))}
        {leads.length === 0 ? <p className="rounded-xl border border-linen bg-white p-5 text-soft-ink shadow-soft">Noch keine passenden Leads vorhanden.</p> : null}
      </div>
    </main>
  );
}
