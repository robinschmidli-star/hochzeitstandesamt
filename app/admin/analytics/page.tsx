import { prisma } from "@/lib/prisma";
import { aggregateWeeklyMetrics, change, weeklyReportPeriod, renderWeeklyReport } from "@/lib/weekly-analytics";
export const dynamic = "force-dynamic";
async function period(from:Date,to:Date,previousFrom:Date) {
  const select={eventName:true,sessionId:true,visitorHash:true,path:true,properties:true,occurredAt:true} as const;
  const [current,previous,leads,priorLeads]=await Promise.all([
    prisma.analyticsEvent.findMany({where:{occurredAt:{gte:from,lt:to}},select}),
    prisma.analyticsEvent.findMany({where:{occurredAt:{gte:previousFrom,lt:from}},select}),
    prisma.websiteLead.count({where:{createdAt:{gte:from,lt:to}}}),
    prisma.websiteLead.count({where:{createdAt:{gte:previousFrom,lt:from}}})
  ]);
  return {current:aggregateWeeklyMetrics(current,leads),previous:aggregateWeeklyMetrics(previous,priorLeads)};
}
export default async function AnalyticsPage() {
  const now=new Date(),week=weeklyReportPeriod(now);
  const [weekly,...periods]=await Promise.all([period(week.from,week.until,week.previousFrom),...[1,7,30].map(days=>period(new Date(now.getTime()-days*86400000),now,new Date(now.getTime()-2*days*86400000)))]);
  return <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10">
    <h1 className="text-4xl font-semibold">Analytics</h1>
    <section className="grid gap-4 md:grid-cols-3">{periods.map((item,index)=><article key={index} className="rounded-xl border p-5"><h2>Letzte {[1,7,30][index]} Tage (rollierend)</h2><p>{item.current.visitors} eindeutige Browser ({change(item.current.visitors,item.previous.visitors)})</p><p>{item.current.pageViews} Seitenaufrufe · {item.current.leads} gespeicherte Website-Anfragen</p><table className="w-full text-left"><thead><tr><th>Aktion</th><th>Anzahl</th><th>Browser</th></tr></thead><tbody>{item.current.summary.metrics.map(row=><tr key={row.name}><td>{row.label}</td><td>{row.measured?row.actions:"nicht erfasst"}</td><td>{row.measured?row.browsers:"nicht erfasst"}</td></tr>)}</tbody></table></article>)}</section>
    <section><h2 className="text-2xl">Abgeschlossene Schweizer Kalenderwoche · identisch zum Wochenreport</h2><iframe title="Wochenreport" sandbox="" className="h-[1600px] w-full border" srcDoc={renderWeeklyReport({...weekly,from:week.from,until:new Date(week.until.getTime()-1),week:week.week})} /></section>
    <p>Messrevision 3 gilt ab tatsächlichem Deployment. Browser sind keine Personen. Historische Qualität und nicht erfasste Angaben bleiben unbekannt.</p>
  </main>;
}
