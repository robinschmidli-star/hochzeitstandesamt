import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  eventName: z.enum(["page_view", "search_started", "search_completed", "location_view", "favorite_added", "shortlist_save_started", "lead_created", "gallery_used", "external_link_clicked", "vendor_impression", "vendor_profile_opened", "vendor_website_clicked", "vendor_contact_started", "sponsored_impression", "sponsored_click"]),
  sessionId: z.string().uuid(), visitorId: z.string().uuid(),
  path: z.string().startsWith("/").max(500), country: z.enum(["CH", "AT", "DE"]).default("CH"),
  properties: z.record(z.union([z.string().max(250), z.number(), z.boolean(), z.array(z.string().max(100)).max(20)])).default({})
});

export async function POST(request: Request) {
  try {
    const limited = await rateLimit(request, "analytics", 120, 60_000);
    if (limited) return limited;
    const data = schema.parse(await request.json());
    const agent = request.headers.get("user-agent") ?? "";
    const host = (request.headers.get("host") ?? "").split(":")[0].replace(/^\[|\]$/g, "");
    if (/bot|crawler|spider|healthcheck|uptime/i.test(agent) || data.path.startsWith("/admin") || ["localhost", "127.0.0.1", "::1"].includes(host)) return new NextResponse(null, { status: 204 });
    await prisma.analyticsEvent.create({ data: { eventName: data.eventName, sessionId: data.sessionId, visitorHash: createHash("sha256").update(data.visitorId).digest("hex"), path: data.path, country: data.country, properties: data.properties } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
