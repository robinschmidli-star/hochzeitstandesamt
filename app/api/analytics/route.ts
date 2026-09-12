import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const BOT_UA = /bot|crawler|spider|headless|lighthouse|pagespeed|healthcheck|uptime|curl|wget|python|scrapy|phantom|selenium|playwright|puppeteer/i;

const schema = z.object({
  eventName: z.enum(["page_view", "search_started", "search_results_viewed", "search_completed", "venue_opened", "location_view", "favorite_added", "favorite_removed", "availability_clicked", "official_link_clicked", "lead_started", "lead_submitted", "shortlist_save_started", "lead_created", "gallery_used", "external_link_clicked", "vendor_impression", "vendor_profile_opened", "vendor_website_clicked", "vendor_contact_started", "sponsored_impression", "sponsored_click"]),
  sessionId: z.string().uuid(), visitorId: z.string().uuid(),
  path: z.string().startsWith("/").max(500), country: z.enum(["CH", "AT", "DE"]).default("CH"),
  properties: z.record(z.union([z.string().max(250), z.number(), z.boolean(), z.array(z.string().max(100)).max(20)])).default({})
});

function trustedBrowserRequest(request: Request) {
  const agent = request.headers.get("user-agent") ?? "";
  if (!agent || BOT_UA.test(agent)) return false;

  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0].replace(/^\[|\]$/g, "");
  if (["localhost", "127.0.0.1", "::1"].includes(hostname)) return false;

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!trustedBrowserRequest(request)) return new NextResponse(null, { status: 204 });

    const limited = await rateLimit(request, "analytics", 30, 60_000);
    if (limited) return limited;

    const data = schema.parse(await request.json());
    if (data.path.startsWith("/admin")) return new NextResponse(null, { status: 204 });

    await prisma.analyticsEvent.create({ data: { eventName: data.eventName, sessionId: data.sessionId, visitorHash: createHash("sha256").update(data.visitorId).digest("hex"), path: data.path, country: data.country, properties: data.properties } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
