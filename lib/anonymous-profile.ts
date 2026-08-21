export type AnonymousWeddingProfile = {
  version: 1;
  language: string;
  favoriteVenueIds: string[];
  searchPreferences: Record<string, string>;
  updatedAt: string;
};

const STORAGE_KEY = "hochzeitstandesamt:anonymous-profile:v1";

const emptyProfile = (): AnonymousWeddingProfile => ({
  version: 1,
  language: "de",
  favoriteVenueIds: [],
  searchPreferences: {},
  updatedAt: new Date().toISOString()
});

export function readAnonymousProfile(): AnonymousWeddingProfile {
  if (typeof window === "undefined") return emptyProfile();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw) as Partial<AnonymousWeddingProfile>;
    return {
      version: 1,
      language: typeof parsed.language === "string" ? parsed.language : "de",
      favoriteVenueIds: Array.isArray(parsed.favoriteVenueIds)
        ? parsed.favoriteVenueIds.filter((value): value is string => typeof value === "string")
        : [],
      searchPreferences: parsed.searchPreferences && typeof parsed.searchPreferences === "object"
        ? Object.fromEntries(Object.entries(parsed.searchPreferences).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
        : {},
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return emptyProfile();
  }
}

export function writeAnonymousProfile(profile: AnonymousWeddingProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }));
}

export function updateAnonymousProfile(update: Partial<Omit<AnonymousWeddingProfile, "version" | "updatedAt">>) {
  const current = readAnonymousProfile();
  const next: AnonymousWeddingProfile = {
    ...current,
    ...update,
    version: 1,
    updatedAt: new Date().toISOString()
  };
  writeAnonymousProfile(next);
  return next;
}

export function toggleFavoriteVenue(venueId: string) {
  const current = readAnonymousProfile();
  const exists = current.favoriteVenueIds.includes(venueId);
  const favoriteVenueIds = exists
    ? current.favoriteVenueIds.filter((id) => id !== venueId)
    : [...current.favoriteVenueIds, venueId];
  return updateAnonymousProfile({ favoriteVenueIds });
}
