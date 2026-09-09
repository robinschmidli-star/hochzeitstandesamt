"use client";

import { useEffect, useState } from "react";
import { track } from "@/components/Analytics";

const storageKey = "hs_favorite_venues";

export function FavoriteButton({ venueId, venueSlug, labels }: {
  venueId: string;
  venueSlug: string;
  labels: { add: string; remove: string; saved: string };
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as unknown;
      setSaved(Array.isArray(ids) && ids.includes(venueId));
    } catch { setSaved(false); }
  }, [venueId]);

  function toggle() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as unknown;
      const ids = new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []);
      if (saved) ids.delete(venueId); else ids.add(venueId);
      localStorage.setItem(storageKey, JSON.stringify([...ids]));
    } catch { /* the button remains usable when storage is unavailable */ }
    setSaved((value) => !value);
    track(saved ? "favorite_removed" : "favorite_added", { venue_id: venueId, venue_slug: venueSlug });
  }

  return <button type="button" aria-pressed={saved} aria-label={saved ? labels.remove : labels.add} onClick={toggle}
    className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg border border-sage/20 bg-white px-4 py-2 text-sm font-semibold text-sage">
    <span aria-hidden="true">{saved ? "♥" : "♡"}</span>{saved ? labels.saved : labels.add}
  </button>;
}
