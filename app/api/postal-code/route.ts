import { NextResponse } from "next/server";
import postalCodes from "switzerland-postal-codes/dist/postal-codes-full.json";
import { repairText } from "@/lib/search-experience";

type PostalCodeEntry = { name: string };
const entries = postalCodes as Record<string, PostalCodeEntry[]>;

export function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!/^\d{4}$/.test(code)) return NextResponse.json({ place: "" }, { status: 400 });
  const entry = entries[code]?.[0];
  return NextResponse.json(
    { place: entry ? `${code} ${repairText(entry.name)}` : "" },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
  );
}
