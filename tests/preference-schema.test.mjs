import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
const migration = readFileSync(
  new URL("../prisma/migrations/20260906120000_add_visitor_preferences/migration.sql", import.meta.url),
  "utf8"
);

test("preference schema uses the existing pseudonymous visitor hash", () => {
  for (const model of ["VisitorPreferenceProfile", "SearchContext", "FavoriteVenue", "AvailabilityInterest"]) {
    assert.match(schema, new RegExp(`model ${model} \\{`));
  }
  assert.match(migration, /CHECK \("visitor_hash" ~ '\^\[0-9a-f\]\{64\}\$'\)/);
  for (const forbidden of ["ip_address", "user_agent", "first_name", "last_name", "email", "phone"]) {
    assert.ok(!migration.includes(forbidden), forbidden);
  }
});

test("favorite state references canonical venues and cannot duplicate a visitor venue pair", () => {
  assert.match(schema, /venueId\s+String\s+@map\("venue_id"\) @db\.Uuid/);
  assert.match(schema, /@@unique\(\[visitorHash, venueId\], map: "favorite_venues_visitor_venue_key"\)/);
  assert.match(schema, /searchContext\s+SearchContext\?/);
  assert.ok(!schema.includes("model FavoriteVenueData"));
});

test("search and availability ranges are constrained and availability has one canonical enum", () => {
  for (const status of ["available", "unavailable", "unknown", "manual_check", "not_supported"]) {
    assert.match(schema, new RegExp(`\\n  ${status}\\r?\\n`));
  }
  assert.match(migration, /search_contexts_date_range_check/);
  assert.match(migration, /availability_interests_date_range_check/);
  assert.match(migration, /FOREIGN KEY \("search_context_id"\) REFERENCES "search_contexts"\("id"\)/);
});
