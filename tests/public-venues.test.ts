import assert from "node:assert/strict";
import test from "node:test";
import { dedupePublicVenues } from "../lib/public-venues.ts";
import type { CeremonyVenue } from "../lib/types.ts";

const venue = (values: Partial<CeremonyVenue>): CeremonyVenue => ({
  canonicalId: "00000000-0000-0000-0000-000000000001",
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

test("duplicates supplement missing values without overwriting conflicts", () => {
  const result = dedupePublicVenues([
    venue({ canonicalId: "a", officialConfirmed: true, adresse: "", maxCeremonyGuests: 20 }),
    venue({ canonicalId: "b", adresse: "Dorfstrasse 1", maxCeremonyGuests: 40 })
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].canonicalId, "a");
  assert.equal(result[0].adresse, "Dorfstrasse 1");
  assert.equal(result[0].maxCeremonyGuests, 20);
});
