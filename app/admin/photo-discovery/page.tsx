import { prisma } from "@/lib/prisma";

type SummaryRow = { status: string; count: bigint };
type LeadRow = {
  id: string;
  target_slug: string;
  source: string;
  source_url: string;
  confidence: number;
  status: string;
  photographer_name: string | null;
  created_at: Date;
};

async function getSummary() {
  return prisma.$queryRaw<SummaryRow[]>`
    SELECT status, COUNT(*)::bigint AS count
    FROM photo_leads
    GROUP BY status
    ORDER BY status ASC
  `;
}

async function getRecentLeads() {
  return prisma.$queryRaw<LeadRow[]>`
    SELECT
      pl.id::text,
      pl.target_slug,
      pl.source,
      pl.source_url,
      pl.confidence,
      pl.status,
      p.name AS photographer_name,
      pl.created_at
    FROM photo_leads pl
    LEFT JOIN photographers p ON p.id = pl.photographer_id
    ORDER BY pl.confidence DESC, pl.created_at DESC
    LIMIT 100
  `;
}

export default async function PhotoDiscoveryAdminPage() {
  const [summaryRows, leads] = await Promise.all([getSummary(), getRecentLeads()]);
  const counts = Object.fromEntries(summaryRows.map((row) => [row.status, Number(row.count)]));
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Admin · Bilder</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Photo Discovery</h1>
        <p className="mt-2 max-w-3xl text-soft-ink">
          Interner MVP-Workflow für Trauort → Fotograf → Fundstelle → Freigabe → veröffentlichte Bilder.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Treffer gesamt" value={total} />
        <Stat label="Neu gefunden" value={counts.found ?? 0} />
        <Stat label="Kontaktiert" value={counts.contacted ?? 0} />
        <Stat label="Freigegeben" value={(counts.approved ?? 0) + (counts.published ?? 0)} />
      </section>

      <section className="overflow-hidden rounded-xl border border-linen bg-white shadow-soft">
        <div className="border-b border-linen px-5 py-4">
          <h2 className="text-xl font-semibold text-ink">Priorisierte Treffer</h2>
          <p className="mt-1 text-sm text-soft-ink">Höchster Score zuerst; maximal 100 Treffer.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-paper text-ink">
              <tr>
                <th className="px-4 py-3">Trauort</th>
                <th className="px-4 py-3">Fotograf</th>
                <th className="px-4 py-3">Quelle</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Fundstelle</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-linen align-top">
                  <td className="px-4 py-3 font-medium text-ink">{lead.target_slug}</td>
                  <td className="px-4 py-3 text-soft-ink">{lead.photographer_name ?? "–"}</td>
                  <td className="px-4 py-3 text-soft-ink">{lead.source}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{lead.confidence}</td>
                  <td className="px-4 py-3 text-soft-ink">{lead.status}</td>
                  <td className="px-4 py-3">
                    <a href={lead.source_url} target="_blank" rel="noreferrer" className="font-semibold text-sage underline underline-offset-2">
                      öffnen
                    </a>
                  </td>
                </tr>
              ))}
              {leads.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-soft-ink">Noch keine Photo-Leads gespeichert.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-linen bg-white p-5 shadow-soft">
      <p className="text-sm text-soft-ink">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}
