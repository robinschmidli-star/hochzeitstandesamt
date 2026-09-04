import { publicCeremonyVenues } from "@/lib/public-venues";
import type { CeremonyVenue } from "@/lib/types";
import { swissRegistryOffices } from "@/lib/registry-data";
import type { SwissRegistryOffice } from "@/lib/types";
import postalCodes from "switzerland-postal-codes/dist/postal-codes-full.json";
import { nameMatchRank } from "@/lib/name-search";

type PostalCodeEntry = {
  name: string;
  canton: string;
  latitude: string;
  longitude: string;
};

export type SearchParams = {
  submitted?: string;
  page?: string;
  postalCode?: string;
  dateStart?: string;
  dateEnd?: string;
  preferredWeekdays?: string;
  name?: string;
  location?: string;
  radius?: string;
  canton?: string;
  month?: string;
  year?: string;
  date?: string;
  weekday?: string;
  tag?: string;
  saturdayOnly?: string;
  elopement?: string;
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
  elopementSuitable: boolean;
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
  return publicCeremonyVenues.filter((venue) => venue.standesamt_id === office.canonicalId || venue.standesamt_id === office.id || venue.standesamt_id === office.slug);
}

export function isElopementSuitableVenue(venue: CeremonyVenue) {
  const capacity = venue.maxCeremonyGuests;
  if (typeof capacity !== "number" || capacity < 2 || capacity > 30) return false;
  if (capacity <= 20) return true;
  const natureSignal = normalize(
    [venue.traulokal_name, venue.beschreibung, ...(venue.tags ?? [])].map(repairText).join(" ")
  );
  return /(see|lake|lac|lago|ufer|fluss|riviere|berg|mountain|wald|foret|park|garten|garden|natur|panorama)/.test(natureSignal);
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
  if (venues.some((venue) => venue.websitePriority?.startsWith("Top20:"))) {
    tags.add("featured");
  }

  return Array.from(tags);
}

