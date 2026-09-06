import { NextResponse } from "next/server";
import { ensureAvailabilityMvpSources } from "@/lib/availability/mvp-sources";
import { runAvailabilitySync } from "@/lib/availability/sync";

export const maxDuration = 60;

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await ensureAvailabilityMvpSources();
    const result = await runAvailabilitySync();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Availability cron failed", error);
    return NextResponse.json({ ok: false, error: "Availability sync failed" }, { status: 500 });
  }
}
