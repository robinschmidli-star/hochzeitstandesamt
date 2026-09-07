import assert from "node:assert/strict";
import test from "node:test";
import { availabilityForDate, normalizeAvailability, validDateOnly } from "../lib/availability";

test("invalid dates remain unknown", () => {
  assert.equal(validDateOnly("2027-02-29"), false);
  assert.equal(availabilityForDate("invalid", {}, true), "unknown");
});

test("a weekday explicitly not offered is unavailable", () => {
  assert.equal(availabilityForDate("2027-06-12", { saturday: false }, true), "unavailable");
});

test("offered days are never presented as live availability", () => {
  assert.equal(availabilityForDate("2027-06-12", { saturday: true }, true), "manual_check");
  assert.equal(availabilityForDate("2027-06-12", { saturday: true }, false), "not_supported");
  assert.notEqual(availabilityForDate("2027-06-12", { saturday: true }, true), "available");
});

test("missing, stale and erroneous source data never become unavailable", () => {
  assert.equal(normalizeAvailability({ sourceType: "api", status: "unavailable" }).status, "unknown");
  assert.equal(normalizeAvailability({ sourceType: "ics", status: "available", lastCheckedAt: "2026-09-01T00:00:00Z" }, new Date("2026-09-03T00:00:01Z")).status, "stale");
  assert.deepEqual(normalizeAvailability({ sourceType: "calendar_page", status: "available", nextAvailableDate: "2026-02-31" }).status, "source_error");
});
