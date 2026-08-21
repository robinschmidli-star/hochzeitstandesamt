import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function mondayUtc(date: Date) { const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); const day = copy.getUTCDay() || 7; copy.setUTCDate(copy.getUTCDate() - day + 1); return copy; }
function pct(current: number, previous: number) { return previous ? `${Math.round(((current - previous) / previous) * 100)}%` : "–"; }
function isoWeek(date: Date) { const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); value.setUTCDate(value.getUTCDate() + 4 - (value.getUTCDay() || 7)); const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1)); return Math.ceil((((value.getTime() - yearStart.getTime()) / 86400000) + 1) / 7); }
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse("Unauthorized", { status: 401 });
  const zurich = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zurich", weekday: "short", hour: "2-digit", hour12: false }).format(new Date());
  if (!zurich.startsWith("Mon, 07")) return NextResponse.json({ ok: true, skipped: "outside Europe/Zurich Monday 07:00" });
  const thisMonday = mondayUtc(new Date()); const from = new Date(thisMonday); from.setUTCDate(from.getUTCDate() - 7); const previousFrom = new Date(from); previousFrom.setUTCDate(previousFrom.getUTCDate() - 7);
  const [events, previous, newLeads] = await Promise.all([
    prisma.analyticsEvent.findMany({ where: { occurredAt: { gte: from, lt: thisMonday } }, select: { eventName: true, visitorHash: true } }),
    prisma.analyticsEvent.findMany({ where: { occurredAt: { gte: previousFrom, lt: from } }, select: { eventName: true, visitorHash: true } }),
    prisma.websiteLead.count({ where: { createdAt: { gte: from, lt: thisMonday } } })
  ]);
  const count = (rows: typeof events, name: string) => rows.filter((event) => event.eventName === name).length;
  const visitors = new Set(events.map((event) => event.visitorHash)).size; const previousVisitors = new Set(previous.map((event) => event.visitorHash)).size;
  const html = `<h1>Hochzeitstandesamt.ch – Wochenreport</h1><p>${from.toLocaleDateString("de-CH")}–${new Date(thisMonday.getTime() - 1).toLocaleDateString("de-CH")}</p><h2>Traffic</h2><p>Besucher: ${visitors} (${pct(visitors, previousVisitors)})<br>Page Views: ${count(events, "page_view")} (${pct(count(events, "page_view"), count(previous, "page_view"))})</p><h2>Funnel</h2><p>Besucher ${visitors} → Suchen ${count(events, "search_completed")} → Location Views ${count(events, "location_view")} → Favoriten ${count(events, "favorite_added")} → Leads ${newLeads}</p>`;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ANALYTICS_REPORT_FROM ?? "Hochzeitstandesamt <onboarding@resend.dev>";
  if (!apiKey) return NextResponse.json({ ok: false, error: "RESEND_API_KEY is required" }, { status: 503 });
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: fromEmail, to: ["robinschmidli@gmail.com"], subject: `hochzeitstandesamt.ch – Wochenreport KW ${isoWeek(from)}`, html }) });
  if (!response.ok) return NextResponse.json({ ok: false, error: "Email delivery failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
