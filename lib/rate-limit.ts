import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    ?? request.headers.get("x-forwarded-for")
    ?? "unknown";
  const address = forwarded.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(address).digest("hex");
}

export async function rateLimit(
  request: Request,
  namespace: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  const hash = clientKey(request);
  const key = `${namespace}:${hash}`;
  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 1, resetAt: now + windowMs }
    : { count: current.count + 1, resetAt: current.resetAt };
  buckets.set(key, bucket);

  if (buckets.size > 10_000) {
    for (const [bucketKey, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  let count = bucket.count;
  let resetAt = bucket.resetAt;

  try {
    if (!process.env.DATABASE_URL) throw new Error("Durable rate-limit storage is not configured");
    const rows = await prisma.$queryRaw<Array<{ count: number; reset_at: Date }>>`
      INSERT INTO "rate_limit_buckets" ("namespace", "client_hash", "count", "reset_at", "updated_at")
      VALUES (${namespace}, ${hash}, 1, ${new Date(now + windowMs)}, NOW())
      ON CONFLICT ("namespace", "client_hash") DO UPDATE SET
        "count" = CASE
          WHEN "rate_limit_buckets"."reset_at" <= NOW() THEN 1
          ELSE "rate_limit_buckets"."count" + 1
        END,
        "reset_at" = CASE
          WHEN "rate_limit_buckets"."reset_at" <= NOW() THEN EXCLUDED."reset_at"
          ELSE "rate_limit_buckets"."reset_at"
        END,
        "updated_at" = NOW()
      RETURNING "count", "reset_at"
    `;
    if (rows[0]) {
      count = rows[0].count;
      resetAt = rows[0].reset_at.getTime();
    }
  } catch {
    // Development and pre-migration fallback. Production becomes durable as
    // soon as the checked-in migration is applied.
  }

  if (count <= limit) return null;
  const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
  return NextResponse.json(
    { ok: false, message: "Zu viele Anfragen. Bitte versuche es später erneut." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
