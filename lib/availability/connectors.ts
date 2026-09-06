import type {
  AvailabilityConnector,
  AvailabilitySourceRecord,
  NormalizedAvailabilitySlot,
} from "./types";

const MONTHS: Record<string, number> = {
  januar: 0,
  februar: 1,
  märz: 2,
  maerz: 2,
  april: 3,
  mai: 4,
  juni: 5,
  juli: 6,
  august: 7,
  september: 8,
  oktober: 9,
  november: 10,
  dezember: 11,
};

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&auml;|&#228;/gi, "ä")
    .replace(/&ouml;|&#246;/gi, "ö")
    .replace(/&uuml;|&#252;/gi, "ü")
    .replace(/&Auml;|&#196;/g, "Ä")
    .replace(/&Ouml;|&#214;/g, "Ö")
    .replace(/&Uuml;|&#220;/g, "Ü")
    .replace(/&amp;/gi, "&")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function parseGermanPublishedDates(html: string): NormalizedAvailabilitySlot[] {
  const text = decodeHtml(html);
  const sectionPattern = /(?:Trau)?termine\s+(20\d{2})([\s\S]*?)(?=(?:Trau)?termine\s+20\d{2}|Anreise|Reservation|Kosten|Kontakt|$)/gi;
  const datePattern = /\b(0?[1-9]|[12]\d|3[01])\.?\s+(Januar|Februar|März|Maerz|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)(?:\s+(20\d{2}))?\b/gi;
  const byDate = new Map<string, NormalizedAvailabilitySlot>();

  for (const section of text.matchAll(sectionPattern)) {
    const sectionYear = Number(section[1]);
    const sectionText = section[2];

    for (const match of sectionText.matchAll(datePattern)) {
      const day = Number(match[1]);
      const monthName = match[2].toLowerCase();
      const year = match[3] ? Number(match[3]) : sectionYear;
      const month = MONTHS[monthName];
      if (month === undefined) continue;

      const date = new Date(Date.UTC(year, month, day));
      if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) continue;

      const start = Math.max(0, (match.index ?? 0) - 50);
      const end = Math.min(sectionText.length, (match.index ?? 0) + match[0].length + 90);
      const context = sectionText.slice(start, end).toLowerCase();
      const unavailable = /ausgebucht|belegt|nicht verfügbar|keine freien/.test(context);
      const explicitlyAvailable = /\bfrei\b|verfügbar|freie termine?/.test(context);
      const dateKey = isoDate(date);

      const slot: NormalizedAvailabilitySlot = {
        externalKey: dateKey,
        date,
        status: unavailable ? "unavailable" : explicitlyAvailable ? "available" : "unknown",
        precision: "published_wedding_day",
        rawReference: match[0],
      };

      const existing = byDate.get(dateKey);
      if (!existing || (existing.status === "unknown" && slot.status !== "unknown")) byDate.set(dateKey, slot);
    }
  }

  return [...byDate.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}

const officialPublishedDatesHtmlConnector: AvailabilityConnector = {
  key: "official-published-dates-html",
  async fetch(source, signal) {
    const response = await fetch(source.sourceUrl, {
      signal,
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "hochzeitstandesamt.ch availability sync (+https://www.hochzeitstandesamt.ch)",
      },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
    return response.text();
  },
  async normalize(payload) {
    const slots = parseGermanPublishedDates(payload);
    if (!slots.length) {
      throw new Error("No published wedding dates found; source layout may have changed");
    }
    return slots;
  },
};

const manualConnector: AvailabilityConnector = {
  key: "manual",
  async fetch() {
    throw new Error("Manual availability sources are not fetched automatically");
  },
  async normalize() {
    return [];
  },
};

const connectors = new Map<string, AvailabilityConnector>([
  [officialPublishedDatesHtmlConnector.key, officialPublishedDatesHtmlConnector],
  [manualConnector.key, manualConnector],
]);

export function getAvailabilityConnector(source: AvailabilitySourceRecord) {
  const connector = connectors.get(source.connectorKey);
  if (!connector) throw new Error(`Unknown availability connector: ${source.connectorKey}`);
  return connector;
}

export const availabilityConnectorKeys = [...connectors.keys()];
