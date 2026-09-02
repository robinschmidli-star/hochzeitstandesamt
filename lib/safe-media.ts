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
  imageUrl?: string;
  imageAlt?: string;
  imageSource?: string;
  imageLicense?: string;
  imageAttribution?: string;
  imageStatus?: string;
  publicDisplayWithoutCreditApproved?: boolean;
};

function approvedImage(item: ImageLike, fallbackAlt: string): SafeMedia | null {
  if (
    item.imageStatus !== "approved" ||
    item.publicDisplayWithoutCreditApproved !== true ||
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
    (office) => office.id === venue.standesamt_id || office.slug === venue.standesamt_id
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