// Dates indicate a requested weekday, not live appointment availability.
export function searchWeekday(params: SearchParams) {
  if (params.saturdayOnly === "true") return "saturday";
  if (params.weekday && params.weekday !== "any") return params.weekday;
  if (!params.date || !/^\d{4}-\d{2}-\d{2}$/.test(params.date)) return undefined;
  const date = new Date(`${params.date}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== params.date) return undefined;
  return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][date.getUTCDay()];
}

function matchesPostalCode(office: SwissRegistryOffice, postalCode?: string) {
  if (!postalCode) return true;
  if (office.postalCode.includes(postalCode)) return true;
  return (postalCodeEntries[postalCode] ?? []).some((place) =>
    normalize(place.canton) === normalize(office.canton) &&
    [office.city, ...office.responsibleMunicipalities].some((name) => normalize(name) === normalize(place.name))
  );
}

function preferredDays(value?: string) {
  const aliases: Record<string, string> = { mo: "monday", lun: "monday", lu: "monday", mon: "monday", di: "tuesday", mar: "tuesday", ma: "tuesday", tue: "tuesday", mi: "wednesday", mer: "wednesday", me: "wednesday", wed: "wednesday", do: "thursday", gio: "thursday", jeu: "thursday", je: "thursday", thu: "thursday", fr: "friday", ven: "friday", ve: "friday", fri: "friday", sa: "saturday", sab: "saturday", sam: "saturday", sat: "saturday", so: "sunday", dom: "sunday", dim: "sunday", sun: "sunday" };
  return value?.split(",").map((day) => aliases[normalize(day)] ?? normalize(day)).filter(Boolean) ?? [];
}

export function featuredCeremonyVenues(params: SearchParams = {}) {
  return searchCeremonyVenues(params)
    .filter((venue) => /^Top20:\d{2}$/.test(venue.websitePriority ?? ""))
    .sort((left, right) => (left.websitePriority ?? "").localeCompare(right.websitePriority ?? ""));
}

export function searchCeremonyVenues(params: SearchParams = {}) {
  const nameQuery = params.name?.trim() ?? "";
  const locationQuery = normalize(params.location);
  const cantonQuery = normalize(params.canton);
  const weekday = searchWeekday(params);
  const weekdayField = weekday && weekday !== "any"
    ? `ceremony${weekday[0].toUpperCase()}${weekday.slice(1)}` as keyof CeremonyVenue
    : null;
  const minimumGuests = Number(params.maxGuests);
  const preferred = preferredDays(params.preferredWeekdays);

  return publicCeremonyVenues
    .filter((venue) => {
      const office = swissRegistryOffices.find((item) => item.canonicalId === venue.standesamt_id || item.id === venue.standesamt_id || item.slug === venue.standesamt_id);
      if (!office) return false;
      if (!matchesPostalCode(office, params.postalCode)) return false;
      if (preferred.length && !preferred.some((day) => venue[`ceremony${day[0].toUpperCase()}${day.slice(1)}` as keyof CeremonyVenue] === true)) return false;
      if (nameQuery && nameMatchRank(venue.traulokal_name, nameQuery, [office.name], [venue.ort, venue.adresse, office.city, office.postalCode]) === null) return false;
      if (cantonQuery && normalize(venue.kanton || office.canton) !== cantonQuery && normalize(office.cantonName) !== cantonQuery) return false;
      if (locationQuery && !normalize([venue.ort, venue.adresse, office.city, ...office.responsibleMunicipalities].join(" ")).includes(locationQuery)) return false;
      if (weekdayField && venue[weekdayField] !== true) return false;
      if (params.elopement === "true" && !isElopementSuitableVenue(venue)) return false;
      if (params.wheelchair === "yes" && venue.wheelchairAccessible !== true) return false;
      if (params.parking === "yes" && venue.parkingAvailable !== true) return false;
      if (params.evening === "yes" && venue.eveningCeremonyAvailable !== true) return false;
      if (params.outdoor === "yes" && venue.outdoorCeremonyAvailable !== true) return false;
      if (params.onlineBooking === "yes" && office.onlineAppointmentBookingAvailable !== true) return false;
      if (params.multipleVenues === "yes" && office.multipleCeremonyVenuesAvailable !== true) return false;
      if (Number.isFinite(minimumGuests) && minimumGuests > 0 && (!venue.maxCeremonyGuests || venue.maxCeremonyGuests < minimumGuests)) return false;
      return true;
    })
    .sort((left, right) => venueRank(left, nameQuery) - venueRank(right, nameQuery) || left.traulokal_name.localeCompare(right.traulokal_name, "de-CH"));
}

function venueRank(venue: CeremonyVenue, query: string) {
  return nameMatchRank(venue.traulokal_name, query, [], [venue.ort, venue.adresse, venue.standesamt_name]) ?? 99;
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
  const elopementSuitable = venues.some(isElopementSuitableVenue);
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
    elopementSuitable,
    distanceKm: distance,
    shortDescription: `${cleanOffice.cantonName}: Zivilstandsamt in ${cleanOffice.city} mit Zuständigkeit für ${cleanMunicipalities.slice(0, 3).join(", ")}.`
  };
}

export function searchExperienceOffices(params: SearchParams) {
  const origin = findCoordinates(params.location || params.name);
  const radius = Number(params.radius || 0);
  const weekday = searchWeekday(params);
  const tag = params.tag;
  const locationQuery = normalize(params.location);
  const cantonQuery = normalize(params.canton);
  const nameQuery = params.name?.trim() ?? "";
  const preferred = preferredDays(params.preferredWeekdays);

  return swissRegistryOffices
    .map((office) => enrichOffice(office, origin))
    .filter((office) => {
      const venues = getVenues(office);
      if (!matchesPostalCode(office, params.postalCode)) return false;
      if (preferred.length && !preferred.some((day) => office.available_weekdays.includes(day))) return false;
      const haystack = normalize([office.name, office.city, office.postalCode, office.canton, office.cantonName, ...office.responsibleMunicipalities].join(" "));
      if (cantonQuery && normalize(office.canton) !== cantonQuery && normalize(office.cantonName) !== cantonQuery) return false;
      if (nameQuery && nameMatchRank(office.name, nameQuery, [...(office.ceremonyLocations ?? []), ...venues.map((venue) => venue.traulokal_name)], [office.city, office.postalCode, ...office.responsibleMunicipalities, ...venues.flatMap((venue) => [venue.ort, venue.adresse])]) === null) return false;
      if (locationQuery && !origin && !haystack.includes(locationQuery)) return false;
      if (origin && radius && typeof office.distanceKm === "number" && office.distanceKm > radius) return false;
      if (weekday && weekday !== "any" && !office.available_weekdays.includes(weekday)) return false;
      if (tag && !office.tags.includes(tag)) return false;
      if (params.elopement === "true" && !office.elopementSuitable) return false;
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
      if (nameQuery) {
        const rank = (office: EnrichedRegistryOffice) => {
          const venues = getVenues(office);
          return nameMatchRank(office.name, nameQuery, [...(office.ceremonyLocations ?? []), ...venues.map((venue) => venue.traulokal_name)], [office.city, office.postalCode, ...office.responsibleMunicipalities, ...venues.flatMap((venue) => [venue.ort, venue.adresse])]) ?? 99;
        };
        const rankDifference = rank(a) - rank(b);
        if (rankDifference) return rankDifference;
      }
      if (typeof a.distanceKm === "number" && typeof b.distanceKm === "number") return a.distanceKm - b.distanceKm;
      return a.canton.localeCompare(b.canton, "de-CH") || a.name.localeCompare(b.name, "de-CH");
    });
}

export function searchExperienceResults(params: SearchParams): Array<CeremonyVenue | EnrichedRegistryOffice> {
  if (!params.name?.trim()) return searchExperienceOffices(params);
  const venues = searchCeremonyVenues(params);
  const offices = searchExperienceOffices(params);
  return [...venues, ...offices].sort((left, right) => {
    const leftVenue = "traulokal_name" in left;
    const rightVenue = "traulokal_name" in right;
    const leftBaseRank = leftVenue
      ? venueRank(left, params.name!)
      : nameMatchRank(left.name, params.name!, left.ceremonyLocations ?? [], [left.city, ...left.responsibleMunicipalities, left.postalCode]) ?? 99;
    const rightBaseRank = rightVenue
      ? venueRank(right, params.name!)
      : nameMatchRank(right.name, params.name!, right.ceremonyLocations ?? [], [right.city, ...right.responsibleMunicipalities, right.postalCode]) ?? 99;
    const leftRank = leftBaseRank === 0 && !leftVenue ? 1 : leftBaseRank;
    const rightRank = rightBaseRank === 0 && !rightVenue ? 1 : rightBaseRank;
    return leftRank - rightRank ||
      Number(leftVenue) - Number(rightVenue) ||
      (leftVenue ? left.traulokal_name : left.name).localeCompare(rightVenue ? right.traulokal_name : right.name, "de-CH");
  });
}
