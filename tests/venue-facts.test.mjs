import assert from "node:assert/strict";
import test from "node:test";
import { number, venueFacts } from "../scripts/venue-facts.mjs";

test("missing capacity never becomes zero or falls back to a generated zero", () => {
  for (const value of [null, undefined, "", " ", "10–12", "20 posti in piedi", true]) {
    assert.equal(number(value), null);
  }
  assert.equal(venueFacts({}, { maxCeremonyGuests: 0 }).maxCeremonyGuests, null);
  assert.equal(venueFacts({ max_personen: "" }).maxCeremonyGuests, null);
  assert.equal(venueFacts({ capacity_max: 0 }).maxCeremonyGuests, 0);
  assert.equal(venueFacts({ capacity_max: -1 }).maxCeremonyGuests, null);
  assert.equal(venueFacts({ capacity_max: 12.5 }).maxCeremonyGuests, null);
});

test("canonical facts take precedence without losing source restrictions", () => {
  const profile = {
    capacity_max: 40, max_personen: "50", max_personen_raw: "50 standing",
    raume_kapazitat_detail: "Saal 40, Stube 12", indoor: false, innenbereich: "ja",
    ceremony_days: { friday: true, saturday: false, sunday: null },
    saturday_available: "Only selected Saturdays",
    parkplatze: "Public car park 200 m away", ceremony_times: { friday: "14–16" },
    ceremony_times_raw: "old times", seasonal_availability: "April–October"
  };
  const original = JSON.stringify(profile);
  const facts = venueFacts(profile);
  assert.equal(facts.maxCeremonyGuests, 40);
  assert.match(facts.capacityNote, /50 standing/);
  assert.match(facts.capacityNote, /Saal 40/);
  assert.equal(facts.indoor, false);
  assert.equal(facts.ceremonyFriday, true);
  assert.equal(facts.ceremonySaturday, false);
  assert.equal(facts.ceremonySunday, null);
  assert.match(facts.ceremonyDaysNote, /Only selected Saturdays/);
  assert.equal(facts.parkingAvailable, null);
  assert.equal(facts.parkingDescription, profile.parkplatze);
  assert.equal(facts.ceremonyTimes, JSON.stringify(profile.ceremony_times));
  assert.equal(facts.seasonalAvailability, "April–October");
  assert.equal(JSON.stringify(profile), original);
});

test("raw times cannot silently become seasonal availability", () => {
  const facts = venueFacts({ ceremony_times_raw: "Fr 14–16 Uhr" }, { seasonalAvailability: "Fr 14–16 Uhr" });
  assert.equal(facts.ceremonyTimes, "Fr 14–16 Uhr");
  assert.equal(facts.seasonalAvailability, "");
});

test("ambiguous days remain visible and cannot satisfy a boolean filter", () => {
  const facts = venueFacts({ saturday_available: "ja, definierte Samstage" });
  assert.equal(facts.ceremonySaturday, null);
  assert.match(facts.ceremonyDaysNote, /ja, definierte Samstage/);
  const list = venueFacts({ ceremony_days: ["friday"] });
  assert.equal(list.ceremonyFriday, true);
  assert.equal(list.ceremonyMonday, null);
  assert.match(venueFacts({ ceremony_days: "nach Absprache" }).ceremonyDaysNote, /nach Absprache/);
});
