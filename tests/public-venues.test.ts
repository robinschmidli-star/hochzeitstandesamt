import assert from "node:assert/strict";
import test from "node:test";
import { ceremonyVenueByRouteKey, ceremonyVenuePath, dedupePublicVenues } from "../lib/public-venues";
import { ceremonyVenues } from "../lib/ceremony-venues";
import { swissRegistryOffices } from "../lib/registry-data";
import type { CeremonyVenue } from "../lib/types.ts";

const venue = (values: Partial<CeremonyVenue>): CeremonyVenue => ({
  canonicalId: "00000000-0000-0000-0000-000000000001",
  slug: "gemeindesaal-ort-a",
  standesamt_id: "office",
  standesamt_name: "Office",
  traulokal_name: "Gemeindesaal",
  adresse: "",
  ort: "Ort A",
  kanton: "ZH",
  beschreibung: "",
  ceremonyMonday: null,
  ceremonyTuesday: null,
  ceremonyWednesday: null,
  ceremonyThursday: null,
  ceremonyFriday: null,
  ceremonySaturday: null,
  ceremonySunday: null,
  eveningCeremonyAvailable: null,
  maxCeremonyGuests: null,
  wheelchairAccessible: null,
  parkingAvailable: null,
  outdoorCeremonyAvailable: null,
  seasonalAvailability: "",
  venueUrl: "",
  ...values
});

test("same generic name in different places remains separate", () => {
  const result = dedupePublicVenues([
    venue({ canonicalId: "a", ort: "Ort A" }),
    venue({ canonicalId: "b", ort: "Ort B" })
  ]);
  assert.equal(result.length, 2);
});

test("distinct canonical venues are never collapsed by similar names", () => {
  const result = dedupePublicVenues([
    venue({ canonicalId: "a", officialConfirmed: true, adresse: "", maxCeremonyGuests: 20 }),
    venue({ canonicalId: "b", adresse: "Dorfstrasse 1", maxCeremonyGuests: 40 })
  ]);
  assert.equal(result.length, 2);
});

test("all canonical venues have one internal page and a valid office relation", () => {
  const officeIds = new Set(swissRegistryOffices.flatMap((office) =>
    [office.canonicalId, office.id, office.slug].filter(Boolean)
  ));
  assert.equal(new Set(ceremonyVenues.map((item) => item.canonicalId)).size, ceremonyVenues.length);
  assert.equal(new Set(ceremonyVenues.map((item) => item.slug)).size, ceremonyVenues.length);
  assert.ok(ceremonyVenues.every((item) => item.canonicalId && officeIds.has(item.standesamt_id)));
  assert.ok(ceremonyVenues.every((item) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)));
});

test("all Top 20 venues retain direct internal detail pages", () => {
  const top20 = ceremonyVenues.filter((item) => item.websitePriority?.startsWith("Top20:"));
  assert.deepEqual(top20.map((item) => item.websitePriority).sort(),
    Array.from({ length: 20 }, (_, index) => `Top20:${String(index + 1).padStart(2, "0")}`));
  assert.ok(top20.every((item) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)));
});

test("slug routes are canonical while UUID routes remain resolvable for redirects", () => {
  for (const item of ceremonyVenues) {
    assert.equal(ceremonyVenuePath(item), `/trauort/${item.slug}`);
    assert.equal(ceremonyVenueByRouteKey(item.slug)?.canonicalId, item.canonicalId);
    assert.equal(ceremonyVenueByRouteKey(item.canonicalId!)?.slug, item.slug);
  }
});
