import { ceremonyVenues } from "@/lib/ceremony-venues";
import { swissRegistryOffices } from "@/lib/registry-data";
import type { SwissRegistryOffice } from "@/lib/types";
import postalCodes from "switzerland-postal-codes/dist/postal-codes-full.json";

type PostalCodeEntry = {
  name: string;
  canton: string;
  latitude: string;
  longitude: string;
};

export type SearchParams = {
  location?: string;
  radius?: string;
  canton?: string;
  month?: string;
  year?: string;
  date?: string;
  weekday?: string;
  tag?: string;
  saturdayOnly?: string;
  wheelchair?: string;
  parking?: string;
  evening?: string;
  outdoor?: string;
  onlineBooking?: string;
  multipleVenues?: string;
  maxGuests?: string;
};

export type EnrichedRegistryOffice = SwissRegistryOffice & {
  available_weekdays: string[];
  saturday_weddings_available: true | false | "unknown";
  tags: string[];
  premiumVenueNames: string[];
  distanceKm?: number;
  shortDescription: string;
};

const postalCodeEntries = postalCodes as Record<string, PostalCodeEntry[]>;

const normalize = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function repairText(value = "") {
  if (!/[ÃÂâ]/.test(value)) return value;
  return value
    .replaceAll("Ã„", "Ä")
    .replaceAll("Ã–", "Ö")
    .replaceAll("Ãœ", "Ü")
    .replaceAll("Ã¤", "ä")
    .replaceAll("Ã¶", "ö")
    .replaceAll("Ã¼", "ü")
    .replaceAll("ÃŸ", "ß")
    .replaceAll("Ã©", "é")
    .replaceAll("Ã¨", "è")
    .replaceAll("Ãª", "ê")
    .replaceAll("Ã«", "ë")
    .replaceAll("Ã ", "à")
    .replaceAll("Ã¢", "â")
    .replaceAll("Ã´", "ô")
    .replaceAll("Ã§", "ç")
    .replaceAll("Ã®", "î")
    .replaceAll("Ã¯", "ï")
    .replaceAll("Ã»", "û")
    .replaceAll("Ã¹", "ù")
    .replaceAll("Ã¡", "á")
    .replaceAll("Ã³", "ó")
    .replaceAll("Ã±", "ñ")
    .replaceAll("Â·", "·")
    .replaceAll("Â±", "±")
    .replaceAll("Ã„", "Ä")
    .replaceAll("Ã–", "Ö")
    .replaceAll("Ãœ", "Ü")
    .replaceAll("Ã¤", "ä")
    .replaceAll("Ã¶", "ö")
    .replaceAll("Ã¼", "ü")
    .replaceAll("ÃŸ", "ß")
    .replaceAll("Ã©", "é")
    .replaceAll("Ãè", "è")
    .replaceAll("Ã¨", "è")
    .replaceAll("Ãê", "ê")
    .replaceAll("Ãª", "ê")
    .replaceAll("Ãë", "ë")
    .replaceAll("Ã«", "ë")
    .replaceAll("Ãà", "à")
    .replaceAll("Ã ", "à")
    .replaceAll("Ãâ", "â")
    .replaceAll("Ã¢", "â")
    .replaceAll("Ãô", "ô")
    .replaceAll("Ã´", "ô")
    .replaceAll("Ãç", "ç")
    .replaceAll("Ã§", "ç")
    .replaceAll("Ãî", "î")
    .replaceAll("Ã®", "î")
    .replaceAll("Ãï", "ï")
    .replaceAll("Ã¯", "ï")
    .replaceAll("Ãû", "û")
    .replaceAll("Ã»", "û")
    .replaceAll("Ãù", "ù")
    .replaceAll("Ã¹", "ù")
    .replaceAll("Ãá", "á")
    .replaceAll("Ã¡", "á")
    .replaceAll("Ãó", "ó")
    .replaceAll("Ã³", "ó")
    .replaceAll("Ãñ", "ñ")
    .replaceAll("Ã±", "ñ")
    .replaceAll("Â·", "·")
    .replaceAll("Â±", "±")
    .replaceAll("Â ", " ")
    .replaceAll("â€“", "–")
    .replaceAll("â€”", "—")
    .replaceAll("â€™", "’")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”");
}

function repairedMunicipalities(office: SwissRegistryOffice) {
  return office.responsibleMunicipalities.map(repairText);
}

