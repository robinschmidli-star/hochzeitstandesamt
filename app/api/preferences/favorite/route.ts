import { prisma } from "@/lib/prisma";
import { publicCeremonyVenues } from "@/lib/public-venues";
import { rateLimit } from "@/lib/rate-limit";
import { preferenceErrorResponse, preferenceVisitorData } from "@/lib/preference-server";
import { favoritePreferenceSchema, removeFavoritePreferenceSchema } from "@/lib/preference-validation";
import { hashVisitorId, visitorIdSchema } from "@/lib/visitor-identity";

function canonicalVenue(venueId: string, venueSlug?: string) {
  return publicCeremonyVenues.find((venue) => venue.canonicalId === venueId && (!venueSlug || venue.slug === venueSlug));
}

export async function GET(request: Request) {
  try {
    const limited = await rateLimit(request, "preference-favorites-read", 60, 60_000);
    if (limited) return limited;
    const visitorId = visitorIdSchema.parse(request.headers.get("x-hs-visitor-id"));
    const favorites = await prisma.favoriteVenue.findMany({
      where: { visitorHash: hashVisitorId(visitorId), removedAt: null },
      select: { venueId: true, venueSlug: true, savedAt: true, searchContextId: true },
      orderBy: { savedAt: "desc" }
    });
    return Response.json({ ok: true, favorites }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return preferenceErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const limited = await rateLimit(request, "preference-favorite-write", 60, 60_000);
    if (limited) return limited;
    const data = favoritePreferenceSchema.parse(await request.json());
    const venue = canonicalVenue(data.venueId, data.venueSlug);
    if (!venue) return Response.json({ ok: false, message: "Unknown venue" }, { status: 404 });
    const visitor = preferenceVisitorData(data);
    const favorite = await prisma.$transaction(async (tx) => {
      await tx.visitorPreferenceProfile.upsert({
        where: { visitorHash: visitor.visitorHash }, create: visitor,
        update: { locale: visitor.locale, country: visitor.country }
      });
      const context = data.searchContextId ? await tx.searchContext.findFirst({
        where: { id: data.searchContextId, visitorHash: visitor.visitorHash }, select: { id: true }
      }) : null;
      return tx.favoriteVenue.upsert({
        where: { visitorHash_venueId: { visitorHash: visitor.visitorHash, venueId: data.venueId } },
        create: { visitorHash: visitor.visitorHash, venueId: data.venueId, venueSlug: venue.slug, searchContextId: context?.id },
        update: { venueSlug: venue.slug, searchContextId: context?.id, removedAt: null, savedAt: new Date() },
        select: { venueId: true, venueSlug: true, savedAt: true, searchContextId: true }
      });
    });
    return Response.json({ ok: true, favorite }, { status: 201 });
  } catch (error) {
    return preferenceErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const limited = await rateLimit(request, "preference-favorite-write", 60, 60_000);
    if (limited) return limited;
    const data = removeFavoritePreferenceSchema.parse(await request.json());
    await prisma.favoriteVenue.updateMany({
      where: { visitorHash: hashVisitorId(data.visitorId), venueId: data.venueId, removedAt: null },
      data: { removedAt: new Date() }
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return preferenceErrorResponse(error);
  }
}
