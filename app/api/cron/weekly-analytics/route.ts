import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { summarizeAnalytics, renderAnalyticsSummary, zurichReportWindow } from "@/lib/analytics-summary";

function pct(current: number, previous: number) { return previous ? `${Math.round(((current - previous) / previous) * 100)}%` : "–"; }
function isoWeek(date: Date) { const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); value.setUTCDate(value.getUTCDate() + 4 - (value.getUTCDay() || 7)); const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1)); return Math.ceil((((value.getTime() - yearStart.getTime()) / 86400000) + 1) / 7); }
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse("Unauthorized", { status: 401 });
  const zurich = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zurich", weekday: "short", hour: "2-digit", hour12: false }).format(new Date());
  if (!/^Mon,?\s+07(?::|$)/.test(zurich)) return NextResponse.json({ ok: true, skipped: "outside Europe/Zurich Monday 07:00" });
  const { from, to: thisMonday, previousFrom } = zurichReportWindow(new Date());
  const [events, previous, newLeads] = await Promise.all([
    prisma.analyticsEvent.findMany({ where: { occurredAt: { gte: from, lt: thisMonday } }, select: { eventName: true, visitorHash: true, sessionId: true, path: true, occurredAt: true, properties: true } }),
    prisma.analyticsEvent.findMany({ where: { occurredAt: { gte: previousFrom, lt: from } }, select: { eventName: true, visitorHash: true, sessionId: true, path: true, occurredAt: true, properties: true } }),
    prisma.websiteLead.count({ where: { createdAt: { gte: from, lt: thisMonday } } })
  ]);
  const summary = summarizeAnalytics(events); const prior = summarizeAnalytics(previous);
  const html = `<h1>Hochzeitstandesamt.ch – Wochenreport</h1><p>${from.toLocaleDateString("de-CH", { timeZone: "Europe/Zurich" })}–${new Date(thisMonday.getTime() - 1).toLocaleDateString("de-CH", { timeZone: "Europe/Zurich" })}</p><p>Browser gegenüber Vorwoche: ${pct(summary.visitors, prior.visitors)} · Seitenaufrufe: ${pct(summary.pageViews, prior.pageViews)}</p>${renderAnalyticsSummary(summary)}<h2>Gespeicherte Website-Anfragen</h2><p>${newLeads} neue Datensätze. Separater Datenbankwert, ohne Zuordnung zum Suchverlauf; Qualität und mögliche Tests sind nicht automatisch bestätigt.</p>`;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ANALYTICS_REPORT_FROM ?? "Hochzeitstandesamt <onboarding@resend.dev>";
  if (!apiKey) return NextResponse.json({ ok: false, error: "RESEND_API_KEY is required" }, { status: 503 });
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: fromEmail, to: ["robinschmidli@gmail.com"], subject: `hochzeitstandesamt.ch – Wochenreport KW ${isoWeek(new Date(from.getTime() + 12 * 3600000))}`, html }) });
  if (!response.ok) return NextResponse.json({ ok: false, error: "Email delivery failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
