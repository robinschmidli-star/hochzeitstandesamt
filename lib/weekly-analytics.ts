import { analyticsPath } from "./analytics-policy";
import { summarizeAnalytics, renderAnalyticsSummary, type ReportEvent } from "./analytics-summary";
export type AnalyticsRow = ReportEvent;

export type WeeklyMetrics = {
  summary: ReturnType<typeof summarizeAnalytics>;
  officeViews: number;
  visitors: number;
  pageViews: number;
  searches: number;
  venueViews: number;
  favorites: number;
  leads: number;
  topVenues: Array<{ name: string; views: number; browsers: number }>;
  topPages: Array<{ path: string; views: number }>;
  excludedEvents: number;
  excludedVisitors: number;
};

export function aggregateWeeklyMetrics(input: AnalyticsRow[], leadCount?: number): WeeklyMetrics {
  const isAdmin = (row: AnalyticsRow) => Boolean(row.path && analyticsPath(row.path) === null);
  const excluded = input.filter(isAdmin);
  const rows = input.filter((row) => !isAdmin(row));
  const count = (name: string) => rows.filter((event) => event.eventName === name).length;
  const venueCounts = new Map<string, { name:string; views:number; browsers:Set<string> }>();
  const pageCounts = new Map<string, number>();
  for (const event of rows) {
    if (event.eventName === "page_view" && event.path) {
      const pathname = event.path.split(/[?#]/, 1)[0].replace(/^(\/verify\/(?:venue\/)?)[^/]+/, "$1[token]");
      pageCounts.set(pathname, (pageCounts.get(pathname) ?? 0) + 1);
    }
    if (event.eventName !== "venue_opened" || !event.properties || typeof event.properties !== "object" || Array.isArray(event.properties)) continue;
    const name = (event.properties as Record<string, unknown>).venue_name;
    if (typeof name === "string" && name.trim()) {
      const id=(event.properties as Record<string,unknown>).venue_id;
      const key=typeof id==="string"?`id:${id}`:`legacy-label:${name.trim()}`;
      const item=venueCounts.get(key)??{name:name.trim(),views:0,browsers:new Set<string>()};
      item.views++;item.browsers.add(event.visitorHash);venueCounts.set(key,item);
    }
  }
  return {
    summary: summarizeAnalytics(input),
    officeViews: count("location_view"),
    visitors: new Set(rows.map((event) => event.visitorHash)).size,
    pageViews: count("page_view"),
    searches: summarizeAnalytics(input).metrics.find(r=>r.name==="search_started")?.actions??0,
    // Offices use location_view; never combine with venue_opened.
    venueViews: count("venue_opened"),
    favorites: count("favorite_added"),
    leads: leadCount ?? 0,
    topVenues: [...venueCounts.values()].map(item => ({ name:item.name, views:item.views, browsers:item.browsers.size })).sort((a, b) => b.views - a.views || a.name.localeCompare(b.name, "de-CH")).slice(0, 5),
    topPages: [...pageCounts].map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views || a.path.localeCompare(b.path, "de-CH")).slice(0, 10),
    excludedEvents: excluded.length,
    excludedVisitors: new Set(input.map((row) => row.visitorHash)).size - new Set(rows.map((row) => row.visitorHash)).size
  };
}

export function change(current: number, previous: number) {
  if (previous === 0) return current ? "neu" : "–";
  const value = Math.round(((current - previous) / previous) * 1000) / 10;
  return `${value >= 0 ? "+" : ""}${value}%`;
}

export function rate(current: number, denominator: number) {
  return denominator === 0 ? null : `${((current / denominator) * 100).toFixed(1)}%`;
}

function number(value: number) { return new Intl.NumberFormat("de-CH").format(value); }
function metric(value: number, previous: number) { return `${number(value)} (Δ ${value-previous>=0?"+":""}${number(value-previous)}; ${change(value, previous)})`; }
export function renderWeeklyReport(input: { current: WeeklyMetrics; previous: WeeklyMetrics; from: Date; until: Date; week: number; internalFilterSince?: string }) {
  const {current:c,previous:p}=input;
  const list=(title:string,rows:{label:string;views:number}[]) => '<h2>'+title+'</h2>'+rows.map((r,i)=>'<div>'+(i+1)+'. '+escapeHtml(r.label)+' – '+number(r.views)+'</div>').join('');
  return '<!doctype html><html><body style="font-family:Arial,sans-serif;max-width:720px;margin:auto;padding:24px"><h1>Hochzeitstandesamt.ch – Wochenreport KW '+input.week+'</h1><p>'+input.from.toLocaleDateString('de-CH',{timeZone:'Europe/Zurich'})+'–'+input.until.toLocaleDateString('de-CH',{timeZone:'Europe/Zurich'})+'. Datenstand: Datenbankabfrage beim Reportaufruf für diesen abgeschlossenen Ereigniszeitraum'+'</p><h2>Traffic und Vorwochenvergleich</h2><p>Browser: '+metric(c.visitors,p.visitors)+'<br>Seitenaufrufe: '+metric(c.pageViews,p.pageViews)+'<br>Seitenaufrufe pro Browser: '+(c.visitors?(c.pageViews/c.visitors).toFixed(2):'–')+'</p><h2>Aktionsvergleich</h2>'+c.summary.metrics.map(row=>{const prior=p.summary.metrics.find(r=>r.name===row.name);return '<div>'+escapeHtml(row.label)+': '+(row.measured?(prior?.measured?metric(row.actions,prior.actions):number(row.actions)+" (Vorwoche nicht erfasst)"):'nicht erfasst')+'; '+(row.measured?row.browsers:'nicht erfasst')+' Browser</div>';}).join('')+'<h2>Gespeicherte Website-Anfragen</h2><p>'+metric(c.leads,p.leads)+' Datensätze; separat vom Browser-Tracking. Enthält gespeicherte Suchabonnements. Status new bedeutet keine Bestätigung oder Qualifizierung; Tests, Spam und Duplikate sind nicht pauschal ausgeschlossen. Keine historische Funnel-Zuordnung.</p>'+renderAnalyticsSummary(c.summary)+list('Top Trauorte der Woche',c.topVenues.map(v=>({label:v.name+" ("+v.browsers+" Browser)",views:v.views})))+list('Top 10 Seiten der Woche',c.topPages.map(v=>({label:v.path,views:v.views})))+'<h2>Traffic-Qualität</h2><p>'+c.excludedEvents+' gespeicherte Verwaltungsereignisse ausgeschlossen; '+c.excludedVisitors+' ausschließlich ausgeschlossene Browser. Vor Speicherung gefilterte Ereignisse sind rückwirkend nicht messbar. Historische Browserqualität bleibt unbekannt.</p>'+(input.internalFilterSince?'<p>Interner Filter seit '+escapeHtml(input.internalFilterSince)+'</p>':'')+'<p>Messrevision 3 gilt erst ab tatsächlichem Deployment. Alte und neue Such-/Kontaktzahlen sind nicht unmittelbar vergleichbar. Nicht freigegebene Kampagnencodes und das tatsächliche Besuchsland bleiben unbekannt.</p></body></html>';
}

const ZURICH = "Europe/Zurich";
const localParts = (date: Date) => Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: ZURICH, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", hourCycle: "h23" }).formatToParts(date).map((part) => [part.type, part.value]));

export function isWeeklyReportTime(now: Date) {
  const parts = localParts(now);
  return parts.weekday === "Mon" && parts.hour === "07";
}

// Compute each midnight separately so DST transition weeks have 167/169 hours.
export function zurichMidnight(day: string) {
  const utc = Date.parse(`${day}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(utc) || new Date(utc).toISOString().slice(0, 10) !== day) throw new Error("Invalid report date");
  const noon = new Date(utc + 12 * 3600000);
  const offset = Number(localParts(noon).hour) - noon.getUTCHours();
  return new Date(utc - offset * 3600000);
}

export function weeklyReportPeriod(now: Date, requestedFrom?: string) {
  const parts = localParts(now);
  const monday = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() || 7) - 1));
  const fromDay = requestedFrom ? new Date(`${requestedFrom}T00:00:00Z`) : new Date(monday.getTime() - 7 * 86400000);
  const day = fromDay.toISOString().slice(0, 10);
  zurichMidnight(requestedFrom ?? day);
  if (fromDay.getUTCDay() !== 1 || fromDay.getTime() + 7 * 86400000 > monday.getTime()) throw new Error("Report must cover a completed Monday–Sunday week");
  const untilDay = new Date(fromDay.getTime() + 7 * 86400000).toISOString().slice(0, 10);
  const previousDay = new Date(fromDay.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const thursday = new Date(fromDay.getTime() + 3 * 86400000);
  const yearStart = Date.UTC(thursday.getUTCFullYear(), 0, 1);
  return { from: zurichMidnight(day), until: zurichMidnight(untilDay), previousFrom: zurichMidnight(previousDay), fromDay: day, week: Math.ceil(((thursday.getTime() - yearStart) / 86400000 + 1) / 7) };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]!);
}
