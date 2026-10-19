import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeAnalytics, renderAnalyticsSummary, type ReportEvent } from "../lib/analytics-summary";
import { analyticsPath, cleanProperties } from "../lib/analytics-policy";
import { entrySource, nextSession } from "../lib/analytics-session";
import { weeklyReportPeriod } from "../lib/weekly-analytics";
import { searchAnalyticsProperties } from "../lib/analytics-search";
import { campaignCode } from "../lib/analytics-session";
const event=(eventName:string,seconds:number,extra:Partial<ReportEvent>={}):ReportEvent=>({eventName,occurredAt:new Date(seconds*1000),visitorHash:"browser",sessionId:"session",path:"/",properties:{analytics_version:3,venue_id:"venue-a"},...extra});
test("actions, browsers, offices, and venue views remain separate",()=>{
  const s=summarizeAnalytics([event("search_started",1),event("search_started",2),event("location_view",3)]);
  assert.equal(s.metrics.find(r=>r.name==="search_started")?.actions,2);assert.equal(s.metrics.find(r=>r.name==="search_started")?.browsers,1);assert.equal(s.journey.venue,0);
});
test("journey requires ordered same-session same-venue qualified contact",()=>{
  const contact=event("external_link_clicked",3,{properties:{analytics_version:3,venue_id:"venue-a",contact_channel:"email",link_purpose:"contact"}});
  const base=[event("search_started",1),event("venue_opened",2)];
  assert.deepEqual(summarizeAnalytics([...base,contact]).journey,{search:1,venue:1,contact:1,measured:true});
  for(const invalid of [{...contact,sessionId:"other"},{...contact,visitorHash:"other"},{...contact,occurredAt:new Date(500)},{...contact,properties:{...contact.properties as object,venue_id:"venue-b"}},{...contact,properties:{...contact.properties as object,link_purpose:"source"}},{...contact,properties:{...contact.properties as object,link_purpose:"website"}}]) assert.equal(summarizeAnalytics([...base,invalid]).journey.contact,0);
  assert.equal(summarizeAnalytics([event("venue_opened",0),event("search_started",1),contact]).journey.contact,0);
  assert.equal(summarizeAnalytics([...base,contact,contact]).journey.contact,1);
});
test("direct venue entry and incomplete historical measurement",()=>{
  const s=summarizeAnalytics([event("page_view",0,{path:"/fr/trauort/a",properties:{analytics_version:3,session_entry_path:"/fr/trauort/a"}}),event("venue_opened",1)]);
  assert.equal(s.directVenue,1);assert.equal(s.journey.venue,0);
  const old=summarizeAnalytics([event("search_completed",0,{properties:{}})]);assert.equal(old.journey.measured,false);assert.match(renderAnalyticsSummary(old),/Nicht vollständig messbar/);
});
test("unknown source, private paths and PII are handled conservatively",()=>{
  for(const p of ["/verify/secret","/fr/admin?next=/","/api/analytics","//evil","/it/verify/venue/token"])assert.equal(analyticsPath(p),null);
  assert.equal(analyticsPath("/search?email=secret#token"),"/search");
  assert.deepEqual(cleanProperties({email:"private@example.ch",search_query:"private",referrer:"https://example.ch/?token=secret",utm_source:"someone@example.ch",contact_channel:"email"}),{contact_channel:"email"});
  assert.equal(summarizeAnalytics([event("page_view",1,{properties:{}})]).sources[0].label,"Unbekannt / nicht erfasst");
});
test("session renews at 30 minutes, preserves entry and serial tab updates",()=>{
  const first=nextSession(null,0,"search",()=>"a");
  const next=nextSession(first,1000,"internal",()=>"b");assert.equal(next.id,"a");assert.equal(next.source,"search");
  assert.equal(nextSession(next,1801000,"referral",()=>"b").id,"b");assert.equal(nextSession(next,500,"referral",()=>"b").last,1000);
  assert.equal(entrySource("https://www.google.ch/search?q=private","site.ch"),"search");assert.equal(entrySource("https://site.ch/path","site.ch"),"internal");
});
test("HTML escaping, unknown groups and geographic demand across cantons",()=>{
  const s=summarizeAnalytics([event("venue_opened",1,{properties:{venue_name:'<img src=x onerror="alert(1)">'}}),event("search_started",2,{properties:{analytics_version:3,search_lat:47.5,search_lon:8.9,search_canton:"TG"}}),event("search_started",3,{properties:{analytics_version:3,search_canton:"ZH"}})]);
  const html=renderAnalyticsSummary(s);assert.ok(!html.includes("<img"));assert.ok(!html.includes("onerror=\""));assert.deepEqual(s.winterthur,{actions:1,unknown:1});
});
test("Swiss week boundaries cover DST and ISO year rollover",()=>{
  for(const [from,hours] of [["2026-03-23",167],["2026-10-19",169]] as const){const p=weeklyReportPeriod(new Date("2027-01-05T06:00:00Z"),from);assert.equal((p.until.getTime()-p.from.getTime())/3600000,hours);}
  const p=weeklyReportPeriod(new Date("2027-01-04T06:00:00Z"));assert.equal(p.week,53);assert.equal(p.fromDay,"2026-12-28");
});
test("known search places are resolved without retaining arbitrary text or UTM values",()=>{
  const p=searchAnalyticsProperties({name:"Winterthur",radius:"25"},6);
  assert.equal(p.result_count,6);assert.equal(p.radius_km,25);assert.equal(typeof p.search_lat,"number");assert.match(String(p.search_place_id),/^ch-postal:/);
  const unknown=searchAnalyticsProperties({name:"private@example.ch"},0);assert.equal(unknown.search_place_id,undefined);assert.ok(!JSON.stringify(unknown).includes("private"));
  assert.equal(campaignCode(new URLSearchParams("utm_campaign=someone@example.ch")),"unknown");
  assert.equal(campaignCode(new URLSearchParams()),"none");
});
