export const ANALYTICS_VERSION = 3;
export const actionLabels: Record<string, string> = {
  page_view: "Seitenaufrufe", search_started: "Bewusste Suchauslösungen", search_filter_changed: "Filteränderungen", search_pagination: "Ergebnisseiten gewechselt",
  search_results_viewed: "Ergebnisanzeigen (auch automatisch)", search_completed: "Historische Suchanzeigen (Absicht unbekannt)",
  venue_opened: "Trauort-Aufrufe", location_view: "Zivilstandsamt-Aufrufe", favorite_added: "Favoriten hinzugefügt", favorite_removed: "Favoriten entfernt",
  availability_clicked: "Verfügbarkeit geprüft", official_link_clicked: "Offizielle Weiterleitung (Bedeutung unbekannt)", external_link_clicked: "Externe Linkklicks",
  lead_created: "Speicherbestätigung (Browser-Tracking)", lead_started: "Anfrage begonnen", lead_submitted: "Anfrage abgesendet (Tracking)",
  vendor_impression: "Anbieteranzeigen", vendor_profile_opened: "Anbieterprofil-Aufrufe", vendor_website_clicked: "Anbieterwebsite-Klicks", vendor_contact_started: "Anbieterkontakt begonnen",
  sponsored_impression: "Gesponserte Anzeigen", sponsored_click: "Gesponserte Klicks"
};
export function analyticsPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return null;
  const path = value.split(/[?#]/, 1)[0];
  if (/^\/(?:de\/|en\/|fr\/|it\/)?(?:admin|verify|api)(?:\/|$)/.test(path)) return null;
  return path.slice(0, 500);
}
export function cleanProperties(input: Record<string, unknown>) {
  const result: Record<string, string | number | boolean | string[]> = {};
  const choices: Record<string, readonly string[]> = {
    language: ["de", "fr", "it", "en"], viewport_category: ["mobile", "tablet", "desktop"], contact_channel: ["website", "phone", "email", "booking"],
    link_purpose: ["contact", "booking", "website", "source", "unknown"], entity_type: ["venue", "office", "vendor"], session_scope: ["browser", "tab"],
    entry_source: ["direct", "internal", "search", "social", "referral", "unknown"]
  };
  const campaigns=(process.env.NEXT_PUBLIC_ANALYTICS_CAMPAIGN_CODES??"").split(",").filter(code=>/^[a-z0-9_-]{1,60}$/.test(code));
  if(typeof input.campaign_code==="string" && ["none","unknown",...campaigns].includes(input.campaign_code))result.campaign_code=input.campaign_code;
  for (const [key, values] of Object.entries(choices)) if (typeof input[key] === "string" && values.includes(input[key] as string)) result[key] = input[key] as string;
  for (const key of ["venue_id", "civil_registry_office_id", "entity_id", "vendor_id", "search_id"])
    if (typeof input[key] === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(input[key] as string)) result[key] = input[key] as string;
  for (const key of ["canton", "search_canton"]) if (typeof input[key] === "string" && /^(?:ZH|BE|LU|UR|SZ|OW|NW|GL|ZG|FR|SO|BS|BL|SH|AR|AI|SG|GR|AG|TG|TI|VD|VS|NE|GE|JU)$/.test(input[key] as string)) result[key] = input[key] as string;
  if (typeof input.venue_name === "string") result.venue_name = input.venue_name.slice(0, 150);
  for (const key of ["analytics_version", "result_count", "radius_km", "search_lat", "search_lon"])
    if (typeof input[key] === "number" && Number.isFinite(input[key])) result[key] = input[key] as number;
  if (typeof input.search_place_id === "string" && /^ch-postal:\d{4}:[a-z0-9-]+$/.test(input.search_place_id)) result.search_place_id = input.search_place_id;
  if (Array.isArray(input.filters)) result.filters = input.filters.filter((key): key is string => typeof key === "string" && ["name", "location", "canton", "radius", "month", "year", "date", "weekday", "tag", "saturdayOnly", "elopement", "wheelchair", "parking", "evening", "outdoor", "onlineBooking", "multipleVenues", "maxGuests", "postalCode", "dateStart", "dateEnd", "preferredWeekdays"].includes(key));
  if (typeof input.session_entry_path === "string") { const path=analyticsPath(input.session_entry_path); if(path)result.session_entry_path=path; }
  return result;
}
export function isQualifiedContact(p: Record<string, unknown>) {
  return (p.link_purpose === "contact" && ["phone", "email"].includes(String(p.contact_channel))) || (p.link_purpose === "booking" && p.contact_channel === "booking");
}