function getVenues(office: SwissRegistryOffice) {
  return ceremonyVenues.filter((venue) => venue.standesamt_id === office.id || venue.standesamt_id === office.slug);
}

function getOfficeTags(office: SwissRegistryOffice) {
  const venues = getVenues(office);
  const text = normalize(
    [
      repairText(office.name),
      repairText(office.city),
      repairText(office.cantonName),
      repairText(office.addressLine1),
      repairText(office.ceremonyTimes),
      ...(office.ceremonyLocations ?? []).map(repairText),
      ...venues.map((venue) => [venue.traulokal_name, venue.beschreibung, ...(venue.tags ?? [])].map(repairText).join(" "))
    ].join(" ")
  );
  const tags = new Set<string>(venues.flatMap((venue) => venue.tags ?? []));

  if (/(see|lake|lac|lago|ufer|geneve|lausanne|lugano|locarno|zurich|zuerich|biel|neuchatel|thun|luzern)/.test(text)) tags.add("lake");
  if (/(schloss|castle|chateau|palazzo)/.test(text)) tags.add("castle");
  if (["GR", "VS", "TI", "UR", "OW", "NW", "GL"].includes(office.canton)) tags.add("mountains");
  if (/(altstadt|rathaus|histor|bourg|castello)/.test(text) || repairText(office.addressLine1).toLowerCase().includes("platz")) tags.add("historic");
  if (/(stadt|city|zentrum|rathaus)/.test(text)) tags.add("city");
  if (/(park|wald|garten|natur|see|berge)/.test(text)) tags.add("nature");
  if (/(zivilstandsamt|regionales|office)/.test(text)) tags.add("romantic");
  if (/(modern|zentrum|stadthaus)/.test(text)) tags.add("modern");
  if (
    venues.some((venue) => (venue.highlightLevel ?? 0) >= 3) ||
    venues.some((venue) => normalize(repairText(venue.beautyStatus ?? "")).includes("schon")) ||
    venues.some((venue) => (venue.tags ?? []).some((tag) => ["featured", "premium", "castle", "lake", "park", "nature", "historic", "schloss", "see", "natur", "historisch"].includes(normalize(repairText(tag))))) ||
    /(schloss|see|park|garten|panorama|altstadt|histor|palazzo|castello|zunfthaus|rathaus)/.test(text)
  ) tags.add("featured");

  return Array.from(tags);
}

function getSaturdayAvailability(office: SwissRegistryOffice) {
  const venues = getVenues(office);
  if (venues.some((venue) => venue.ceremonySaturday === true)) return true;
  if (office.ceremonySaturday === true) return true;
  if (venues.some((venue) => venue.ceremonySaturday === false)) return false;
  if (office.ceremonySaturday === false) return false;
  return "unknown" as const;
}

function getAvailableWeekdays(office: SwissRegistryOffice) {
  const venues = getVenues(office);
  const weekdays = [
    ["monday", office.ceremonyMonday || venues.some((venue) => venue.ceremonyMonday === true)],
    ["tuesday", office.ceremonyTuesday || venues.some((venue) => venue.ceremonyTuesday === true)],
    ["wednesday", office.ceremonyWednesday || venues.some((venue) => venue.ceremonyWednesday === true)],
    ["thursday", office.ceremonyThursday || venues.some((venue) => venue.ceremonyThursday === true)],
    ["friday", office.ceremonyFriday || venues.some((venue) => venue.ceremonyFriday === true)],
    ["saturday", office.ceremonySaturday || venues.some((venue) => venue.ceremonySaturday === true)],
    ["sunday", office.ceremonySunday || venues.some((venue) => venue.ceremonySunday === true)]
  ] as const;
  return weekdays.filter(([, value]) => value === true).map(([day]) => day);
}

function findCoordinates(value?: string) {
  const query = normalize(value);
  if (!query) return null;
  const postalMatch = query.match(/\b\d{4}\b/)?.[0];
  const entries = postalMatch
    ? postalCodeEntries[postalMatch] ?? []
    : Object.values(postalCodeEntries)
        .flat()
        .filter((entry) => normalize(entry.name) === query);
  const entry = entries[0];
  if (!entry) return null;
  return { lat: Number(entry.latitude), lon: Number(entry.longitude) };
}

