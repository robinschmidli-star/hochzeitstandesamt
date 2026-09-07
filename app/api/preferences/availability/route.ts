import { prisma } from "@/lib/prisma";
import { publicCeremonyVenues } from "@/lib/public-venues";
import { rateLimit } from "@/lib/rate-limit";
import { preferenceErrorResponse, preferenceVisitorData } from "@/lib/preference-server";
import { availabilityPreferenceSchema, toDatabaseDate } from "@/lib/preference-validation";

export async function POST(request: Request) {
  try {
    const limited = await rateLimit(request, "preference-availability", 60, 60_000);
    if (limited) return limited;
    const data = availabilityPreferenceSchema.parse(await request.json());
    const venue = publicCeremonyVenues.find((item) => item.canonicalId === data.venueId && item.slug === data.venueSlug);
    if (!venue) return Response.json({ ok: false, message: "Unknown venue" }, { status: 404 });
    const visitor = preferenceVisitorData(data);
    const interest = await prisma.$transaction(async (tx) => {
      await tx.visitorPreferenceProfile.upsert({
        where: { visitorHash: visitor.visitorHash }, create: visitor,
        update: { locale: visitor.locale, country: visitor.country }
      });
      return tx.availabilityInterest.create({ data: {
        visitorHash: visitor.visitorHash, sessionId: data.sessionId,
        venueId: data.venueId, venueSlug: venue.slug, officeId: data.officeId,
        requestedDate: toDatabaseDate(data.requestedDate),
        requestedDateFrom: toDatabaseDate(data.requestedDateFrom),
        requestedDateTo: toDatabaseDate(data.requestedDateTo),
        availabilityStatus: data.availabilityStatus
      }, select: { id: true, checkedAt: true }});
    });
    return Response.json({ ok: true, interest }, { status: 201 });
  } catch (error) {
    return preferenceErrorResponse(error);
  }
}
