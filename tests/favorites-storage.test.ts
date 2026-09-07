import assert from "node:assert/strict";
import test from "node:test";
import { addStoredFavorite, parseFavorites, removeStoredFavorite } from "../lib/favorites-storage";

const favorite = { canonicalId: "a13a967a-4905-5258-81ee-41ac50a4646f", slug: "test-venue", savedAt: "2026-09-06T12:00:00.000Z" };

test("favorites survive serialization with stable references only", () => {
  const document = addStoredFavorite({ version: 1, venues: [] }, favorite);
  assert.deepEqual(parseFavorites(JSON.stringify(document)), document);
  assert.deepEqual(Object.keys(document.venues[0]).sort(), ["canonicalId", "savedAt", "slug"]);
});

test("adding twice replaces instead of duplicating", () => {
  const first = addStoredFavorite({ version: 1, venues: [] }, favorite);
  const second = addStoredFavorite(first, { ...favorite, savedAt: "2026-09-06T13:00:00.000Z" });
  assert.equal(second.venues.length, 1);
  assert.equal(second.venues[0].savedAt, "2026-09-06T13:00:00.000Z");
});

test("remove, malformed JSON and version mismatch are safe", () => {
  assert.deepEqual(removeStoredFavorite({ version: 1, venues: [favorite] }, favorite.canonicalId).venues, []);
  assert.deepEqual(parseFavorites("not json").venues, []);
  assert.deepEqual(parseFavorites(JSON.stringify({ version: 2, venues: [favorite] })).venues, []);
});
