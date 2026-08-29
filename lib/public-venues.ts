import { ceremonyVenues } from "@/lib/ceremony-venues";
import type { CeremonyVenue } from "@/lib/types";

const normalizeVenueName = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function qualityScore(venue: CeremonyVenue) {
  return [
    venue.officialConfirmed === true ? 16 : 0,
    venue.websitePriority ? 12 : 0,
    venue.imageUrl ? 8 : 0,
    venue.sourceUrl ? 4 : 0,
    venue.venueUrl ? 2 : 0,
    venue.beschreibung ? 2 : 0,
    venue.adresse ? 1 : 0,
    typeof venue.maxCeremonyGuests === "number" ? 1 : 0
  ].reduce((total, value) => total + value, 0);
}

/**
 * Public projection only: canonical source rows remain untouched. Duplicate
 * office/name pairs resolve deterministically to the most complete row.
 */
export function dedupePublicVenues(venues: CeremonyVenue[]) {
  const selected = new Map<string, CeremonyVenue>();

  for (const venue of venues) {
    const key = `${venue.standesamt_id}:${normalizeVenueName(venue.traulokal_name)}`;
    const current = selected.get(key);
    if (
      !current ||
      qualityScore(venue) > qualityScore(current) ||
      (qualityScore(venue) === qualityScore(current) &&
        (venue.canonicalId ?? "").localeCompare(current.canonicalId ?? "") < 0)
    ) {
      selected.set(key, venue);
    }
  }

  return Array.from(selected.values());
}

export const publicCeremonyVenues = dedupePublicVenues(ceremonyVenues);
