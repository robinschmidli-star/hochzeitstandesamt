import { NextResponse } from "next/server";
import { findDraft } from "@/lib/gmail";

export async function GET(request: Request) {
  try { const query = new URL(request.url).searchParams.get("q") || "in:drafts"; return NextResponse.json({ drafts: await findDraft(query) }); }
  catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "gmail_error" }, { status: 502 }); }
}
