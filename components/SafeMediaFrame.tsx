"use client";

import { useState } from "react";
import type { SafeMedia } from "@/lib/safe-media";

export function SafeMediaFrame({
  media,
  className = "",
  imageClassName = "",
  placeholderLabel = "Bild folgt"
}: {
  media: SafeMedia;
  className?: string;
  imageClassName?: string;
  placeholderLabel?: string;
}) {
  const [activeMedia, setActiveMedia] = useState(media);

  if (!activeMedia.url) {
    return (
      <div className={`flex items-center justify-center bg-linen/70 ${className}`}>
        <span className="px-4 text-center text-sm font-semibold text-soft-ink">{placeholderLabel}</span>
      </div>
    );
  }

  const fitClass = activeMedia.fit === "contain" ? "object-contain p-5" : "object-cover";

  return (
    // Dynamic licensed media relies on the native element's tolerant loading behavior.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={activeMedia.url}
      alt={activeMedia.alt}
      loading="lazy"
      onError={() => setActiveMedia(activeMedia.fallback ?? {
        alt: media.alt,
        status: "placeholder",
        fit: "cover"
      })}
      className={`${fitClass} ${imageClassName || "h-full w-full"}`}
    />
  );
}

export function SafeMediaAttribution({ media, label = "Bild" }: { media: SafeMedia; label?: string }) {
  const parts = [media.attribution, media.source, media.license].filter(Boolean);
  if (!parts.length) return null;

  return <p className="mt-2 text-xs leading-5 text-soft-ink">{label}: {parts.join(" · ")}</p>;
}
