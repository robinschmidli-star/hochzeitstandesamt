import { NextResponse } from "next/server";
import { createVerificationRequest } from "@/lib/verification";

export async function POST(request: Request) {
  const form = await request.formData();
  const officeId = String(form.get("officeId") ?? "");
  const language = String(form.get("language") ?? "de");
  if (!/^[0-9a-f-]{36}$/i.test(officeId) || !["de","fr","it"].includes(language)) return NextResponse.json({ message: "Ungültige Eingabe." }, { status: 400 });
  try {
    const result = await createVerificationRequest({ officeId, languageCode: language as "de"|"fr"|"it", sourceType: "civil_registry_office", days: 15 });
    return NextResponse.json({ url: `${new URL(request.url).origin}/verify/${result.token}`, expiresAt: result.expiresAt, id: result.id });
  } catch (error) {
    if (error instanceof Error && error.message === "active_request_exists") return NextResponse.json({ message: "Für dieses Amt besteht bereits ein aktiver Link. Widerrufen oder verwenden Sie diesen zuerst." }, { status: 409 });
    throw error;
  }
}
