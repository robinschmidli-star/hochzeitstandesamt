import { isIsolatedAnalyticsTest } from "@/lib/analytics-test-environment";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { isInternalTraffic, trustedBrowserRequest } from "@/lib/analytics-request";
import { analyticsPath, cleanProperties } from "@/lib/analytics-policy";


const schema = z.object({
  eventName: z.enum(["page_view", "search_started", "search_filter_changed", "search_pagination", "search_results_viewed", "search_completed", "venue_opened", "location_view", "favorite_added", "favorite_removed", "availability_clicked", "official_link_clicked", "lead_started", "lead_submitted", "shortlist_save_started", "lead_created", "gallery_used", "external_link_clicked", "vendor_impression", "vendor_profile_opened", "vendor_website_clicked", "vendor_contact_started", "sponsored_impression", "sponsored_click"]),
  sessionId: z.string().uuid(), visitorId: z.string().uuid(),
  path: z.string().startsWith("/").max(500), country: z.enum(["CH", "AT", "DE"]).default("CH"),
  properties: z.record(z.union([z.string().max(250), z.number(), z.boolean(), z.array(z.string().max(100)).max(20)])).default({})
});

export async function POST(request: Request) {
  try {
    if (isInternalTraffic(request) || !trustedBrowserRequest(request)) return new NextResponse(null, { status: 204 });


    const data = schema.parse(await request.json());
    const path = analyticsPath(data.path);
    if (!path) return new NextResponse(null, { status: 204 });
    const limited = await rateLimit(request, `analytics:${createHash("sha256").update(data.visitorId).digest("hex")}`, 120, 60_000, false);
    if (limited) return limited;

    await prisma.analyticsEvent.create({ data: { eventName: data.eventName, sessionId: data.sessionId, visitorHash: createHash("sha256").update(data.visitorId).digest("hex"), path, country: "CH", properties: { ...cleanProperties(data.properties), ...(isIsolatedAnalyticsTest() ? { traffic_type: "test" } : {}) } } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
