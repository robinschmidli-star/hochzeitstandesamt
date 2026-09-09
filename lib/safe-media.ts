import { repairText } from "@/lib/search-experience";
import { registryCantons, swissRegistryOffices } from "@/lib/registry-data";
import type { CeremonyVenue, RegistryCanton, SwissRegistryOffice } from "@/lib/types";

export type SafeMedia = {
  url?: string;
  alt: string;
  status: "approved" | "fallback_crest" | "placeholder";
  fit: "cover" | "contain";
  fallback?: SafeMedia;
};

type ImageLike = {
  canonicalId?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageSource?: string;
  imageLicense?: string;
  imageAttribution?: string;
  imageStatus?: string;
  publicDisplayWithoutCreditApproved?: boolean;
};

// These venue images have already been provenance-reviewed and their rights holders
// explicitly permitted publication on hochzeitstandesamt.ch. Keep this narrowly scoped
// until the same permission flag is present in the public media replica.
const reviewedVenueMediaApprovalIds = new Set([
  "c6d3d621-e916-5ba1-8b9d-d3014c0a66e8", // Castello Sasso Corbaro
  "da067a71-7a88-57e9-8d51-e98d7904c299", // Schlossberg Thun
  "ed5f604c-4808-5229-ac5e-c5c38f385405", // Aigle – Château d'Aigle
  "ed5f604c-4808-5229-ac5e-c5c38f385405", // Château d'Aigle
  "8d12e60e-efe9-582e-9dd9-70310cabac95", // Hotel Blausee
  "5e2de59f-7a00-550d-ad82-e8e9be617b93" // Villa Ciani
]);

function approvedImage(item: ImageLike, fallbackAlt: string): SafeMedia | null {
  const publicDisplayApproved =
    item.publicDisplayWithoutCreditApproved === true ||
    (item.canonicalId ? reviewedVenueMediaApprovalIds.has(item.canonicalId) : false);

  if (
    item.imageStatus !== "approved" ||
    !publicDisplayApproved ||
    !item.imageUrl
  ) return null;

  return {
    url: item.imageUrl,
    alt: repairText(item.imageAlt || fallbackAlt),
    status: "approved",
    fit: "cover"
  };
}

export function registryOfficeMedia(office: SwissRegistryOffice): SafeMedia {
  const approved = approvedImage(office, office.name);
  if (approved) return approved;

  const crest = coatOfArmsMedia(office.coatOfArmsUrl, office.mediaAlt || `Wappen ${office.city}`);
  if (crest) return crest;

  return {
    alt: repairText(`Bildplatzhalter für ${office.name}`),
    status: "placeholder",
    fit: "cover"
  };
}

function coatOfArmsMedia(url?: string, alt = "Wappen"): SafeMedia | null {
  if (!url) return null;
  return { url, alt: repairText(alt), status: "fallback_crest", fit: "contain" };
}

function venueFallbackMedia(venue: CeremonyVenue): SafeMedia {
  const ownCrest = coatOfArmsMedia(venue.coatOfArmsUrl, venue.mediaAlt || `Wappen ${venue.traulokal_name}`);
  if (ownCrest) return ownCrest;

  const responsibleOffice = swissRegistryOffices.find(
    (office) => office.canonicalId === venue.standesamt_id || office.id === venue.standesamt_id || office.slug === venue.standesamt_id
  );
  const officeCrest = responsibleOffice && coatOfArmsMedia(
    responsibleOffice.coatOfArmsUrl,
    responsibleOffice.mediaAlt || `Wappen ${responsibleOffice.city}`
  );
  if (officeCrest) return officeCrest;

  const municipality = repairText(venue.ort).toLocaleLowerCase();
  const municipalityOffice = municipality && swissRegistryOffices.find((office) =>
    office.canton === venue.kanton &&
    (repairText(office.city).toLocaleLowerCase() === municipality ||
      office.responsibleMunicipalities.some((name) => repairText(name).toLocaleLowerCase() === municipality)) &&
    office.coatOfArmsUrl
  );
  const municipalityCrest = municipalityOffice && coatOfArmsMedia(
    municipalityOffice.coatOfArmsUrl,
    municipalityOffice.mediaAlt || `Wappen ${venue.ort}`
  );
  if (municipalityCrest) return municipalityCrest;

  const canton = registryCantons.find((item) => item.code === venue.kanton) as RegistryCanton | undefined;
  const cantonCrest = coatOfArmsMedia(canton?.coatOfArmsUrl, canton?.mediaAlt || `Wappen Kanton ${canton?.name || venue.kanton}`);
  if (cantonCrest) return cantonCrest;

  return {
    alt: repairText(`Bildplatzhalter für ${venue.traulokal_name}`),
    status: "placeholder",
    fit: "cover"
  };
}

export function ceremonyVenueMedia(venue: CeremonyVenue): SafeMedia {
  const approved = approvedImage(venue, venue.traulokal_name);
  const fallback = venueFallbackMedia(venue);
  if (approved) return fallback.url ? { ...approved, fallback } : approved;
  return fallback;
}

export function ceremonyVenueGallery(venue: CeremonyVenue): SafeMedia[] {
  const candidates: SafeMedia[] = [];
  const primary = approvedImage(venue, venue.traulokal_name);
  if (primary) candidates.push(primary);

  for (const image of venue.galleryImages ?? []) {
    if (!image.publicDisplayWithoutCreditApproved || !image.url) continue;
    candidates.push({
      url: image.url,
      alt: repairText(image.alt || venue.traulokal_name),
      status: "approved",
      fit: "cover"
    });
  }

  const seen = new Set<string>();
  const approved = candidates.filter((image) => {
    const key = image.url!.trim().toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return approved.length ? approved : [ceremonyVenueMedia(venue)];
}
