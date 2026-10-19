import assert from "node:assert/strict";
import test from "node:test";
import { aggregateWeeklyMetrics, change, isWeeklyReportTime, rate, renderWeeklyReport, weeklyReportPeriod } from "../lib/weekly-analytics";
import { isAdminPath, isInternalTraffic, trustedBrowserRequest } from "../lib/analytics-request";
import { GET, POST } from "../app/api/cron/weekly-analytics/route";
import { prisma } from "../lib/prisma";

function browserRequest(headers: Record<string, string> = {}) {
  return new Request("https://hochzeitstandesamt.ch/api/analytics", { headers: { host: "hochzeitstandesamt.ch", origin: "https://hochzeitstandesamt.ch", "sec-fetch-site": "same-origin", "user-agent": "Mozilla/5.0 Chrome/140 Safari/537.36", ...headers } });
}

test("accepts external browsers and rejects internal and bot requests", () => {
  assert.equal(trustedBrowserRequest(browserRequest()), true);
  assert.equal(isInternalTraffic(browserRequest({ cookie: "theme=light; hsa_internal=1" })), true);
  assert.equal(trustedBrowserRequest(browserRequest({ "user-agent": "Googlebot/2.1" })), false);
  assert.equal(trustedBrowserRequest(browserRequest({ host: "localhost", origin: "http://localhost" })), false);
  assert.equal(isAdminPath("/admin"), true);
  assert.equal(isAdminPath("/admin/analytics"), true);
  assert.equal(isAdminPath("/administration"), false);
});

test("aggregates productive funnel events and reliable top venues", () => {
  const metrics = aggregateWeeklyMetrics([
    { eventName: "page_view", visitorHash: "a" }, { eventName: "page_view", visitorHash: "a" },
    { eventName: "search_completed", visitorHash: "a" },
    { eventName: "venue_opened", visitorHash: "a", properties: { venue_name: "Trauort A" } },
    { eventName: "favorite_added", visitorHash: "a" }, { eventName: "lead_created", visitorHash: "a" }
  ]);
  assert.equal(metrics.visitors, 1); assert.equal(metrics.pageViews, 2); assert.equal(metrics.venueViews, 1); assert.equal(metrics.leads, 0);
});

test("zero denominators do not produce conversion rates", () => {
  assert.equal(rate(3, 0), null);
  assert.equal(change(3, 0), "neu");
  const empty = aggregateWeeklyMetrics([]);
  const html = renderWeeklyReport({ current: empty, previous: empty, from: new Date("2026-09-07"), until: new Date("2026-09-13"), week: 37 });
  assert.match(html, /Seitenaufrufe pro Browser: –/);
  assert.doesNotMatch(html, /NaN|Infinity/);
});

test("internal traffic is rejected before it can enter any report KPI", () => {
  const request = browserRequest({ cookie: "hsa_internal=1" });
  assert.equal(isInternalTraffic(request), true);
  const storedRows = isInternalTraffic(request) ? [] : [{ eventName: "page_view", visitorHash: "internal" }];
  assert.equal(aggregateWeeklyMetrics(storedRows).visitors, 0);
});

test("both UTC schedules yield exactly one Zurich 07-hour invocation in winter and summer", () => {
  for (const monday of ["2026-03-23", "2026-03-30", "2026-10-05", "2026-10-19", "2026-10-26", "2026-11-02"]) {
    const accepted = [5, 6].filter((hour) => isWeeklyReportTime(new Date(`${monday}T0${hour}:00:00Z`)));
    assert.equal(accepted.length, 1, monday);
  }
  assert.equal(isWeeklyReportTime(new Date("2026-10-06T05:00:00Z")), false);
});

test("completed report weeks use Zurich midnight, including DST weeks", () => {
  const period = weeklyReportPeriod(new Date("2026-10-07T12:00:00Z"), "2026-09-28");
  assert.equal(period.from.toISOString(), "2026-09-27T22:00:00.000Z");
  assert.equal(period.until.toISOString(), "2026-10-04T22:00:00.000Z");
  assert.equal(period.previousFrom.toISOString(), "2026-09-20T22:00:00.000Z");
  assert.equal(period.week, 40);
  for (const [from, hours] of [["2026-03-23", 167], ["2026-10-19", 169]] as const) {
    const p = weeklyReportPeriod(new Date("2026-11-02T06:00:00Z"), from);
    assert.equal((p.until.getTime() - p.from.getTime()) / 3600000, hours);
  }
  for (const from of ["2026-10-05", "2026-09-29", "2026-02-30", "invalid"]) assert.throws(() => weeklyReportPeriod(new Date("2026-10-07"), from));
});

test("excludes only identifiable stored admin traffic, groups top pages without query values", () => {
  const metrics = aggregateWeeklyMetrics([
    { eventName: "page_view", visitorHash: "admin", path: "/admin?next=/" },
    { eventName: "page_view", visitorHash: "real", path: "/search?name=private" },
    { eventName: "page_view", visitorHash: "real", path: "/search?name=other" },
    { eventName: "page_view", visitorHash: "real", path: "/administration" },
    { eventName: "venue_opened", visitorHash: "real", path: "/trauort/a" },
    { eventName: "location_view", visitorHash: "real", path: "/standesamt/b" }
  ], 3);
  assert.equal(metrics.visitors, 1);
  assert.equal(metrics.excludedVisitors, 1);
  assert.equal(metrics.excludedEvents, 1);
  assert.equal(metrics.pageViews, 3);
  assert.equal(metrics.venueViews, 1); assert.equal(metrics.officeViews, 1);
  assert.equal(metrics.leads, 3);
  assert.deepEqual(metrics.topPages, [{ path: "/search", views: 2 }, { path: "/administration", views: 1 }]);
  const html = renderWeeklyReport({ current: metrics, previous: aggregateWeeklyMetrics([]), from: new Date("2026-09-27T22:00:00Z"), until: new Date("2026-10-04T21:59:59Z"), week: 40 });
  assert.match(html, /28\.9\.2026–4\.10\.2026/);
  assert.match(html, /Top 10 Seiten/);
  assert.match(html, /rückwirkend nicht messbar/);
  assert.doesNotMatch(html, /private|ausgeschlossen: Ja/);
});

