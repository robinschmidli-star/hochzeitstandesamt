export const FAVORITES_STORAGE_KEY = "hs_favorites";
export const FAVORITES_VERSION = 1;

export type StoredFavorite = { canonicalId: string; slug: string; savedAt: string };
export type FavoritesDocument = { version: 1; venues: StoredFavorite[] };

function validFavorite(value: unknown): value is StoredFavorite {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<StoredFavorite>;
  return typeof item.canonicalId === "string" && /^[0-9a-f-]{36}$/i.test(item.canonicalId)
    && typeof item.slug === "string" && item.slug.length > 0 && item.slug.length <= 200
    && typeof item.savedAt === "string" && !Number.isNaN(Date.parse(item.savedAt));
}

export function parseFavorites(raw: string | null): FavoritesDocument {
  try {
    const parsed = JSON.parse(raw ?? "null") as Partial<FavoritesDocument> | null;
    if (parsed?.version !== FAVORITES_VERSION || !Array.isArray(parsed.venues)) throw new Error("invalid");
    const unique = new Map(parsed.venues.filter(validFavorite).map((item) => [item.canonicalId, item]));
    return { version: FAVORITES_VERSION, venues: [...unique.values()] };
  } catch {
    return { version: FAVORITES_VERSION, venues: [] };
  }
}

export function addStoredFavorite(document: FavoritesDocument, favorite: StoredFavorite): FavoritesDocument {
  return { version: FAVORITES_VERSION, venues: [favorite, ...document.venues.filter((item) => item.canonicalId !== favorite.canonicalId)] };
}

export function removeStoredFavorite(document: FavoritesDocument, canonicalId: string): FavoritesDocument {
  return { version: FAVORITES_VERSION, venues: document.venues.filter((item) => item.canonicalId !== canonicalId) };
}
