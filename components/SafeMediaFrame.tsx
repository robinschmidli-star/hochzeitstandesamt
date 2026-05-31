import type { SafeMedia } from "@/lib/safe-media";

export function SafeMediaFrame({
  media,
  className = "",
  imageClassName = ""
}: {
  media: SafeMedia;
  className?: string;
  imageClassName?: string;
}) {
  if (!media.url) {
    return (
      <div className={`flex items-center justify-center bg-linen/70 ${className}`}>
        <span className="px-4 text-center text-sm font-semibold text-soft-ink">Bild folgt</span>
      </div>
    );
  }

  const fitClass = media.fit === "contain" ? "object-contain p-5" : "object-cover";

  return (
    <img
      src={media.url}
      alt={media.alt}
      loading="lazy"
      className={`${fitClass} ${imageClassName || "h-full w-full"}`}
    />
  );
}

export function SafeMediaAttribution({ media }: { media: SafeMedia }) {
  const parts = [media.attribution, media.source, media.license].filter(Boolean);
  if (!parts.length) return null;

  return <p className="mt-2 text-xs leading-5 text-soft-ink">Bild: {parts.join(" · ")}</p>;
}
