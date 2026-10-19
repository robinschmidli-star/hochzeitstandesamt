import { prisma } from "@/lib/prisma";
import { summarizeAnalytics } from "@/lib/analytics-summary";

export const dynamic = "force-dynamic";

const eventLabels: Record<string, string> = { page_view: "Page Views", search_completed: "Suchen", location_view: "Zivilstandsamt-Aufrufe", venue_opened: "Trauort-Aufrufe", favorite_added: "Favoriten", lead_submitted: "Anfrage-Tracking" };
async function period(days: number) {
  const to = new Date(); const from = new Date(to); from.setUTCDate(from.getUTCDate() - days);
  const previousFrom = new Date(from); previousFrom.setUTCDate(previousFrom.getUTCDate() - days);
  const [current, previous] = await Promise.all([
    prisma.analyticsEvent.findMany({ where: { occurredAt: { gte: from, lt: to } }, select: { eventName: true, sessionId: true, visitorHash: true, path: true, properties: true, occurredAt: true } }),
    prisma.analyticsEvent.findMany({ where: { occurredAt: { gte: previousFrom, lt: from } }, select: { eventName: true, visitorHash: true, sessionId: true, path: true, properties: true, occurredAt: true } })
  ]);
  const summary = summarizeAnalytics(current); const prior = summarizeAnalytics(previous);
  const count = (name: string) => summary.metrics.find(row => row.name === name)?.actions ?? 0;
  const previousCount = (name: string) => prior.metrics.find(row => row.name === name)?.actions ?? 0;
  return { days, current, summary, visitors: summary.visitors, previousVisitors: prior.visitors, count, previousCount };
}
function change(current: number, previous: number) { return previous ? `${current - previous >= 0 ? "+" : ""}${Math.round(((current - previous) / previous) * 100)}%` : "–"; }
export default async function AnalyticsPage() {
  const periods = await Promise.all([period(1), period(7), period(30)]);
  const summary = periods[2].summary;
  return <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
    <div><p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Admin</p><h1 className="mt-2 text-4xl font-semibold text-ink">Analytics</h1></div>
    <section className="grid gap-4 md:grid-cols-3">{periods.map((item) => <article key={item.days} className="rounded-xl border border-linen bg-white p-5 shadow-soft"><h2 className="text-xl font-semibold">Letzte {item.days} Tage</h2><dl className="mt-4 grid gap-2 text-sm"><div className="flex justify-between"><dt>Besucher</dt><dd>{item.visitors} <span className="text-soft-ink">({change(item.visitors, item.previousVisitors)})</span></dd></div>{Object.entries(eventLabels).map(([name, label]) => <div key={name} className="flex justify-between"><dt>{label}</dt><dd>{item.count(name)} <span className="text-soft-ink">({change(item.count(name), item.previousCount(name))})</span></dd></div>)}</dl></article>)}</section>
    <section className="rounded-xl border border-linen bg-white p-5 shadow-soft"><h2 className="text-2xl font-semibold">Nutzung · 30 Tage</h2><p>Aktionen und eindeutige Browser getrennt. Trauorte und Zivilstandsämter sind unterschiedliche Seiten.</p><table className="mt-4 w-full text-left"><thead><tr><th>Ereignis</th><th>Aktionen</th><th>Browser</th></tr></thead><tbody>{summary.metrics.map(row => <tr key={row.name}><td>{row.label}</td><td>{row.actions}</td><td>{row.browsers}</td></tr>)}</tbody></table><h3 className="mt-6 text-xl">Suchverlauf innerhalb derselben Session</h3><p>{summary.journey.search} Browser mit Suche → {summary.journey.venue} mit späterem Trauort-Aufruf → {summary.journey.contact} mit späterem Kontakt-/Linkklick.</p><p>Browser sind keine Personen; Kontaktklicks sind keine bestätigten Anfragen. Verwaltungs- und Verifikationsereignisse sind aus dieser Tabelle ausgeschlossen.</p></section>
  </main>;
}
