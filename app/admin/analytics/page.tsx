import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const eventLabels: Record<string, string> = { page_view: "Page Views", search_completed: "Suchen", location_view: "Location Views", favorite_added: "Favoriten", lead_created: "Leads" };
async function period(days: number) {
  const to = new Date(); const from = new Date(to); from.setUTCDate(from.getUTCDate() - days);
  const previousFrom = new Date(from); previousFrom.setUTCDate(previousFrom.getUTCDate() - days);
  const [current, previous] = await Promise.all([
    prisma.analyticsEvent.findMany({ where: { occurredAt: { gte: from, lt: to } }, select: { eventName: true, sessionId: true, visitorHash: true, path: true } }),
    prisma.analyticsEvent.findMany({ where: { occurredAt: { gte: previousFrom, lt: from } }, select: { eventName: true, visitorHash: true } })
  ]);
  const count = (name: string) => current.filter((event) => event.eventName === name).length;
  const previousCount = (name: string) => previous.filter((event) => event.eventName === name).length;
  return { days, current, visitors: new Set(current.map((event) => event.visitorHash)).size, previousVisitors: new Set(previous.map((event) => event.visitorHash)).size, count, previousCount };
}
function change(current: number, previous: number) { return previous ? `${current - previous >= 0 ? "+" : ""}${Math.round(((current - previous) / previous) * 100)}%` : "–"; }
export default async function AnalyticsPage() {
  const periods = await Promise.all([period(1), period(7), period(30)]);
  const funnelNames = ["page_view", "search_completed", "location_view", "favorite_added", "lead_created"];
  return <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
    <div><p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Admin</p><h1 className="mt-2 text-4xl font-semibold text-ink">Analytics</h1></div>
    <section className="grid gap-4 md:grid-cols-3">{periods.map((item) => <article key={item.days} className="rounded-xl border border-linen bg-white p-5 shadow-soft"><h2 className="text-xl font-semibold">Letzte {item.days} Tage</h2><dl className="mt-4 grid gap-2 text-sm"><div className="flex justify-between"><dt>Besucher</dt><dd>{item.visitors} <span className="text-soft-ink">({change(item.visitors, item.previousVisitors)})</span></dd></div>{Object.entries(eventLabels).map(([name, label]) => <div key={name} className="flex justify-between"><dt>{label}</dt><dd>{item.count(name)} <span className="text-soft-ink">({change(item.count(name), item.previousCount(name))})</span></dd></div>)}</dl></article>)}</section>
    <section className="rounded-xl border border-linen bg-white p-5 shadow-soft"><h2 className="text-2xl font-semibold">Funnel · 30 Tage</h2><div className="mt-4 grid gap-3 md:grid-cols-5">{funnelNames.map((name, index) => { const value = periods[2].count(name); const previous = index ? periods[2].count(funnelNames[index - 1]) : value; const visitors = periods[2].visitors; return <div key={name} className="rounded-lg bg-paper p-4"><p className="text-sm text-soft-ink">{eventLabels[name]}</p><p className="mt-1 text-2xl font-semibold">{value}</p><p className="text-xs text-soft-ink">{previous ? Math.round(value / previous * 100) : 0}% vorheriger Schritt · {visitors ? Math.round(value / visitors * 100) : 0}% Besucher</p></div>; })}</div></section>
  </main>;
}
