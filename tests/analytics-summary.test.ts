import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeAnalytics, renderAnalyticsSummary, zurichReportWindow, type ReportEvent } from "../lib/analytics-summary";
const event = (eventName: string, seconds: number, extra: Partial<ReportEvent> = {}): ReportEvent => ({ eventName, occurredAt: new Date(seconds * 1000), visitorHash: "browser", sessionId: "session", path: "/", properties: {}, ...extra });
test("actions are separate from browsers and office views are not venue views", () => {
  const result = summarizeAnalytics([event("search_completed", 1), event("search_completed", 2), event("location_view", 3)]);
  assert.deepEqual(result.metrics.find(r => r.name === "search_completed"), { name: "search_completed", label: "Suchergebnis-Anzeigen", actions: 2, browsers: 1 });
  assert.equal(result.journey.venue, 0);
});
test("journey requires later events in the same session and deduplicates browsers", () => {
  const result = summarizeAnalytics([event("venue_opened", 0), event("search_completed", 1), event("venue_opened", 2, { sessionId: "other" }), event("external_link_clicked", 3)]);
  assert.equal(result.journey.venue, 0); assert.equal(result.journey.contact, 0);
  const valid = summarizeAnalytics([event("external_link_clicked", 3), event("venue_opened", 2), event("search_completed", 1), event("venue_opened", 4)]);
  assert.deepEqual(valid.journey, { search: 1, venue: 1, contact: 1 });
});
test("exclude administrative traffic and preserve unknown source rather than invent attribution", () => {
  const result = summarizeAnalytics([event("page_view", 1, { path: "/verify/secret" }), event("page_view", 2)]);
  assert.equal(result.excluded, 1); assert.equal(result.sources[0].label, "Unbekannt / nicht erfasst");
});
test("escape event properties in report HTML", () => {
  const html = renderAnalyticsSummary(summarizeAnalytics([event("venue_opened", 1, { properties: { venue_name: '<img src=x onerror="alert(1)">' } })]));
  assert.ok(!html.includes("<img")); assert.ok(html.includes("&lt;img"));
});

test("Swiss reporting week includes the DST transition and Sunday evening", () => {
  const window = zurichReportWindow(new Date("2026-10-26T06:00:00Z"));
  assert.equal(window.from.toISOString(), "2026-10-18T22:00:00.000Z");
  assert.equal(window.to.toISOString(), "2026-10-25T23:00:00.000Z");
  assert.equal((window.to.getTime() - window.from.getTime()) / 3600000, 169);
});
