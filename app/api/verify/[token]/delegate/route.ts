import { NextResponse } from "next/server";
import { createVerificationRequest, requestByToken } from "@/lib/verification";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const limited = await rateLimit(request, "verification-delegate", 10, 60 * 60_000);
  if (limited) return limited;
  const { token } = await params;
  const parent = await requestByToken(token);
  if (!parent || parent.venueId) return NextResponse.json({ message: "Ungültiger Link." }, { status: 404 });
  const { venueId } = await request.json().catch(() => ({ venueId: "" })) as { venueId: string };
  const venue = parent.snapshot.venues.find((item) => item.id === venueId);
  if (!venue) return NextResponse.json({ message: "Trauort liegt ausserhalb dieses Prüflinks." }, { status: 403 });
  let child;
  try { child = await createVerificationRequest({ officeId: parent.snapshot.office.id, venueId, languageCode: parent.languageCode, sourceType: "venue", sourceName: venue.name, parentRequestId: parent.id, days: 30 }); }
  catch (error) { if (error instanceof Error && error.message === "active_request_exists") return NextResponse.json({ message: "Für diesen Trauort besteht bereits ein aktiver Link." }, { status: 409 }); throw error; }
  const origin = new URL(request.url).origin;
  return NextResponse.json({ url: `${origin}/verify/venue/${child.token}`, expiresAt: child.expiresAt });
}
