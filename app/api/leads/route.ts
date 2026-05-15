import { NextResponse } from "next/server";
import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const schema = z.object({
  leadType: z.string().min(1),
  firstName: z.string().min(1),
  email: z.string().email(),
  sourcePage: z.string().min(1),
  consentPrivacy: z.string().optional(),
  consentForwarding: z.string().optional()
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(data);

  if (!parsed.success || data.consentPrivacy !== "on" || (data.leadType === "family_law" && data.consentForwarding !== "on")) {
    return NextResponse.json({ ok: false, message: "Bitte prüfe die Angaben und die Datenschutzeinwilligung." }, { status: 400 });
  }

  const lead = {
    lead_type: String(data.leadType),
    source_page: String(data.sourcePage),
    first_name: String(data.firstName),
    last_name: String(data.lastName ?? ""),
    email: String(data.email),
    phone: String(data.phone ?? ""),
    address: String(data.address ?? ""),
    canton: String(data.canton ?? data.cantonSlug ?? ""),
    wedding_location: String(data.weddingLocation ?? data.registryOfficeSlug ?? ""),
    wedding_date: String(data.weddingDate ?? ""),
    legal_topic: String(data.legalTopic ?? ""),
    message: String(data.message ?? ""),
    consent_privacy: data.consentPrivacy === "on",
    consent_forwarding: data.consentForwarding === "on",
    created_at: new Date().toISOString(),
    status: "new"
  };
  const storageDir = path.join(process.cwd(), "storage");
  await mkdir(storageDir, { recursive: true });
  await appendFile(path.join(storageDir, "leads.jsonl"), `${JSON.stringify(lead)}\n`, "utf8");

  return NextResponse.redirect(new URL(`/danke?type=${encodeURIComponent(parsed.data.leadType)}`, request.url), 303);
}
