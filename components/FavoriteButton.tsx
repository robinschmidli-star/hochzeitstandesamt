"use client";

import { useFavorites } from "@/components/FavoritesProvider";

export function FavoriteButton({ canonicalId, slug, source, compact = false, labels }: {
  canonicalId: string; slug: string; source: "search_results" | "venue_detail" | "featured"; compact?: boolean; labels?: { add: string; remove: string; saved: string };
}) {
  const { isFavorite, add, remove } = useFavorites();
  const saved = isFavorite(canonicalId);
  const text = labels ?? { add: "Trauort speichern", remove: "Trauort aus Merkliste entfernen", saved: "Gespeichert" };
  return <button type="button" aria-pressed={saved} aria-label={saved ? text.remove : text.add}
    onClick={(event) => { event.preventDefault(); event.stopPropagation(); if (saved) remove(canonicalId, source); else add({ canonicalId, slug }, source); }}
    className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-sage/20 bg-white font-semibold text-sage ${compact ? "min-w-11 px-3" : "px-4 py-2"}`}>
    <span aria-hidden="true" className="text-lg">{saved ? "♥" : "♡"}</span>{compact ? <span className="sr-only">{saved ? text.saved : text.add}</span> : saved ? text.saved : text.add}
  </button>;
}
