"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { SafeMediaFrame } from "@/components/SafeMediaFrame";
import type { SafeMedia } from "@/lib/safe-media";

type Props = {
  images: SafeMedia[];
  openLabel: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  moreLabel: string;
  placeholderLabel: string;
};

function GalleryImage({ image }: { image: SafeMedia }) {
  if (!image.url) {
    return <span className="flex h-full w-full items-center justify-center bg-linen/70 px-4 text-center text-sm font-semibold text-soft-ink">{image.alt}</span>;
  }
  return <SafeMediaFrame media={image} className="h-full w-full" imageClassName="h-full w-full" />;
}

export function VenueGallery({ images, openLabel, closeLabel, previousLabel, nextLabel, moreLabel, placeholderLabel }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);
  const approvedImages = images.filter((image) => image.url);
  const displayImages = approvedImages.length ? approvedImages : images;
  const hasMultiple = displayImages.length > 1;
  const previewImages = displayImages.slice(1, 5);

  const move = useCallback((direction: number) => setActiveIndex((current) => {
    if (current === null) return null;
    return (current + direction + displayImages.length) % displayImages.length;
  }), [displayImages.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft" && hasMultiple) move(-1);
      if (event.key === "ArrowRight" && hasMultiple) move(1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, hasMultiple, move]);

  const open = (index: number) => {
    if (displayImages[index]?.url) setActiveIndex(index);
  };

  return (
    <>
      <div className={`grid h-72 overflow-hidden rounded-xl bg-linen/40 shadow-soft sm:h-96 ${hasMultiple ? "lg:grid-cols-2 lg:gap-1" : ""}`}>
        <button type="button" onClick={() => open(0)} aria-label={openLabel} className="focus-ring group relative min-h-0 overflow-hidden text-left">
          <GalleryImage image={displayImages[0]} />
          {hasMultiple ? <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur sm:hidden">1 / {displayImages.length}</span> : null}
          <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/5" />
        </button>
        {hasMultiple ? <div className="hidden grid-cols-2 grid-rows-2 gap-1 lg:grid">
          {previewImages.map((image, offset) => {
            const index = offset + 1;
            const hiddenCount = displayImages.length - 5;
            const showMore = offset === 3 && hiddenCount > 0;
            return <button key={`${image.url}-${index}`} type="button" onClick={() => open(index)} aria-label={`${openLabel} ${index + 1}`} className="focus-ring group relative min-h-0 overflow-hidden text-left">
              <GalleryImage image={image} />
              <span className={`absolute inset-0 transition ${showMore ? "flex items-center justify-center bg-ink/55 text-lg font-semibold text-white backdrop-blur-[1px]" : "bg-black/0 group-hover:bg-black/10"}`}>{showMore ? moreLabel.replace("{count}", String(hiddenCount)) : ""}</span>
            </button>;
          })}
        </div> : null}
      </div>

      {activeIndex !== null ? <div role="dialog" aria-modal="true" aria-label={openLabel} className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-3 sm:p-8">
        <button type="button" onClick={() => setActiveIndex(null)} aria-label={closeLabel} className="focus-ring absolute right-4 top-4 z-10 rounded-full bg-white/10 px-4 py-2 text-2xl leading-none text-white backdrop-blur hover:bg-white/20">×</button>
        <div className="relative h-full w-full max-w-7xl" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => {
          if (touchStart.current === null || !hasMultiple) return;
          const distance = event.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(distance) > 50) move(distance > 0 ? -1 : 1);
          touchStart.current = null;
        }}>
          <Image src={displayImages[activeIndex].url!} alt={displayImages[activeIndex].alt || placeholderLabel} fill priority sizes="100vw" className="object-contain" />
        </div>
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">{activeIndex + 1} / {displayImages.length}</span>
        {hasMultiple ? <>
          <button type="button" onClick={() => move(-1)} aria-label={previousLabel} className="focus-ring absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white backdrop-blur hover:bg-white/20 sm:left-6">‹</button>
          <button type="button" onClick={() => move(1)} aria-label={nextLabel} className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white backdrop-blur hover:bg-white/20 sm:right-6">›</button>
        </> : null}
      </div> : null}
    </>
  );
}
