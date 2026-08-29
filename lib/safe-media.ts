import { repairText } from "@/lib/search-experience";
import { swissRegistryOffices } from "@/lib/registry-data";
import type { CeremonyVenue, SwissRegistryOffice } from "@/lib/types";

export type SafeMedia = {
  url?: string;
  alt: string;
  source?: string;
  license?: string;
  attribution?: string;
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
};

function approvedImage(item: ImageLike, fallbackAlt: string): SafeMedia | null {
  if (item.imageStatus !== "approved" || !item.imageUrl) return null;

  return {
    url: item.imageUrl,
    alt: repairText(item.imageAlt || fallbackAlt),
    source: repairText(item.imageSource),
    license: repairText(item.imageLicense),
    attribution: repairText(item.imageAttribution),
    status: "approved",
    fit: "cover"
  };
}

export function registryOfficeMedia(office: SwissRegistryOffice): SafeMedia {
  const approved = approvedImage(office, office.name);
  if (approved) return approved;

  const crest = officeCoatOfArmsMedia(office);
  if (crest) return crest;

  return {
    alt: repairText(`Bildplatzhalter für ${office.name}`),
    status: "placeholder",
    fit: "cover"
  };
}

function officeCoatOfArmsMedia(office: SwissRegistryOffice): SafeMedia | null {
  if (!office.coatOfArmsUrl) return null;

  return {
    url: office.coatOfArmsUrl,
    alt: repairText(office.mediaAlt || `Wappen ${office.city}`),
    license: repairText(office.mediaLicenseNote),
    status: "fallback_crest",
    fit: "contain"
  };
}

export function ceremonyVenueMedia(venue: CeremonyVenue): SafeMedia {
  const approved = approvedImage(venue, venue.traulokal_name);
  const office = swissRegistryOffices.find(
    (item) => item.id === venue.standesamt_id || item.slug === venue.standesamt_id
  );
  const fallback = office ? officeCoatOfArmsMedia(office) : null;

  if (approved) {
    return fallback ? { ...approved, fallback } : approved;
  }

  if (fallback?.url) return fallback;

  return {
    alt: repairText(`Bildplatzhalter für ${venue.traulokal_name}`),
    status: "placeholder",
    fit: "cover"
  };
}
