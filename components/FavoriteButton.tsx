"use client";

import { useFavorites } from "@/components/FavoritesProvider";

export function FavoriteButton({ canonicalId, slug, source, compact = false }: {
  canonicalId: string; slug: string; source: "search_results" | "venue_detail" | "featured"; compact?: boolean;
}) {
  const { isFavorite, add, remove } = useFavorites();
  const saved = isFavorite(canonicalId);
  return <button type="button" aria-pressed={saved} aria-label={saved ? "Trauort aus Merkliste entfernen" : "Trauort speichern"}
    onClick={(event) => { event.preventDefault(); event.stopPropagation(); if (saved) remove(canonicalId, source); else add({ canonicalId, slug }, source); }}
    className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-sage/20 bg-white font-semibold text-sage ${compact ? "min-w-11 px-3" : "px-4 py-2"}`}>
    <span aria-hidden="true" className="text-lg">{saved ? "♥" : "♡"}</span>{compact ? <span className="sr-only">{saved ? "Gespeichert" : "Speichern"}</span> : saved ? "Gespeichert" : "Speichern"}
  </button>;
}
