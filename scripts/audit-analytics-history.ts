/** Read-only audit. Supply an existing env file; never writes raw rows or credentials. */
import { Client } from "pg";
import { summarizeAnalytics, distanceKm, type ReportEvent } from "../lib/analytics-summary";
import postalCodes from "switzerland-postal-codes/dist/postal-codes-full.json";
type PostalPlace={name:string;latitude:string;longitude:string};
const places=Object.entries(postalCodes as Record<string,PostalPlace[]>).flatMap(([zip,rows])=>rows.map(row=>({zip,...row})));
const inPilot=(place:PostalPlace)=>distanceKm(47.499,8.724,Number(place.latitude),Number(place.longitude))<=25;
const keys=(p:PostalPlace & {zip:string})=>[p.name.toLowerCase().trim(),p.zip,`${p.zip} ${p.name.toLowerCase().trim()}`];
// Conservative exact matching: all possible places for the term must lie within the circle.
const pilotTerms=[...new Set(places.filter(inPilot).flatMap(keys))].filter(term=>places.filter(place=>keys(place).includes(term)).every(inPilot));
async function main() {
  if (process.argv[2]) process.loadEnvFile(process.argv[2]);
  const client=new Client({connectionString:process.env.DATABASE_URL_UNPOOLED??process.env.DATABASE_URL,connectionTimeoutMillis:10000});
  await client.connect();
  try {
    await client.query("BEGIN READ ONLY");
    await client.query("SET LOCAL statement_timeout = '20s'");
    for(const [week,from,to] of [[41,"2026-10-04T22:00:00Z","2026-10-11T22:00:00Z"],[42,"2026-10-11T22:00:00Z","2026-10-18T22:00:00Z"]]) {
      const args=[from,to];
      const {rows}=await client.query(`SELECT event_name AS "eventName", visitor_hash AS "visitorHash", session_id AS "sessionId", occurred_at AS "occurredAt", split_part(split_part(path,'?',1),'#',1) AS path,
        jsonb_build_object('analytics_version',properties->'analytics_version','venue_id',properties->'venue_id','venue_name',properties->'venue_name','canton',properties->'canton','entry_source',properties->'entry_source','viewport_category',properties->'viewport_category','language',properties->'language','contact_channel',properties->'contact_channel','link_purpose',properties->'link_purpose') AS properties
        FROM analytics_events WHERE occurred_at >= $1 AND occurred_at < $2`,args);
      const summary=summarizeAnalytics(rows as ReportEvent[]);
      const daily=await client.query(`SELECT to_char(occurred_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Zurich','YYYY-MM-DD') AS day,count(*)::int AS events,count(DISTINCT visitor_hash)::int AS browsers FROM analytics_events WHERE occurred_at >= $1 AND occurred_at < $2 GROUP BY 1 ORDER BY 1`,args);
      const hourly=await client.query(`SELECT to_char(occurred_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Zurich','YYYY-MM-DD HH24') AS hour,count(*)::int AS events,count(DISTINCT visitor_hash)::int AS browsers FROM analytics_events WHERE occurred_at >= $1 AND occurred_at < $2 GROUP BY 1 ORDER BY 2 DESC LIMIT 12`,args);
      const frequency=await client.query(`SELECT count(*)::int AS browsers,max(n)::int AS max_events,percentile_disc(0.5) WITHIN GROUP (ORDER BY n) AS median_events FROM (SELECT visitor_hash,count(*) AS n FROM analytics_events WHERE occurred_at >= $1 AND occurred_at < $2 GROUP BY 1) x`,args);
      const leads=await client.query(`SELECT lead_type,status,(duplicate_of_id IS NOT NULL) AS marked_duplicate,count(*)::int AS records FROM website_leads WHERE created_at >= $1 AND created_at < $2 GROUP BY 1,2,3`,args);
      const pilot=await client.query(`SELECT count(*)::int AS historical_displays,count(*) FILTER(WHERE lower(trim(properties->>'search_query'))=ANY($3::text[]))::int AS exact_targets_within_25km,count(DISTINCT visitor_hash) FILTER(WHERE lower(trim(properties->>'search_query'))=ANY($3::text[]))::int AS browsers_with_those_targets FROM analytics_events WHERE occurred_at >= $1 AND occurred_at < $2 AND event_name='search_completed'`,[...args,pilotTerms]);
      console.log(JSON.stringify({week,from,to,storedBrowsers:new Set(rows.map(e=>e.visitorHash)).size,storedEvents:rows.length,summary,daily:daily.rows,peakHours:hourly.rows,frequency:frequency.rows,leads:leads.rows,pilot:pilot.rows}));
    }
  } finally { await client.query("ROLLBACK");await client.end(); }
}
main().catch(error=>{ console.error("Read-only audit unavailable",error?.code??error?.name??"unknown");process.exitCode=1; });