function officeCoordinates(office: SwissRegistryOffice) {
  const entry = (postalCodeEntries[office.postalCode] ?? []).find((item) => normalize(item.name) === normalize(office.city)) ?? postalCodeEntries[office.postalCode]?.[0];
  if (!entry) return null;
  return { lat: Number(entry.latitude), lon: Number(entry.longitude) };
}

function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const radius = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * radius * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function enrichOffice(office: SwissRegistryOffice, origin?: { lat: number; lon: number } | null): EnrichedRegistryOffice {
  const coords = officeCoordinates(office);
  const tags = getOfficeTags(office);
  const venues = getVenues(office);
  const distance = origin && coords ? distanceKm(origin, coords) : undefined;
  const cleanMunicipalities = repairedMunicipalities(office);
  const cleanOffice = {
    ...office,
    name: repairText(office.name),
    cantonName: repairText(office.cantonName),
    city: repairText(office.city),
    addressLine1: repairText(office.addressLine1),
    postBox: repairText(office.postBox),
    openingHours: repairText(office.openingHours),
    ceremonyTimes: repairText(office.ceremonyTimes),
    mediaAlt: repairText(office.mediaAlt),
    mediaLicenseNote: repairText(office.mediaLicenseNote),
    responsibleMunicipalities: cleanMunicipalities
  };

  return {
    ...cleanOffice,
    available_weekdays: getAvailableWeekdays(office),
    saturday_weddings_available: getSaturdayAvailability(office),
    tags,
    premiumVenueNames: venues.map((venue) => repairText(venue.traulokal_name)),
    distanceKm: distance,
    shortDescription: `${cleanOffice.cantonName}: Zivilstandsamt in ${cleanOffice.city} mit Zuständigkeit für ${cleanMunicipalities.slice(0, 3).join(", ")}.`
  };
}

export function searchExperienceOffices(params: SearchParams) {
  const origin = findCoordinates(params.location);
  const radius = Number(params.radius || 0);
  const weekday = params.saturdayOnly === "true" ? "saturday" : params.weekday;
  const tag = params.tag;
  const locationQuery = normalize(params.location);
  const cantonQuery = normalize(params.canton);

  return swissRegistryOffices
    .map((office) => enrichOffice(office, origin))
    .filter((office) => {
      const venues = getVenues(office);
      const haystack = normalize([office.name, office.city, office.postalCode, office.canton, office.cantonName, ...office.responsibleMunicipalities].join(" "));
      if (cantonQuery && normalize(office.canton) !== cantonQuery && normalize(office.cantonName) !== cantonQuery) return false;
      if (locationQuery && !origin && !haystack.includes(locationQuery)) return false;
      if (origin && radius && typeof office.distanceKm === "number" && office.distanceKm > radius) return false;
      if (weekday && weekday !== "any" && !office.available_weekdays.includes(weekday)) return false;
      if (tag && !office.tags.includes(tag)) return false;
      if (params.wheelchair === "yes" && office.wheelchairAccessibleBoolean !== true && !venues.some((venue) => venue.wheelchairAccessible === true)) return false;
      if (params.parking === "yes" && office.parkingAvailableBoolean !== true && !venues.some((venue) => venue.parkingAvailable === true)) return false;
      if (params.evening === "yes" && office.eveningCeremonyAvailable !== true && !venues.some((venue) => venue.eveningCeremonyAvailable === true)) return false;
      if (params.outdoor === "yes" && office.outdoorCeremonyAvailable !== true && !venues.some((venue) => venue.outdoorCeremonyAvailable === true)) return false;
      if (params.onlineBooking === "yes" && office.onlineAppointmentBookingAvailable !== true) return false;
      if (params.multipleVenues === "yes" && office.multipleCeremonyVenuesAvailable !== true) return false;
      if (
        params.maxGuests &&
        (!office.maxCeremonyGuests || office.maxCeremonyGuests < Number(params.maxGuests)) &&
        !venues.some((venue) => venue.maxCeremonyGuests && venue.maxCeremonyGuests >= Number(params.maxGuests))
      ) return false;
      return true;
    })
    .sort((a, b) => {
      if (typeof a.distanceKm === "number" && typeof b.distanceKm === "number") return a.distanceKm - b.distanceKm;
      return a.canton.localeCompare(b.canton, "de-CH") || a.name.localeCompare(b.name, "de-CH");
    });
}
