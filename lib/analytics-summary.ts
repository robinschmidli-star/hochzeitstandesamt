/** Shared definitions: actions, browsers and sequential journeys must not be mixed. */
export type ReportEvent = {
  eventName: string; visitorHash: string; sessionId: string; path: string;
  occurredAt: Date; properties: unknown;
};
const props = (event: ReportEvent): Record<string, unknown> =>
  event.properties && typeof event.properties === "object" ? event.properties as Record<string, unknown> : {};
const publicEvent = (event: ReportEvent) => !/^\/(?:de\/|en\/|fr\/|it\/)?(?:admin|verify|api)(?:\/|$)/.test(event.path.split("?")[0]);
export function summarizeAnalytics(input: ReportEvent[]) {
  const events = input.filter(publicEvent);
  const unique = (rows: ReportEvent[]) => new Set(rows.map(e => e.visitorHash)).size;
  const metrics = [
    ["page_view", "Seitenaufrufe"], ["search_completed", "Suchergebnis-Anzeigen"],
    ["venue_opened", "Trauort-Aufrufe"], ["location_view", "Zivilstandsamt-Aufrufe"],
    ["favorite_added", "Favoriten hinzugefügt"], ["official_link_clicked", "Offiziellen Link geöffnet"],
    ["external_link_clicked", "Externe Website / Kontakt geklickt"],
    ["lead_submitted", "Anfrage erfolgreich abgesendet (Tracking)"]
  ].map(([name, label]) => { const rows = events.filter(e => e.eventName === name); return { name, label, actions: rows.length, browsers: unique(rows) }; });
  // A journey requires temporal order within the same browser AND session.
  const journeys = new Map<string, ReportEvent[]>();
  for (const event of events) { const key = `${event.visitorHash}:${event.sessionId}`; const rows = journeys.get(key) ?? []; rows.push(event); journeys.set(key, rows); }
  const searchBrowsers = new Set<string>(), venueBrowsers = new Set<string>(), contactBrowsers = new Set<string>();
  for (const rows of journeys.values()) {
    let searchAt: number | undefined, venueAt: number | undefined;
    for (const event of rows.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())) {
      const time = event.occurredAt.getTime();
      if (event.eventName === "search_completed") { searchAt = time; searchBrowsers.add(event.visitorHash); }
      if (event.eventName === "venue_opened" && searchAt !== undefined && time > searchAt) { venueAt = time; venueBrowsers.add(event.visitorHash); }
      if (["official_link_clicked", "external_link_clicked"].includes(event.eventName) && venueAt !== undefined && time > venueAt) contactBrowsers.add(event.visitorHash);
    }
  }
  function breakdown(key: string, selected: ReportEvent[]) {
    const groups = new Map<string, ReportEvent[]>();
    for (const event of selected) {
      const raw = props(event)[key]; const label = typeof raw === "string" && raw.trim() ? raw : "Unbekannt / nicht erfasst";
      const rows = groups.get(label) ?? []; rows.push(event); groups.set(label, rows);
    }
    return [...groups].map(([label, rows]) => ({ label, actions: rows.length, browsers: unique(rows) })).sort((a, b) => b.actions - a.actions).slice(0, 10);
  }
  const pages = events.filter(e => e.eventName === "page_view");
  const venueEvents = events.filter(e => e.eventName === "venue_opened");
  return { visitors: unique(events), pageViews: pages.length, excluded: input.length - events.length, metrics,
    journey: { search: searchBrowsers.size, venue: venueBrowsers.size, contact: contactBrowsers.size },
    sources: breakdown("entry_source", pages), devices: breakdown("viewport_category", pages),
    cantons: breakdown("canton", venueEvents), venues: breakdown("venue_name", venueEvents),
    searchCantons: breakdown("search_canton", events.filter(e => e.eventName === "search_completed")),
    homeViews: pages.filter(e => /^\/(?:de|en|fr|it)?\/?$/.test(e.path.split("?")[0])).length };
}
export function escapeReport(value: string) { return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!); }
export function renderAnalyticsSummary(summary: ReturnType<typeof summarizeAnalytics>) {
  const table = (title: string, rows: { label: string; actions: number; browsers: number }[]) => `<h2>${title}</h2><table><tr><th>Merkmal</th><th>Aktionen</th><th>Browser</th></tr>${rows.map(r => `<tr><td>${escapeReport(r.label)}</td><td>${r.actions}</td><td>${r.browsers}</td></tr>`).join("")}</table>`;
  const rate = (n: number, d: number) => d ? `${(100 * n / d).toFixed(1)}%` : "–";
  const j = summary.journey;
  return `<p>${summary.visitors} eindeutige Browser · ${summary.pageViews} Seitenaufrufe · Startseitenanteil ${rate(summary.homeViews, summary.pageViews)}</p>`
    + table("Nutzung: Aktionen und eindeutige Browser", summary.metrics)
    + `<h2>Nachvollziehbarer Suchverlauf</h2><p>${j.search} Browser mit Suchergebnis-Anzeige → ${j.venue} mit späterem Trauort-Aufruf (${rate(j.venue, j.search)}) → ${j.contact} mit späterem externem / offiziellem Linkklick (${rate(j.contact, j.venue)}).</p><p>Schritte müssen zeitlich aufeinander folgen und in derselben Session stattfinden. Direkte Einstiege werden separat in der Nutzungstabelle gezählt. Kontaktklicks sind keine bestätigten Anfragen oder Buchungen.</p>`
    + table("Einstiegsquelle (Seitenaufrufe)", summary.sources) + table("Geräte (Seitenaufrufe)", summary.devices)
    + table("Nachfrage nach Trauort-Kanton", summary.cantons) + table("Suchkantone", summary.searchCantons) + table("Trauorte", summary.venues)
    + `<p>Browser-IDs sind keine Personen. Ein Browser kann in mehreren Gruppen vorkommen. Kantone beschreiben das Suchziel / den Trauort, nicht den Wohnort. Fehlende historische Angaben bleiben unbekannt. ${summary.excluded} Verwaltungs-/Verifikations-/API-Ereignisse ausgeschlossen. Unerkannte Bots und unmarkierte Tests bleiben möglich. Bei kleinen Fallzahlen keine belastbare Rangfolge ableiten.</p>`;
}

/** Local calendar Mondays converted individually to UTC, including DST changes. */
export function zurichReportWindow(now: Date) {
  const local = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => Number(local.find(p => p.type === type)!.value);
  const monday = new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() || 7) + 1);
  const midnight = (days: number) => {
    const calendar = new Date(monday); calendar.setUTCDate(calendar.getUTCDate() + days);
    const offset = new Intl.DateTimeFormat("en", { timeZone: "Europe/Zurich", timeZoneName: "longOffset" }).formatToParts(calendar).find(p => p.type === "timeZoneName")!.value;
    const match = /GMT([+-])(\d{2}):(\d{2})/.exec(offset)!;
    const minutes = (Number(match[2]) * 60 + Number(match[3])) * (match[1] === "+" ? 1 : -1);
    return new Date(calendar.getTime() - minutes * 60_000);
  };
  return { from: midnight(-7), to: midnight(0), previousFrom: midnight(-14) };
}
