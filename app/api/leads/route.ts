import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const localPath = z.string().startsWith("/").max(500).refine((value) => !value.startsWith("//"));
const shortText = z.string().trim().max(120);
const optionalText = z.string().trim().max(500).optional().default("");

const formBase = {
  firstName: shortText.min(1),
  email: z.string().trim().email().max(254),
  sourcePage: localPath,
  consentPrivacy: z.literal("on")
};

const schema = z.discriminatedUnion("leadType", [
  z.object({
    ...formBase,
    leadType: z.literal("checklist"),
    registryOfficeSlug: z.string().trim().max(120).optional().default(""),
    cantonSlug: z.string().trim().max(20).optional().default(""),
    weddingDate: z.string().trim().max(10).optional().default(""),
    language: z.enum(["DE", "FR", "IT", "EN"]).optional().default("DE")
  }).strict(),
  z.object({
    ...formBase,
    leadType: z.literal("vendor_request"),
    city: shortText.optional().default(""),
    guestCount: z.string().trim().max(5).regex(/^\d*$/).optional().default(""),
    requestedVendorCategories: z.array(z.string().trim().max(80)).max(12).optional().default([]),
    message: z.string().trim().max(2_000).optional().default("")
  }).strict()
]);

const searchLeadSchema = z.object({
  leadType: z.literal("search_save"),
  email: z.string().trim().email().max(254),
  firstName: shortText.optional().default(""),
  language: z.enum(["de", "fr", "it", "en"]).default("de"),
  marketingConsent: z.boolean().default(false),
  sourcePage: localPath,
  searchType: z.enum(["date_search", "location_search", "beautiful_locations", "saturday_search"]),
  weddingDate: optionalText,
  desiredDate: optionalText,
  dateRangeStart: optionalText,
  dateRangeEnd: optionalText,
  weekday: optionalText,
  elopement: z.boolean().optional().default(false),
  location: optionalText,
  canton: shortText.optional().default(""),
  city: shortText.optional().default(""),
  selectedVenueIds: z.array(z.string().max(100)).max(20).optional().default([]),
  favoriteVenueIds: z.array(z.string().max(100)).max(20).optional().default([])
});


async function existingSearchLeadId(email: string, weddingDate: string, location: string) {
  const lead = await prisma.websiteLead.findFirst({
    where: {
      leadType: "search_save",
      email: { equals: email, mode: "insensitive" },
      dedupeWeddingDate: weddingDate,
      dedupeLocation: location
    },
    select: { id: true }
  });
  return lead?.id ?? "";
}

export async function POST(request: Request) {
  const limited = await rateLimit(request, "leads", 10, 60 * 60_000);
  if (limited) return limited;

  try {
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
      elopement: data.elopement,
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

    await prisma.websiteLead.create({
      data: {
        id: lead.id,
        leadType: lead.lead_type,
        email: lead.email,
        firstName: lead.first_name,
        payload: lead,
        dedupeWeddingDate: weddingDate || null,
        dedupeLocation: data.location || null,
        duplicateOfId: duplicateOf || null
      }
    });

      return NextResponse.json({ ok: true });
    }

    const formData = await request.formData();
    const raw = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(raw.leadType === "vendor_request" ? {
      ...raw,
      requestedVendorCategories: formData.getAll("requestedVendorCategories").map(String)
    } : raw);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Bitte prüfe die Angaben und die Datenschutzeinwilligung." }, { status: 400 });
    }

  const data = parsed.data;
  const lead = data.leadType === "checklist" ? {
    lead_type: data.leadType,
    source_page: data.sourcePage,
    first_name: data.firstName,
    email: data.email,
    canton: data.cantonSlug,
    wedding_location: data.registryOfficeSlug,
    wedding_date: data.weddingDate,
    language: data.language.toLowerCase(),
    consent_privacy: true,
    created_at: new Date().toISOString(),
    status: "new"
  } : {
    lead_type: data.leadType,
    source_page: data.sourcePage,
    first_name: data.firstName,
    email: data.email,
    city: data.city,
    guest_count: data.guestCount ? Number(data.guestCount) : null,
    requested_vendor_categories: data.requestedVendorCategories,
    message: data.message,
    consent_privacy: true,
    created_at: new Date().toISOString(),
    status: "new"
  };
  await prisma.websiteLead.create({
    data: {
      leadType: lead.lead_type,
      email: lead.email,
      firstName: lead.first_name,
      payload: lead
    }
  });

    return NextResponse.redirect(new URL(`/danke?type=${encodeURIComponent(data.leadType)}`, request.url), 303);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ ok: false, message: "Bitte prüfe deine Angaben." }, { status: 400 });
    }
    return NextResponse.json(
      { ok: false, message: "Die Anfrage konnte nicht gespeichert werden." },
      { status: 500 }
    );
  }
}
