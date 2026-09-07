import { prisma } from "@/lib/prisma";
import { hashVisitorId } from "@/lib/visitor-identity";

type VisitorInput = { visitorId: string; locale?: string; country?: "CH" | "AT" | "DE" };

export function preferenceVisitorData(input: VisitorInput) {
  return {
    visitorHash: hashVisitorId(input.visitorId),
    locale: input.locale,
    country: input.country
  };
}

export async function touchPreferenceVisitor(input: VisitorInput) {
  const data = preferenceVisitorData(input);
  return prisma.visitorPreferenceProfile.upsert({
    where: { visitorHash: data.visitorHash },
    create: data,
    update: { locale: data.locale, country: data.country }
  });
}

export function preferenceErrorResponse(error: unknown) {
  if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (error instanceof SyntaxError) return Response.json({ ok: false }, { status: 400 });
  return Response.json({ ok: false }, { status: 500 });
}
