import assert from "node:assert/strict";
import test from "node:test";
import { weekOverWeek, weeklyTrafficHtml, type WeeklyAnalyticsEvent } from "../lib/weekly-analytics";

const event = (eventName: string, sessionId: string, visitorHash: string): WeeklyAnalyticsEvent => ({ eventName, sessionId, visitorHash });

test("week-over-week changes are signed and do not invent a baseline", () => {
  assert.equal(weekOverWeek(28, 10), "+180 % WoW");
  assert.equal(weekOverWeek(7, 10), "-30 % WoW");
  assert.equal(weekOverWeek(0, 0), "nicht verfügbar");
});

test("traffic report separates totals, unique sessions, visitors and interactions", () => {
  const current = [
    event("page_view", "s1", "v1"),
    event("page_view", "s1", "v1"),
    event("page_view", "s2", "v1"),
    event("search_completed", "s2", "v1"),
    event("location_view", "s3", "v2"),
    event("official_link_clicked", "s3", "v2"),
  ];
  const previous = [event("page_view", "old", "old-visitor")];
  const html = weeklyTrafficHtml(current, previous, 1);

  assert.match(html, /Pageviews: 3 \(\+200 % WoW\)/);
  assert.match(html, /Sessions: 3 \(\+200 % WoW\)/);
  assert.match(html, /Unique Visitors: 2 \(\+100 % WoW\)/);
  assert.match(html, /Organische Google-Klicks: nicht verfügbar/);
  assert.match(html, /Suchen: 1/);
  assert.match(html, /Trauorte geöffnet: 1/);
  assert.match(html, /Offizielle Links angeklickt: 1/);
  assert.match(html, /Leads \/ Formulare: 1/);
  assert.match(html, /Pageviews und Sessions allein nur eingeschränkt als Indikator für echtes Nutzerwachstum geeignet/);
});
