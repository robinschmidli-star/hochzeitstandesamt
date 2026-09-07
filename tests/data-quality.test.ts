import assert from "node:assert/strict";
import test from "node:test";
import { venueCompleteness } from "../lib/data-quality";

const complete = {
  name: "Schloss", officeId: "office", canton: "ZH", municipality: "Winterthur", address: "Dorfplatz 1",
  ceremonyDays: ["friday"], reservation: false, capacity: 0, indoor: false, outdoor: true,
  wheelchair: false, parking: false, season: "ganzjährig", officialUrl: "https://example.test",
  imageUrl: "https://example.test/photo.jpg", verificationStatus: "verified", lastVerifiedAt: "2026-09-01"
};

test("complete venue scores 100 and false/zero are known values", () => {
  assert.deepEqual(venueCompleteness(complete), { score: 100, category: "Excellent", missing: [] });
});

test("score reacts deterministically when important data is removed", () => {
  const result = venueCompleteness({ ...complete, officialUrl: "", imageUrl: "" });
  assert.equal(result.score, 70);
  assert.equal(result.category, "Needs Improvement");
  assert.deepEqual(result.missing, ["Offizielle Quelle", "Foto / Medien-Fallback"]);
});

test("a documented media fallback satisfies the media contract", () => {
  const result = venueCompleteness({ ...complete, imageUrl: "", mediaFallbackStatus: "coat_of_arms" });
  assert.equal(result.score, 100);
});