test("does not classify real device names as bots and rejects marked admin sessions", () => {
  assert.equal(trustedBrowserRequest(browserRequest({ "user-agent": "Mozilla/5.0 (Linux; Android 13; CUBOT) AppleWebKit/537.36 Chrome/140 Safari/537.36" })), true);
  assert.equal(isInternalTraffic(browserRequest({ cookie: "admin_session=authenticated" })), true);
  assert.equal(trustedBrowserRequest(browserRequest({ host: "[::1]:3000", origin: "http://[::1]:3000" })), false);
});

test("preview traffic is rejected and production browsers remain accepted", (t) => {
  const original = process.env.VERCEL_ENV;
  t.after(() => { if (original === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = original; });
  process.env.VERCEL_ENV = "preview";
  assert.equal(trustedBrowserRequest(browserRequest()), false);
  process.env.VERCEL_ENV = "production";
  assert.equal(trustedBrowserRequest(browserRequest()), true);
});

test("cron authentication, read-only backfill, Resend errors and acceptance", async (t) => {
  const oldEnv = { ...process.env };
  t.after(() => { for (const key of ["CRON_SECRET", "RESEND_API_KEY", "ANALYTICS_REPORT_FROM"]) { if (oldEnv[key] === undefined) delete process.env[key]; else process.env[key] = oldEnv[key]; } });
  process.env.CRON_SECRET = "unit-test-cron-secret";
  process.env.RESEND_API_KEY = "unit-test-resend-key";
  process.env.ANALYTICS_REPORT_FROM = "reports@example.com";
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-07T12:00:00Z") });
  const originalEvents = prisma.analyticsEvent.findMany;
  const originalLeads = prisma.websiteLead.count;
  const events = t.mock.fn(async () => []);
  const leads = t.mock.fn(async () => 0);
  prisma.analyticsEvent.findMany = events as unknown as typeof originalEvents;
  prisma.websiteLead.count = leads as unknown as typeof originalLeads;
  t.after(() => { prisma.analyticsEvent.findMany = originalEvents; prisma.websiteLead.count = originalLeads; });
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ id: "test-email-id" }));
  const request = (suffix = "", method = "GET", authorized = true) => new Request(`https://hochzeitstandesamt.ch/api/cron/weekly-analytics${suffix}`, { method, headers: authorized ? { authorization: "Bearer unit-test-cron-secret" } : {} });
  assert.equal((await GET(request("?dryRun=1", "GET", false))).status, 401);
  assert.equal(events.mock.callCount(), 0);
  assert.match(JSON.stringify(await (await GET(request())).json()), /skipped/);
  assert.equal(events.mock.callCount(), 0);
  const dry = await (await GET(request("?dryRun=1&from=2026-09-28"))).json();
  assert.equal(dry.dryRun, true);
  assert.equal(dry.from, "2026-09-27T22:00:00.000Z");
  assert.equal(fetch.mock.callCount(), 0);
  assert.equal(leads.mock.callCount(), 2);
  assert.equal((await POST(request("?from=2026-10-05", "POST"))).status, 400);
  delete process.env.RESEND_API_KEY;
  assert.equal((await POST(request("?from=2026-09-28", "POST"))).status, 503);
  process.env.RESEND_API_KEY = "unit-test-resend-key";
  fetch.mock.mockImplementation(async () => Response.json({ name: "validation_error", message: "Domain not verified" }, { status: 403 }));
  const failure = await POST(request("?from=2026-09-28", "POST"));
  assert.equal(failure.status, 502);
  assert.equal((await failure.json()).resendStatus, 403);
  fetch.mock.mockImplementation(async () => Response.json({ id: "test-email-id" }));
  const success = await (await POST(request("?from=2026-09-28", "POST"))).json();
  assert.equal(success.accepted, true);
  assert.equal(success.emailId, "test-email-id");
  const mail = fetch.mock.calls.at(-1)!.arguments[1]!;
  assert.equal((mail.headers as Record<string, string>)["Idempotency-Key"], "weekly-analytics-2026-09-28");
  const body = JSON.parse(String(mail.body));
  assert.deepEqual(body.to, ["robinschmidli@gmail.com"]);
  assert.match(body.html, /28\.9\.2026–4\.10\.2026/);
  const manualGet = await (await GET(request("?from=2026-09-28"))).json();
  assert.equal(manualGet.accepted, true);
  assert.equal((fetch.mock.calls.at(-1)!.arguments[1]!.headers as Record<string, string>)["Idempotency-Key"], "weekly-analytics-2026-09-28");
});

test("renders week comparisons and escapes venue names", () => {
  const current = aggregateWeeklyMetrics([{ eventName: "venue_opened", visitorHash: "a", properties: { venue_name: "A & B" } }]);
  const previous = aggregateWeeklyMetrics([{ eventName: "venue_opened", visitorHash: "b", properties: { venue_name: "A" } }]);
  const html = renderWeeklyReport({ current, previous, from: new Date("2026-09-07"), until: new Date("2026-09-13"), week: 37 });
  assert.match(html, /A &amp; B/);
  assert.match(html, /\+0%/);
});
