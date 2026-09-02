import { ceremonyVenues } from "@/lib/ceremony-venues";
import type { CeremonyVenue } from "@/lib/types";

const normalizeVenueName = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && value !== "" &&
  (!Array.isArray(value) || value.length > 0);

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
  const grouped = new Map<string, CeremonyVenue[]>();

  for (const venue of venues) {
    const key = [venue.standesamt_id, venue.traulokal_name, venue.ort]
      .map(normalizeVenueName)
      .join(":");
    grouped.set(key, [...(grouped.get(key) ?? []), venue]);
  }

  return Array.from(grouped.values(), (candidates) => {
    const ordered = [...candidates].sort((left, right) =>
      qualityScore(right) - qualityScore(left) ||
      (left.canonicalId ?? "").localeCompare(right.canonicalId ?? "")
    );
    const selected = { ...ordered[0] };

    // Preserve the strongest row and only supplement values that are absent.
    // Conflicting non-empty values remain untouched for explicit data review.
    for (const candidate of ordered.slice(1)) {
      for (const field of Object.keys(candidate) as (keyof CeremonyVenue)[]) {
        if (!hasValue(selected[field]) && hasValue(candidate[field])) {
          Object.assign(selected, { [field]: candidate[field] });
        }
      }
    }
    return selected;
  });
}

export const publicCeremonyVenues = dedupePublicVenues(ceremonyVenues);

export function ceremonyVenuePath(venue: CeremonyVenue) {
  return `/trauort/${venue.canonicalId}`;
}
