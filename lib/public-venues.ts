import { ceremonyVenues } from "@/lib/ceremony-venues";
import type { CeremonyVenue } from "@/lib/types";

/**
 * Canonical UUIDs define venue identity. Similar names must not collapse here:
 * they may denote distinct venues and ambiguous duplicates belong in review.
 */
export function dedupePublicVenues(venues: CeremonyVenue[]) {
  return [...new Map(venues.map((venue) => [venue.canonicalId, venue])).values()];
}

export const publicCeremonyVenues = dedupePublicVenues(ceremonyVenues);

export function ceremonyVenuePath(venue: CeremonyVenue) {
  return `/trauort/${venue.canonicalId}`;
}
