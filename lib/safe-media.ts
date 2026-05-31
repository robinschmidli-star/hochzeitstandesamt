import { repairText } from "@/lib/search-experience";
import type { CeremonyVenue, SwissRegistryOffice } from "@/lib/types";

export type SafeMedia = {
  url?: string;
  alt: string;
  source?: string;
  license?: string;
  attribution?: string;
  status: "approved" | "fallback_crest" | "placeholder";
  fit: "cover" | "contain";
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

  if (office.coatOfArmsUrl) {
    return {
      url: office.coatOfArmsUrl,
      alt: repairText(office.mediaAlt || office.imageAlt || `Wappen ${office.city}`),
      source: repairText(office.imageSource),
      license: repairText(office.imageLicense || office.mediaLicenseNote),
      attribution: repairText(office.imageAttribution),
      status: "fallback_crest",
      fit: "contain"
    };
  }

  return {
    alt: repairText(`Bildplatzhalter für ${office.name}`),
    status: "placeholder",
    fit: "cover"
  };
}

export function ceremonyVenueMedia(venue: CeremonyVenue): SafeMedia {
  const approved = approvedImage(venue, venue.traulokal_name);
  if (approved) return approved;

  return {
    alt: repairText(`Bildplatzhalter für ${venue.traulokal_name}`),
    status: "placeholder",
    fit: "cover"
  };
}
