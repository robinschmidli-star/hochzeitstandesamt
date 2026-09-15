import { NextResponse } from "next/server";
import { createVerificationRequest } from "@/lib/verification";
import { prisma } from "@/lib/prisma";

type BatchItem = { officeId: string; language?: string };

const UUID = /^[0-9a-f-]{36}$/i;
const LANGUAGES = new Set(["de", "fr", "it"]);

/**
 * Create many office-level verification links in one authenticated request.
 * The endpoint deliberately returns the raw tokens once; only their hashes are
 * persisted. Callers should store the response securely (for example to build
 * mail drafts) and never log it.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Erwartet wird JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Ungültige Eingabe." }, { status: 400 });
  }
  const input = body as { items?: unknown; replaceExisting?: unknown; days?: unknown };
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 1000) {
    return NextResponse.json({ message: "items muss 1 bis 1000 Einträge enthalten." }, { status: 400 });
  }

  const seen = new Set<string>();
  const items: BatchItem[] = [];
  for (const raw of input.items) {
    if (!raw || typeof raw !== "object") return NextResponse.json({ message: "Ungültiger Eintrag." }, { status: 400 });
    const item = raw as { officeId?: unknown; language?: unknown };
    const officeId = String(item.officeId ?? "");
    const language = String(item.language ?? "de").toLowerCase();
    if (!UUID.test(officeId) || !LANGUAGES.has(language)) {
      return NextResponse.json({ message: "officeId oder language ist ungültig." }, { status: 400 });
    }
    const key = `${officeId}:${language}`;
    if (!seen.has(key)) {
      seen.add(key);
      items.push({ officeId, language });
    }
  }

  const replaceExisting = input.replaceExisting === true;
  const days = input.days === undefined ? 15 : Number(input.days);
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    return NextResponse.json({ message: "days muss eine ganze Zahl zwischen 1 und 365 sein." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const results: Array<Record<string, unknown>> = [];
  for (const item of items) {
    try {
      if (replaceExisting) {
        await prisma.$executeRaw`
          UPDATE verification_requests
          SET status='revoked', revoked_at=now(), updated_at=now()
          WHERE office_id=${item.officeId}::uuid AND venue_id IS NULL
            AND status='active' AND revoked_at IS NULL
        `;
      }
      const result = await createVerificationRequest({
        officeId: item.officeId,
        languageCode: item.language as "de" | "fr" | "it",
        sourceType: "civil_registry_office",
        days,
      });
      results.push({ officeId: item.officeId, language: item.language, id: result.id, url: `${origin}/verify/${result.token}`, expiresAt: result.expiresAt });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      results.push({ officeId: item.officeId, language: item.language, error: message });
    }
  }

  const failed = results.filter((result) => "error" in result).length;
  return NextResponse.json({ count: results.length, created: results.length - failed, failed, results }, { status: failed ? 207 : 200 });
}
