/** Run after the documented browser fixture, against an explicitly local test database. */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { isIsolatedAnalyticsTest } from "../lib/analytics-test-environment";
import { summarizeAnalytics, eventProperties } from "../lib/analytics-summary";
import { weeklyReportPeriod, renderWeeklyReport } from "../lib/weekly-analytics";
async function main() {
  process.loadEnvFile(".env.local");
  assert.ok(isIsolatedAnalyticsTest(), "Refusing to run outside a dedicated loopback test database");
  assert.equal(process.env.RESEND_API_KEY, undefined, "Mail credentials must be absent");
  const prisma=new PrismaClient();
  try {
    const timezone=await prisma.$queryRaw<Array<{timezone:string}>>`SELECT current_setting('TimeZone') AS timezone`;
    assert.equal(timezone[0].timezone,"UTC","The test database must use UTC");
    const events=await prisma.analyticsEvent.findMany({orderBy:{occurredAt:"asc"}});
    assert.ok(events.length>0);
    assert.ok(events.every(e=>eventProperties(e).traffic_type==="test"), "No unmarked data may be moved");
    assert.ok(events.every(e=>!e.path.includes("?") && !e.path.includes("#")));
    assert.ok(!JSON.stringify(events.map(e=>e.properties)).match(/example\.invalid|mailto:|https?:|search_query|referrer|email"|phone"/));
    const summary=summarizeAnalytics(events,true);
    const metric=(name:string)=>summary.metrics.find(row=>row.name===name)!;
    assert.equal(summary.visitors,2);
    assert.equal(metric("search_started").actions,2);assert.equal(metric("search_started").browsers,1);
    assert.equal(metric("search_filter_changed").actions,1);
    assert.equal(metric("search_results_viewed").actions,3);
    assert.equal(metric("venue_opened").actions,3);assert.equal(metric("location_view").actions,1);
    assert.equal(metric("favorite_added").actions,1);assert.equal(metric("external_link_clicked").actions,4);
    assert.deepEqual(summary.journey,{search:1,venue:1,contact:1,measured:true});
    assert.equal(summary.directVenue,1);
    const related=events.filter(e=>e.eventName==="venue_opened" && !e.path.startsWith("/fr/"));
    assert.equal(new Set(related.map(e=>e.visitorHash)).size,1);
    assert.equal(new Set(related.map(e=>e.sessionId)).size,1, "Same-origin tabs must share a session");
    const booking=events.filter(e=>eventProperties(e).link_purpose==="booking");assert.equal(booking.length,1);
    assert.equal(events.filter(e=>eventProperties(e).link_purpose==="source").length,2);
    assert.equal(summarizeAnalytics(events).visitors,0, "Test traffic must be absent from business metrics");
    assert.equal(await prisma.websiteLead.count(),1);
    const lead=await prisma.websiteLead.findFirstOrThrow();assert.equal(lead.leadType,"search_save");
    assert.equal(lead.email,"analytics-e2e@example.invalid");
    // Move synthetic timestamps only, preserving observed ordering, into a completed report week.
    const period=weeklyReportPeriod(new Date());
    const target=new Date(period.from.getTime()+3600000),delta=target.getTime()-events[0].occurredAt.getTime();
    await prisma.$executeRaw`UPDATE analytics_events SET occurred_at=occurred_at+(${delta} * INTERVAL '1 millisecond') WHERE properties->>'traffic_type'='test'`;
    await prisma.websiteLead.update({where:{id:lead.id},data:{createdAt:target,status:"test"}});
    const base="http://127.0.0.1:3120";
    const authorization=`Bearer ${process.env.CRON_SECRET}`;
    const response=await fetch(`${base}/api/cron/weekly-analytics?dryRun=1&from=${period.fromDay}`,{headers:{authorization}});
    assert.equal(response.status,200);const report=await response.json();assert.equal(report.dryRun,true);
    assert.equal(report.current.visitors,2);assert.equal(report.current.pageViews,7);
    assert.equal(report.current.searches,2);assert.equal(report.current.venueViews,3);assert.equal(report.current.officeViews,1);
    assert.equal(report.current.leads,1);assert.deepEqual(report.current.summary.journey,summary.journey);
    const admin=await fetch(`${base}/admin/analytics`,{headers:{authorization:`Basic ${Buffer.from(`admin:${process.env.ADMIN_PASSWORD}`).toString("base64")}`}});
    assert.equal(admin.status,200);const html=await admin.text();
    const attribute=html.match(/srcDoc="([^"]*)"/i)?.[1];assert.ok(attribute,"Dashboard report iframe must exist");
    const rendered=attribute.replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
    const expected=renderWeeklyReport({current:report.current,previous:report.previous,from:period.from,until:new Date(period.until.getTime()-1),week:period.week});
    const preview=await fetch(`${base}/api/cron/weekly-analytics?dryRun=1&format=html&from=${period.fromDay}`,{headers:{authorization}});
    assert.equal(preview.status,200);assert.equal(await preview.text(),expected,"HTTP report preview must match the shared renderer");
    assert.equal(rendered,expected,"Dashboard and weekly report HTML must be identical");
    const blocked=await fetch(`${base}/api/cron/weekly-analytics?from=${period.fromDay}`,{headers:{authorization}});
    assert.equal(blocked.status,403,"Test runtime must reject any report sending");
    const evidence={database:"dedicated local PostgreSQL",events:events.length,browsers:summary.visitors,pageViews:report.current.pageViews,searchActions:2,searchBrowsers:1,venueViews:3,officeViews:1,favorites:1,links:4,qualifiedContactBrowsers:1,directVenueBrowsers:1,storedTestLeads:1,sameOriginTabsShareSession:true,defaultBusinessBrowsers:0,dashboardReportHtmlIdentical:true,emailSendBlocked:true,reportFrom:period.from.toISOString(),reportUntil:period.until.toISOString()};
    await fs.writeFile("reports/analytics-e2e-20261020.json",JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));
  } finally {await prisma.$disconnect();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
