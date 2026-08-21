"use client";

import { useEffect, useState } from "react";
import { readAnonymousProfile, toggleFavoriteVenue } from "@/lib/anonymous-profile";

export function FavoriteVenueButton({ venueId }: { venueId: string }) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(readAnonymousProfile().favoriteVenueIds.includes(venueId));
  }, [venueId]);

  return (
    <button
      type="button"
      aria-pressed={favorite}
      onClick={() => {
        const profile = toggleFavoriteVenue(venueId);
        setFavorite(profile.favoriteVenueIds.includes(venueId));
      }}
      className="focus-ring mt-4 inline-flex items-center rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30"
    >
      {favorite ? "♥ Gespeichert" : "♡ Speichern"}
    </button>
  );
}
