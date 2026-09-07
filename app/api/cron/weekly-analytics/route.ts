import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { weeklyTrafficHtml } from "@/lib/weekly-analytics";

function mondayUtc(date: Date) { const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); const day = copy.getUTCDay() || 7; copy.setUTCDate(copy.getUTCDate() - day + 1); return copy; }
function isoWeek(date: Date) { const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); value.setUTCDate(value.getUTCDate() + 4 - (value.getUTCDay() || 7)); const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1)); return Math.ceil((((value.getTime() - yearStart.getTime()) / 86400000) + 1) / 7); }
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse("Unauthorized", { status: 401 });
  const zurich = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zurich", weekday: "short", hour: "2-digit", hour12: false }).format(new Date());
  if (!zurich.startsWith("Mon, 07")) return NextResponse.json({ ok: true, skipped: "outside Europe/Zurich Monday 07:00" });
  const thisMonday = mondayUtc(new Date()); const from = new Date(thisMonday); from.setUTCDate(from.getUTCDate() - 7); const previousFrom = new Date(from); previousFrom.setUTCDate(previousFrom.getUTCDate() - 7);
  const [
    events,
    previous,
    newLeads,
    totalPreferenceProfiles,
    newPreferenceProfiles,
    totalSearchContexts,
    newSearchContexts,
    totalActiveFavorites,
    newActiveFavorites,
    totalAvailabilityInterests,
    newAvailabilityInterests
  ] = await Promise.all([
    prisma.analyticsEvent.findMany({ where: { occurredAt: { gte: from, lt: thisMonday } }, select: { eventName: true, sessionId: true, visitorHash: true } }),
    prisma.analyticsEvent.findMany({ where: { occurredAt: { gte: previousFrom, lt: from } }, select: { eventName: true, sessionId: true, visitorHash: true } }),
    prisma.websiteLead.count({ where: { createdAt: { gte: from, lt: thisMonday } } }),
    prisma.visitorPreferenceProfile.count(),
    prisma.visitorPreferenceProfile.count({ where: { firstSeenAt: { gte: from, lt: thisMonday } } }),
    prisma.searchContext.count(),
    prisma.searchContext.count({ where: { createdAt: { gte: from, lt: thisMonday } } }),
    prisma.favoriteVenue.count({ where: { removedAt: null } }),
    prisma.favoriteVenue.count({ where: { removedAt: null, savedAt: { gte: from, lt: thisMonday } } }),
    prisma.availabilityInterest.count(),
    prisma.availabilityInterest.count({ where: { checkedAt: { gte: from, lt: thisMonday } } })
  ]);
  const html = `<h1>Hochzeitstandesamt.ch – Wochenreport</h1><p>${from.toLocaleDateString("de-CH")}–${new Date(thisMonday.getTime() - 1).toLocaleDateString("de-CH")}</p>${weeklyTrafficHtml(events, previous, newLeads)}<h2>Gespeicherte Präferenzdaten</h2><table><thead><tr><th align="left">Kategorie</th><th align="right">Neu diese Woche</th><th align="right">Gesamt</th></tr></thead><tbody><tr><td>Besucherprofile</td><td align="right">${newPreferenceProfiles}</td><td align="right">${totalPreferenceProfiles}</td></tr><tr><td>Suchkontexte</td><td align="right">${newSearchContexts}</td><td align="right">${totalSearchContexts}</td></tr><tr><td>Aktive Favoriten</td><td align="right">${newActiveFavorites}</td><td align="right">${totalActiveFavorites}</td></tr><tr><td>Verfügbarkeitsabfragen</td><td align="right">${newAvailabilityInterests}</td><td align="right">${totalAvailabilityInterests}</td></tr></tbody></table>`;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ANALYTICS_REPORT_FROM ?? "Hochzeitstandesamt <onboarding@resend.dev>";
  if (!apiKey) return NextResponse.json({ ok: false, error: "RESEND_API_KEY is required" }, { status: 503 });
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: fromEmail, to: ["robinschmidli@gmail.com"], subject: `hochzeitstandesamt.ch – Wochenreport KW ${isoWeek(from)}`, html }) });
  if (!response.ok) return NextResponse.json({ ok: false, error: "Email delivery failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
