export type WeeklyAnalyticsEvent = {
  eventName: string;
  sessionId: string;
  visitorHash: string;
};

export function weekOverWeek(current: number, previous: number) {
  if (previous === 0) return "nicht verfügbar";
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change > 0 ? "+" : ""}${change} % WoW`;
}

function eventCount(events: WeeklyAnalyticsEvent[], eventName: string) {
  return events.filter((event) => event.eventName === eventName).length;
}

export function weeklyTrafficHtml(
  events: WeeklyAnalyticsEvent[],
  previousEvents: WeeklyAnalyticsEvent[],
  newLeads: number,
) {
  const pageviews = eventCount(events, "page_view");
  const previousPageviews = eventCount(previousEvents, "page_view");
  const sessions = new Set(events.map((event) => event.sessionId)).size;
  const previousSessions = new Set(previousEvents.map((event) => event.sessionId)).size;
  const visitors = new Set(events.map((event) => event.visitorHash)).size;
  const previousVisitors = new Set(previousEvents.map((event) => event.visitorHash)).size;

  return `<h2>Traffic</h2><p><strong>Gesamt-Traffic</strong><br>Pageviews: ${pageviews} (${weekOverWeek(pageviews, previousPageviews)})<br>Sessions: ${sessions} (${weekOverWeek(sessions, previousSessions)})<br>Unique Visitors: ${visitors} (${weekOverWeek(visitors, previousVisitors)})</p><p><strong>Organisches Wachstum</strong><br>Organische Google-Klicks: nicht verfügbar<br>Google Search Impressions: nicht verfügbar<br>Durchschnittliche Google-Position: nicht verfügbar</p><h3>Traffic Quality / Einordnung</h3><p>Ein Teil der Seitenaufrufe kann durch interne Tests, Entwicklungsarbeiten und wiederholte Qualitätskontrollen entstehen. Deshalb sind Pageviews und Sessions allein nur eingeschränkt als Indikator für echtes Nutzerwachstum geeignet.</p><p>Für echtes Wachstum ist insbesondere diese Kombination relevant: steigende Unique Visitors, mehr organische Google-Klicks, steigende Google Search Impressions und echte Nutzerinteraktionen / Conversions.</p><p><small>Automatisch ausgeschlossen werden Bots, Admin-Seiten und Zugriffe über lokale Hosts. Weiterer interner/Test-Traffic ist derzeit nicht zuverlässig identifizierbar und kann enthalten sein.</small></p><h2>Nutzerinteraktionen / Conversions</h2><p>Suchen: ${eventCount(events, "search_completed")}<br>Trauorte geöffnet: ${eventCount(events, "location_view")}<br>Offizielle Links angeklickt: ${eventCount(events, "official_link_clicked")}<br>Externe Links angeklickt: ${eventCount(events, "external_link_clicked")}<br>Leads / Formulare: ${newLeads}</p>`;
}
