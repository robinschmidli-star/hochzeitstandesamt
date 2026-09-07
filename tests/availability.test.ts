import assert from "node:assert/strict";
import test from "node:test";
import { availabilityForDate, validDateOnly } from "../lib/availability";

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
