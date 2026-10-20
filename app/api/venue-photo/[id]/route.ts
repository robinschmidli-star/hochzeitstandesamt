import pg from "pg";

export const runtime = "nodejs";
const globalMedia = globalThis as unknown as { approvedPhotoPool?: pg.Pool };

function photoPool() {
  const connectionString = process.env.WEB_PUBLIC_REPLICA_DATABASE_URL
    ?? process.env.PUBLIC_REPLICA_DATABASE_URL;
  if (!connectionString) throw new Error("Public media database is not configured");
  globalMedia.approvedPhotoPool ??= new pg.Pool({
    connectionString,
    max: 3,
    connectionTimeoutMillis: 10000,
    ssl: process.env.PUBLIC_REPLICA_DATABASE_SSL === "require"
      ? { rejectUnauthorized: process.env.PUBLIC_REPLICA_DATABASE_SSL_VERIFY !== "false" }
      : undefined
  });
  return globalMedia.approvedPhotoPool;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return new Response(null, { status: 404 });
  }
  try {
    const result = await photoPool().query<{ content_base64: string; sha256: string }>(
      "SELECT content_base64, sha256 FROM web_public_photo_files WHERE id=$1::uuid",
      [id]
    );
    const photo = result.rows[0];
    if (!photo?.content_base64) return new Response(null, { status: 404 });
    const etag = `"${photo.sha256}"`;
    const headers = {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
      ETag: etag
    };
    if (request.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers });
    }
    return new Response(new Uint8Array(Buffer.from(photo.content_base64, "base64")), { headers });
  } catch {
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
