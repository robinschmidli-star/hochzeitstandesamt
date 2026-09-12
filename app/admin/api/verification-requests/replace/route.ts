import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createVerificationRequest } from "@/lib/verification";

export async function POST(request: Request) {
  const form = await request.formData();
  const officeId = String(form.get("officeId") ?? "");
  const language = String(form.get("language") ?? "de");
  if (!/^[0-9a-f-]{36}$/i.test(officeId) || !["de", "fr", "it"].includes(language)) return NextResponse.json({ message: "Ungültige Eingabe." }, { status: 400 });
  await prisma.$executeRaw`UPDATE verification_requests SET status='revoked', revoked_at=now(), updated_at=now() WHERE office_id=${officeId}::uuid AND venue_id IS NULL AND status='active' AND revoked_at IS NULL`;
  const result = await createVerificationRequest({ officeId, languageCode: language as "de"|"fr"|"it", sourceType: "civil_registry_office", days: 15 });
  return NextResponse.json({ url: `${new URL(request.url).origin}/verify/${result.token}`, expiresAt: result.expiresAt, id: result.id });
}
