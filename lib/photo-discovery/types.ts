export type PhotoDiscoverySource = "web" | "images" | "instagram" | "photographer_website";

export type PhotoLeadStatus =
  | "found"
  | "reviewed"
  | "contact_ready"
  | "contacted"
  | "approved"
  | "rejected"
  | "published";

export type PhotoPermissionStatus = "pending" | "approved" | "rejected" | "revoked";

export type VenueSearchTarget = {
  canonicalId?: string | null;
  slug: string;
  name: string;
  city?: string | null;
  canton?: string | null;
  aliases?: string[];
};

export type PhotoDiscoveryQuery = {
  source: PhotoDiscoverySource;
  query: string;
};

export type PhotoLeadCandidate = {
  targetCanonicalId?: string | null;
  targetSlug: string;
  source: PhotoDiscoverySource;
  sourceUrl: string;
  imageUrl?: string | null;
  photographerName?: string | null;
  photographerWebsite?: string | null;
  photographerInstagram?: string | null;
  confidence: number;
};
