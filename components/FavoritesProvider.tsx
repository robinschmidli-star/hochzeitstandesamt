"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { track } from "@/components/Analytics";
import { browserId } from "@/lib/browser-identity";
import { addStoredFavorite, FAVORITES_STORAGE_KEY, parseFavorites, removeStoredFavorite, type StoredFavorite } from "@/lib/favorites-storage";

type FavoriteSource = "search_results" | "venue_detail" | "shortlist" | "featured";
type FavoritesContextValue = {
  favorites: StoredFavorite[];
  ready: boolean;
  isFavorite: (canonicalId: string) => boolean;
  add: (favorite: Omit<StoredFavorite, "savedAt">, source: FavoriteSource) => void;
  remove: (canonicalId: string, source: FavoriteSource) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function persist(venues: StoredFavorite[]) {
  try { localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ version: 1, venues })); } catch { /* local UI remains usable */ }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<StoredFavorite[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setFavorites(parseFavorites(localStorage.getItem(FAVORITES_STORAGE_KEY)).venues); } catch { setFavorites([]); }
    setReady(true);
  }, []);

  const add = useCallback((favorite: Omit<StoredFavorite, "savedAt">, source: FavoriteSource) => {
    const saved = { ...favorite, savedAt: new Date().toISOString() };
    setFavorites((current) => { const next = addStoredFavorite({ version: 1, venues: current }, saved).venues; persist(next); return next; });
    track("favorite_added", { venueId: favorite.canonicalId, venueSlug: favorite.slug, source });
    try {
      void fetch("/api/preferences/favorite", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ visitorId: browserId("hs_visitor", localStorage), sessionId: browserId("hs_session", sessionStorage), venueId: favorite.canonicalId, venueSlug: favorite.slug, searchContextId: sessionStorage.getItem("hs_search_context_id") || undefined })
      }).catch(() => undefined);
    } catch { /* server sync is non-blocking */ }
  }, []);

  const remove = useCallback((canonicalId: string, source: FavoriteSource) => {
    setFavorites((current) => { const next = removeStoredFavorite({ version: 1, venues: current }, canonicalId).venues; persist(next); return next; });
    track("favorite_removed", { venueId: canonicalId, source });
    try {
      void fetch("/api/preferences/favorite", { method: "DELETE", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ visitorId: browserId("hs_visitor", localStorage), venueId: canonicalId })
      }).catch(() => undefined);
    } catch { /* server sync is non-blocking */ }
  }, []);

  const value = useMemo(() => ({ favorites, ready, isFavorite: (id: string) => favorites.some((item) => item.canonicalId === id), add, remove }), [favorites, ready, add, remove]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error("useFavorites must be used within FavoritesProvider");
  return value;
}
