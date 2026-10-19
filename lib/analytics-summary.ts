import { actionLabels, analyticsPath, isQualifiedContact } from "./analytics-policy";
export type ReportEvent = { eventName: string; visitorHash: string; sessionId?: string; path?: string; occurredAt?: Date; properties?: unknown };
export const eventProperties = (event: ReportEvent): Record<string, unknown> => event.properties && typeof event.properties === "object" && !Array.isArray(event.properties) ? event.properties as Record<string, unknown> : {};
export function summarizeAnalytics(input: ReportEvent[]) {
  const events = input.filter(e => !e.path || analyticsPath(e.path) !== null);
  const unique = (rows: ReportEvent[]) => new Set(rows.map(e => e.visitorHash).filter(Boolean)).size;
  const metrics = Object.entries(actionLabels).map(([name,label]) => {
    const rows = events.filter(e => e.eventName === name && (name!=="search_started" || eventProperties(e).analytics_version===3));
    return { name,label,actions: rows.length,browsers: unique(rows),measured: rows.length > 0 || !["vendor_impression","vendor_website_clicked","vendor_contact_started","sponsored_impression","sponsored_click","search_completed"].includes(name) && events.some(e => eventProperties(e).analytics_version === 3) };
  });
  const sessions = new Map<string, ReportEvent[]>();
  for (const event of events) {
    if (!event.sessionId || !event.occurredAt || eventProperties(event).analytics_version !== 3) continue;
    const key = `${event.visitorHash}:${event.sessionId}`, rows = sessions.get(key) ?? []; rows.push(event); sessions.set(key,rows);
  }
  const search = new Set<string>(), venue = new Set<string>(), contact = new Set<string>(), direct = new Set<string>();
  for (const rows of sessions.values()) {
    let searchAt: number | undefined;
    const venues = new Map<string,number>();
    const sorted = [...rows].sort((a,b) => a.occurredAt!.getTime()-b.occurredAt!.getTime());
    const firstPage = sorted.find(e => typeof eventProperties(e).session_entry_path === "string");
    if (firstPage && /^\/(?:de\/|fr\/|it\/|en\/)?trauort\//.test(String(eventProperties(firstPage).session_entry_path))) direct.add(firstPage.visitorHash);
    for (const event of sorted) {
      const time = event.occurredAt!.getTime(), p = eventProperties(event);
      if (event.eventName === "search_started") { searchAt ??= time; search.add(event.visitorHash); }
      if (event.eventName === "venue_opened" && searchAt !== undefined && time > searchAt && typeof p.venue_id === "string") { venues.set(p.venue_id,time); venue.add(event.visitorHash); }
      const viewedAt = typeof p.venue_id === "string" ? venues.get(p.venue_id) : undefined;
      if (event.eventName === "external_link_clicked" && viewedAt !== undefined && time > viewedAt && isQualifiedContact(p)) contact.add(event.visitorHash);
    }
  }
  function breakdown(key: string, selected: ReportEvent[]) {
    const groups = new Map<string,ReportEvent[]>();
    for (const event of selected) { const raw = eventProperties(event)[key],label = typeof raw === "string" && raw.trim() ? raw : "Unbekannt / nicht erfasst"; const rows = groups.get(label) ?? []; rows.push(event); groups.set(label,rows); }
    return [...groups].map(([label,rows]) => ({label,actions:rows.length,browsers:unique(rows)})).sort((a,b) => b.actions-a.actions || a.label.localeCompare(b.label));
  }
  const pages = events.filter(e => e.eventName === "page_view"), venues = events.filter(e => e.eventName === "venue_opened");
  const searches = events.filter(e => e.eventName === "search_started" && eventProperties(e).analytics_version===3), contacts = events.filter(e => e.eventName === "external_link_clicked");
  const known = searches.filter(e => typeof eventProperties(e).search_lat === "number" && typeof eventProperties(e).search_lon === "number");
  return { visitors:unique(events),pageViews:pages.length,sessions:new Set(events.filter(e => e.sessionId).map(e => `${e.visitorHash}:${e.sessionId}`)).size,excluded:input.length-events.length,metrics,
    journey:{search:search.size,venue:venue.size,contact:contact.size,measured:sessions.size>0},directVenue:direct.size,
    sources:breakdown("entry_source",pages),campaigns:breakdown("campaign_code",pages),devices:breakdown("viewport_category",pages),languages:breakdown("language",pages),
    cantons:breakdown("canton",venues),venues:breakdown("venue_name",venues),searchCantons:breakdown("search_canton",searches),searchPlaces:breakdown("search_place_id",searches),
    contactChannels:breakdown("contact_channel",contacts),contactPurposes:breakdown("link_purpose",contacts),
    homeViews:pages.filter(e => /^\/(?:de|en|fr|it)?\/?$/.test(e.path?.split(/[?#]/)[0] ?? "")).length,
    winterthur:{actions:known.filter(e => distanceKm(47.499,8.724,Number(eventProperties(e).search_lat),Number(eventProperties(e).search_lon))<=25).length,unknown:searches.length-known.length}
  };
}
export function distanceKm(a: number,b: number,c: number,d: number) {
  const r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
export function escapeReport(value: string) { return value.replace(/[&<>"']/g,c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]!); }
export function renderAnalyticsSummary(s: ReturnType<typeof summarizeAnalytics>) {
  const table=(title:string,rows:{label:string;actions:number;browsers:number;measured?:boolean}[]) => `<h2>${title}</h2><table><tr><th>Merkmal</th><th>Aktionen</th><th>Browser</th></tr>${rows.map(r=>`<tr><td>${escapeReport(r.label)}</td><td>${r.measured===false?"nicht erfasst":r.actions}</td><td>${r.measured===false?"nicht erfasst":r.browsers}</td></tr>`).join("")}</table>`;
  const rate=(n:number,d:number)=>d?`${(100*n/d).toFixed(1)}%`:"–",j=s.journey;
  return `<p>${s.visitors} eindeutige Browser · ${s.sessions} erfasste Sessions · ${s.pageViews} Seitenaufrufe · Anteil Sprachstartseiten ${rate(s.homeViews,s.pageViews)}</p>`
    +table("Nutzung: Aktionen und eindeutige Browser",s.metrics)
    +`<h2>Suchverlauf (Messrevision 3)</h2><p>${j.measured?`${j.search} Browser mit bewusster Suche → ${j.venue} mit späterem Trauort-Aufruf (${rate(j.venue,j.search)}) → ${j.contact} mit späterem Kontakt-/Buchungslinkklick für denselben Trauort (${rate(j.contact,j.venue)}).`:"Nicht vollständig messbar: historische Suchabsicht oder Kontaktzuordnung fehlen."}</p><p>Gleicher Browser, gleiche Session, strikte zeitliche Reihenfolge. ${s.directVenue} Browser mit direktem Trauort-Einstieg in einer erfassten Session. Quellen- und allgemeine Websitelinks zählen nicht zur Kontaktstufe; Klicks bestätigen weder Kontaktaufnahme noch Buchung.</p>`
    +`<p>Unbekannte Einstiegsquelle: ${rate(s.sources.find(r=>r.label==="Unbekannt / nicht erfasst")?.actions??0,s.pageViews)} der Seitenaufrufe; unbekanntes Gerät: ${rate(s.devices.find(r=>r.label==="Unbekannt / nicht erfasst")?.actions??0,s.pageViews)}.</p>`+table("Einstiegsquellen (Seitenaufrufe)",s.sources)+table("Kampagnen (nur konfigurierte öffentliche Codes)",s.campaigns)+table("Geräte",s.devices)+table("Seitensprachen",s.languages)+table("Suchkantone",s.searchCantons)+table("Suchorte",s.searchPlaces)+table("Betrachtete Trauort-Kantone",s.cantons)+table("Kontaktkanäle",s.contactChannels)+table("Bedeutung der Linkklicks",s.contactPurposes)
    +`<p>Suchziele im 25-km-Luftkreis um Winterthur (47.499, 8.724; kantonsübergreifend): ${s.winterthur.actions} Suchaktionen; ${s.winterthur.unknown} ohne zuordenbare Koordinaten. Das ist weder Besucherwohnort noch eine Aussage über einen ganzen Kanton.</p><p>Browser sind keine Personen oder Hochzeitspaare. Gruppen überschneiden sich und dürfen bei Browserzahlen nicht addiert werden. Unbekannte Angaben bleiben sichtbar; CH ist das Marktkennzeichen, kein Besuchsland. Kleine Fallzahlen belegen keine belastbaren Präferenzen. ${s.excluded} erkennbare Verwaltungs-/Verifikations-/API-Ereignisse ausgeschlossen. Unerkannte Bots und unmarkierte Tests bleiben möglich.</p>`;
}
