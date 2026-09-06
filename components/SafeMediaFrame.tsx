"use client";

import { useState } from "react";
import type { SafeMedia } from "@/lib/safe-media";

export function SafeMediaFrame({
  media,
  className = "",
  imageClassName = "",
  crestVariant = "intrinsic",
  placeholderLabel = "Bild folgt"
}: {
  media: SafeMedia;
  className?: string;
  imageClassName?: string;
  crestVariant?: "intrinsic" | "card";
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

  if (activeMedia.status === "fallback_crest") {
    return (
      <div className={`flex items-center justify-center bg-linen/40 p-4 sm:p-6 ${className}`}>
        {/* Keep raster crests at their intrinsic size; only large assets are scaled down. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeMedia.url}
          alt={activeMedia.alt}
          loading="lazy"
          onError={() => setActiveMedia({
            alt: media.alt,
            status: "placeholder",
            fit: "cover"
          })}
          className={crestVariant === "card"
            ? "h-20 w-20 object-contain sm:h-24 sm:w-24"
            : "h-auto w-auto max-h-[160px] max-w-[160px] object-contain sm:max-h-[220px] sm:max-w-[240px]"}
        />
      </div>
    );
  }

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
      className={`object-cover ${imageClassName || "h-full w-full"}`}
    />
  );
}
