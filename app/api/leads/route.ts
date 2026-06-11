import { NextResponse } from "next/server";
import { mkdir, appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const schema = z.object({
  leadType: z.string().min(1),
  firstName: z.string().min(1),
  email: z.string().email(),
  sourcePage: z.string().min(1),
  consentPrivacy: z.string().optional(),
  consentForwarding: z.string().optional()
});

const searchLeadSchema = z.object({
  leadType: z.literal("search_save"),
  email: z.string().email(),
  firstName: z.string().optional().default(""),
  language: z.string().optional().default("de"),
  marketingConsent: z.boolean().default(false),
  sourcePage: z.string().min(1),
  searchType: z.enum(["date_search", "location_search", "beautiful_locations", "saturday_search"]),
  weddingDate: z.string().optional().default(""),
  desiredDate: z.string().optional().default(""),
  dateRangeStart: z.string().optional().default(""),
  dateRangeEnd: z.string().optional().default(""),
  weekday: z.string().optional().default(""),
  location: z.string().optional().default(""),
  canton: z.string().optional().default(""),
  city: z.string().optional().default(""),
  selectedVenueIds: z.array(z.string()).optional().default([]),
  favoriteVenueIds: z.array(z.string()).optional().default([])
});

const storageDir = path.join(process.cwd(), "storage");
const storageFile = path.join(storageDir, "leads.jsonl");

async function existingSearchLeadId(email: string, weddingDate: string, location: string) {
  try {
    const file = await readFile(storageFile, "utf8");
    return file
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as { id?: string; lead_type?: string; email?: string; wedding_date?: string; location?: string })
      .find((lead) =>
        lead.lead_type === "search_save" &&
        lead.email?.toLowerCase() === email.toLowerCase() &&
        (lead.wedding_date ?? "") === weddingDate &&
        (lead.location ?? "") === location
      )?.id ?? "";
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.includes("application/json")) {
    const parsed = searchLeadSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Bitte prüfe deine E-Mail-Adresse." }, { status: 400 });
    }

    const data = parsed.data;
    const weddingDate = data.weddingDate || data.desiredDate || "";
    const duplicateOf = await existingSearchLeadId(data.email, weddingDate, data.location);
    const now = new Date().toISOString();
    const lead = {
      id: randomUUID(),
      duplicate_of: duplicateOf,
      lead_type: "search_save",
      email: data.email,
      first_name: data.firstName,
      language: data.language,
      marketing_consent: data.marketingConsent,
      search_type: data.searchType,
      wedding_date: weddingDate,
      desired_date: data.desiredDate,
      date_range_start: data.dateRangeStart,
      date_range_end: data.dateRangeEnd,
      weekday: data.weekday,
      location: data.location,
      canton: data.canton,
      city: data.city,
      selected_venue_ids: data.selectedVenueIds,
      favorite_venue_ids: data.favoriteVenueIds,
      source_page: data.sourcePage,
      created_at: now,
      updated_at: now,
      status: "new"
    };

    await mkdir(storageDir, { recursive: true });
    await appendFile(storageFile, `${JSON.stringify(lead)}\n`, "utf8");

    return NextResponse.json({ ok: true });
  }

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
  await mkdir(storageDir, { recursive: true });
  await appendFile(storageFile, `${JSON.stringify(lead)}\n`, "utf8");

  return NextResponse.redirect(new URL(`/danke?type=${encodeURIComponent(parsed.data.leadType)}`, request.url), 303);
}
