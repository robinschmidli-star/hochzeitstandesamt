export type CompletenessCategory = "Excellent" | "Good" | "Needs Improvement" | "Critical";

export type VenueQualityInput = {
  name?: unknown;
  officeId?: unknown;
  canton?: unknown;
  municipality?: unknown;
  address?: unknown;
  ceremonyDays?: unknown;
  reservation?: unknown;
  capacity?: unknown;
  indoor?: unknown;
  outdoor?: unknown;
  wheelchair?: unknown;
  parking?: unknown;
  season?: unknown;
  officialUrl?: unknown;
  sourceUrl?: unknown;
  imageUrl?: unknown;
  mediaFallbackStatus?: unknown;
  verificationStatus?: unknown;
  lastVerifiedAt?: unknown;
};

export const COMPLETENESS_WEIGHTS = {
  name: 5,
  officeId: 5,
  canton: 5,
  municipality: 5,
  address: 5,
  ceremonyDays: 7,
  reservation: 7,
  capacity: 6,
  indoorOutdoor: 4,
  wheelchair: 4,
  parking: 3,
  season: 4,
  source: 15,
  media: 15,
  verificationStatus: 5,
  lastVerifiedAt: 5
} as const;

const present = (value: unknown) =>
  value !== null && value !== undefined && value !== "" &&
  (!Array.isArray(value) || value.length > 0);

export function venueCompleteness(input: VenueQualityInput) {
  const checks: Array<[string, number, boolean]> = [
    ["Name", COMPLETENESS_WEIGHTS.name, present(input.name)],
    ["Zivilstandsamt", COMPLETENESS_WEIGHTS.officeId, present(input.officeId)],
    ["Kanton", COMPLETENESS_WEIGHTS.canton, present(input.canton)],
    ["Gemeinde", COMPLETENESS_WEIGHTS.municipality, present(input.municipality)],
    ["Adresse", COMPLETENESS_WEIGHTS.address, present(input.address)],
    ["Trautage", COMPLETENESS_WEIGHTS.ceremonyDays, present(input.ceremonyDays)],
    ["Reservation", COMPLETENESS_WEIGHTS.reservation, present(input.reservation)],
    ["Kapazität", COMPLETENESS_WEIGHTS.capacity, present(input.capacity)],
    ["Indoor / Outdoor", COMPLETENESS_WEIGHTS.indoorOutdoor, present(input.indoor) || present(input.outdoor)],
    ["Rollstuhlgängigkeit", COMPLETENESS_WEIGHTS.wheelchair, present(input.wheelchair)],
    ["Parkplätze", COMPLETENESS_WEIGHTS.parking, present(input.parking)],
    ["Saison", COMPLETENESS_WEIGHTS.season, present(input.season)],
    ["Offizielle Quelle", COMPLETENESS_WEIGHTS.source, present(input.officialUrl) || present(input.sourceUrl)],
    ["Foto / Medien-Fallback", COMPLETENESS_WEIGHTS.media, present(input.imageUrl) || present(input.mediaFallbackStatus)],
    ["Verification-Status", COMPLETENESS_WEIGHTS.verificationStatus, present(input.verificationStatus)],
    ["Letzte Prüfung", COMPLETENESS_WEIGHTS.lastVerifiedAt, present(input.lastVerifiedAt)]
  ];
  const score = checks.reduce((sum, [, weight, ok]) => sum + (ok ? weight : 0), 0);
  const category: CompletenessCategory = score >= 90 ? "Excellent" : score >= 75 ? "Good" : score >= 50 ? "Needs Improvement" : "Critical";
  return { score, category, missing: checks.filter(([, , ok]) => !ok).map(([label]) => label) };
}
