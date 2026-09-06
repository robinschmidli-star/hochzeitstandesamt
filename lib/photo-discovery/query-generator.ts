import type { PhotoDiscoveryQuery, VenueSearchTarget } from "./types";

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");

export function buildPhotoDiscoveryQueries(target: VenueSearchTarget): PhotoDiscoveryQuery[] {
  const names = Array.from(
    new Set([target.name, ...(target.aliases ?? [])].map(normalize).filter(Boolean))
  );

  const queries: PhotoDiscoveryQuery[] = [];

  for (const name of names) {
    const exact = `"${name}"`;
    queries.push(
      { source: "web", query: `${exact} Hochzeit Fotograf` },
      { source: "web", query: `${exact} Hochzeitsfotograf` },
      { source: "web", query: `${exact} Trauung` },
      { source: "web", query: `${exact} wedding photographer` },
      { source: "web", query: `${exact} wedding` },
      { source: "web", query: `${exact} mariage photographe` },
      { source: "web", query: `${exact} matrimonio fotografo` },
      { source: "images", query: `${exact} Hochzeit` },
      { source: "images", query: `${exact} wedding` },
      { source: "instagram", query: `site:instagram.com ${exact} Hochzeit` },
      { source: "instagram", query: `site:instagram.com ${exact} wedding` }
    );
  }

  if (target.city) {
    queries.push(
      { source: "web", query: `"${target.name}" "${target.city}" Hochzeitsreportage` },
      { source: "web", query: `"${target.name}" "${target.city}" wedding photography` }
    );
  }

  return Array.from(new Map(queries.map((item) => [`${item.source}:${item.query}`, item])).values());
}

export function scorePhotoLead(input: {
  exactVenueInTitle?: boolean;
  weddingTerm?: boolean;
  photographerWebsite?: boolean;
  visibleGallery?: boolean;
  photographerInstagram?: boolean;
  venueMentionOnly?: boolean;
  repostOrPinterest?: boolean;
  stockImage?: boolean;
}) {
  let score = 0;
  if (input.exactVenueInTitle) score += 30;
  if (input.weddingTerm) score += 20;
  if (input.photographerWebsite) score += 20;
  if (input.visibleGallery) score += 15;
  if (input.photographerInstagram) score += 10;
  if (input.venueMentionOnly) score += 5;
  if (input.repostOrPinterest) score -= 20;
  if (input.stockImage) score -= 30;
  return Math.max(0, Math.min(100, score));
}
