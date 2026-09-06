import assert from "node:assert/strict";
import test from "node:test";
import { parseGermanPublishedDates } from "../lib/availability/connectors";

test("parses published German wedding dates conservatively", () => {
  const slots = parseGermanPublishedDates(`
    <h2>Trautermine 2027</h2>
    <p>16. April 2027 – ausgebucht</p>
    <p>09. Juli 2027</p>
    <p>24. September 2027 – verfügbar</p>
  `);

  assert.equal(slots.length, 3);
  assert.deepEqual(
    slots.map((slot) => [slot.date.toISOString().slice(0, 10), slot.status, slot.precision]),
    [
      ["2027-04-16", "unavailable", "published_wedding_day"],
      ["2027-07-09", "unknown", "published_wedding_day"],
      ["2027-09-24", "available", "published_wedding_day"],
    ],
  );
});

test("deduplicates a date and keeps explicit status over unknown", () => {
  const slots = parseGermanPublishedDates(`
    <p>05. Februar 2027</p>
    <p>05. Februar 2027 – ausgebucht</p>
  `);

  assert.equal(slots.length, 1);
  assert.equal(slots[0].status, "unavailable");
});
