import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { preferenceErrorResponse, preferenceVisitorData } from "@/lib/preference-server";
import { searchPreferenceSchema, toDatabaseDate } from "@/lib/preference-validation";

export async function POST(request: Request) {
  try {
    const limited = await rateLimit(request, "preference-search", 30, 60_000);
    if (limited) return limited;
    const data = searchPreferenceSchema.parse(await request.json());
    const visitor = preferenceVisitorData(data);
    const searchContext = await prisma.$transaction(async (tx) => {
      await tx.visitorPreferenceProfile.upsert({
        where: { visitorHash: visitor.visitorHash },
        create: visitor,
        update: { locale: visitor.locale, country: visitor.country }
      });
      return tx.searchContext.create({ data: {
        visitorHash: visitor.visitorHash, sessionId: data.sessionId,
        canton: data.canton, date: toDatabaseDate(data.date),
        dateFrom: toDatabaseDate(data.dateFrom), dateTo: toDatabaseDate(data.dateTo),
        guests: data.guests, saturdayOnly: data.saturdayOnly, tag: data.tag,
        elopement: data.elopement, outdoor: data.outdoor, radiusKm: data.radiusKm,
        resultCount: data.resultCount
      }});
    });
    return Response.json({ ok: true, searchContextId: searchContext.id }, { status: 201 });
  } catch (error) {
    return preferenceErrorResponse(error);
  }
}
