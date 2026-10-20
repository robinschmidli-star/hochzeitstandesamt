import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../app/api/venue-photo/[id]/route";

test("photo delivery rejects unknown assets, returns WebP with ETag, and fails closed", async () => {
  const state = globalThis as unknown as { approvedPhotoPool?: unknown };
  const previousPool = state.approvedPhotoPool;
  const previousUrl = process.env.WEB_PUBLIC_REPLICA_DATABASE_URL;
  process.env.WEB_PUBLIC_REPLICA_DATABASE_URL = "postgresql://test.invalid/test";
  const id = "e861de79-7a5e-5a48-be2f-680a91a978c2";
  const context = { params: Promise.resolve({ id }) };
  const request = new Request(`https://www.hochzeitstandesamt.ch/api/venue-photo/${id}`);
  const bytes = Buffer.from("RIFFtestWEBP", "ascii");
  try {
    state.approvedPhotoPool = { query: async () => { throw new Error("must not query invalid ID"); } };
    assert.equal((await GET(request, { params: Promise.resolve({ id: "invalid' OR 1=1" }) })).status, 404);
    state.approvedPhotoPool = { query: async () => ({ rows: [] }) };
    assert.equal((await GET(request, context)).status, 404);
    state.approvedPhotoPool = { query: async (sql: string, values: string[]) => {
      assert.match(sql, /FROM web_public_photo_files WHERE id=\$1::uuid/);
      assert.deepEqual(values, [id]);
      return { rows: [{ content_base64: bytes.toString("base64"), sha256: "checksum" }] };
    } };
    const response = await GET(request, context);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/webp");
    assert.equal(response.headers.get("etag"), '"checksum"');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
    const cached = await GET(new Request(request, { headers: { "if-none-match": '"checksum"' } }), context);
    assert.equal(cached.status, 304);
    state.approvedPhotoPool = { query: async () => { throw new Error("private database diagnostic"); } };
    const failed = await GET(request, context);
    assert.equal(failed.status, 503);
    assert.equal(await failed.text(), "");
    assert.equal(failed.headers.get("cache-control"), "no-store");
  } finally {
    state.approvedPhotoPool = previousPool;
    if (previousUrl === undefined) delete process.env.WEB_PUBLIC_REPLICA_DATABASE_URL;
    else process.env.WEB_PUBLIC_REPLICA_DATABASE_URL = previousUrl;
  }
});
