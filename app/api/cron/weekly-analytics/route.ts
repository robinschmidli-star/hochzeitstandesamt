import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aggregateWeeklyMetrics, isWeeklyReportTime, renderWeeklyReport, weeklyReportPeriod } from "@/lib/weekly-analytics";

export const dynamic = "force-dynamic";

async function report(request: Request, manual: boolean) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse("Unauthorized", { status: 401 });
  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "1";
  const now = new Date();
  const backfill = manual || url.searchParams.has("from");
  if (!backfill && !dryRun && !isWeeklyReportTime(now)) {
    console.info("weekly-analytics", { skipped: "outside Europe/Zurich Monday 07:00", at: now.toISOString() });
    return NextResponse.json({ ok: true, skipped: "outside Europe/Zurich Monday 07:00" });
  }
  let period: ReturnType<typeof weeklyReportPeriod>;
  try {
    period = weeklyReportPeriod(now, backfill || dryRun ? url.searchParams.get("from") ?? undefined : undefined);
  } catch {
    return NextResponse.json({ ok: false, error: "from must be a completed week's Monday (YYYY-MM-DD)" }, { status: 400 });
  }
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ANALYTICS_REPORT_FROM;
  if (!dryRun && (!apiKey || !fromEmail)) return NextResponse.json({ ok: false, error: !apiKey ? "RESEND_API_KEY is required" : "ANALYTICS_REPORT_FROM is required" }, { status: 503 });
  try {
    const select = { eventName: true, visitorHash: true, properties: true, path: true, sessionId: true, occurredAt: true } as const;
    const [events, previousEvents, leads, previousLeads] = await Promise.all([
      prisma.analyticsEvent.findMany({ where: { occurredAt: { gte: period.from, lt: period.until } }, select }),
      prisma.analyticsEvent.findMany({ where: { occurredAt: { gte: period.previousFrom, lt: period.from } }, select }),
      prisma.websiteLead.count({ where: { createdAt: { gte: period.from, lt: period.until } } }),
      prisma.websiteLead.count({ where: { createdAt: { gte: period.previousFrom, lt: period.from } } })
    ]);
    const current = aggregateWeeklyMetrics(events, leads);
    const previous = aggregateWeeklyMetrics(previousEvents, previousLeads);
    const summary = { from: period.from.toISOString(), untilExclusive: period.until.toISOString(), previousFrom: period.previousFrom.toISOString(), timeZone: "Europe/Zurich", current, previous };
    if (dryRun) {
      console.info("weekly-analytics dry-run", JSON.stringify(summary));
      return NextResponse.json({ ok: true, dryRun: true, mailConfigured: Boolean(apiKey && fromEmail), ...summary });
    }
    const html = renderWeeklyReport({ current, previous, from: period.from, until: new Date(period.until.getTime() - 1), week: period.week, internalFilterSince: process.env.ANALYTICS_INTERNAL_FILTER_ACTIVE_SINCE });
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `weekly-analytics-${period.fromDay}` },
      body: JSON.stringify({ from: fromEmail, to: ["robinschmidli@gmail.com"], subject: `hochzeitstandesamt.ch – Wochenreport KW ${period.week}`, html }),
      signal: AbortSignal.timeout(20000)
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || typeof result?.id !== "string") {
      console.error("weekly-analytics resend rejected", { status: response.status, name: result?.name, message: typeof result?.message === "string" ? result.message.slice(0, 500) : undefined });
      return NextResponse.json({ ok: false, error: "Email delivery failed", resendStatus: response.status, resendError: result?.name ?? "invalid_response" }, { status: 502 });
    }
    console.info("weekly-analytics resend accepted", JSON.stringify({ emailId: result.id, status: response.status, ...summary }));
    return NextResponse.json({ ok: true, accepted: true, emailId: result.id, ...summary });
  } catch {
    console.error("weekly-analytics failed: database query or email request failed");
    return NextResponse.json({ ok: false, error: "Report query or delivery request failed" }, { status: 500 });
  }
}

export async function GET(request: Request) { return report(request, false); }
// Authenticated manual backfill uses the same query, report and mail delivery.
export async function POST(request: Request) { return report(request, true); }
