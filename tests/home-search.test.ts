import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { buildNameSearchSuggestions, nameMatchRank } from "../lib/name-search";
import { featuredCeremonyVenues, homepageCeremonyVenues, searchExperienceOffices, searchExperienceResults, searchWeekday } from "../lib/search-experience";
import { swissRegistryOffices } from "../lib/registry-data";
import { withAvailableLocalePath } from "../lib/i18n";
import { discoveryHref, hasActiveSearch, paginateResults, parseSearchParams } from "../lib/discovery";
import { discoveryMetadata } from "../lib/seo";
import de from "../locales/de.json";
import type { CeremonyVenue } from "../lib/types";

test("legacy URLs and repeated weekday fields share the homepage state", () => {
  assert.deepEqual(parseSearchParams({ query: " Zürich ", canton: "ZH", preferredWeekdays: ["Mo", "Sa"], unknown: "ignored" }), {
    canton: "ZH", preferredWeekdays: "Mo,Sa", name: "Zürich"
  });
  assert.equal(parseSearchParams({ name: "Bern", query: "Zürich" }).name, "Bern");
  assert.equal(hasActiveSearch({ radius: "50", page: "2" }), false);
  assert.equal(hasActiveSearch({ submitted: "1" }), true);
  assert.equal(hasActiveSearch({ canton: "ZH" }), true);
});

test("homepage links retain filters and reset paging on changes", () => {
  const params = { name: "8001", canton: "ZH", page: "3", wheelchair: "yes" };
  const changed = new URL(discoveryHref(params, { tag: "lake" }, "/fr"), "https://example.test");
  assert.equal(changed.pathname, "/fr");
  assert.equal(changed.hash, "#results");
  assert.equal(changed.searchParams.get("name"), "8001");
  assert.equal(changed.searchParams.get("wheelchair"), "yes");
  assert.equal(changed.searchParams.get("page"), null);
  assert.equal(new URL(discoveryHref(params, { page: "2" }), "https://example.test").searchParams.get("page"), "2");
});

test("bounded pagination clamps invalid pages without losing results", () => {
  const items = Array.from({ length: 29 }, (_, index) => index);
  assert.equal(paginateResults(items).items.length, 12);
  assert.deepEqual([1, 2, 3].flatMap((page) => paginateResults(items, String(page)).items), items);
  assert.equal(paginateResults(items, "999").page, 3);
  for (const page of ["-1", "NaN", "1.5", "0"]) assert.equal(paginateResults(items, page).page, 1);
  assert.deepEqual(paginateResults([], "4").items, []);
  assert.equal(paginateResults(items, undefined, 6).items.length, 6);
});

test("legacy postcode and weekday filters remain effective", () => {
  const results = searchExperienceOffices({ postalCode: "8001", preferredWeekdays: "Sa" });
  assert.ok(results.length > 0);
  assert.ok(results.every((office) => office.available_weekdays.includes("saturday")));
  assert.equal(searchExperienceOffices({ postalCode: "8001", canton: "GE" }).length, 0);
});

test("search canonicals point to localized homepages and filtered pages are noindex", () => {
  for (const locale of ["de", "fr", "it", "en"] as const) {
    const metadata = discoveryMetadata(de, locale, {});
    assert.ok(String(metadata.alternates?.canonical).endsWith(locale === "de" ? ".ch" : "/" + locale));
    assert.deepEqual(metadata.robots, { index: true, follow: true });
    assert.deepEqual(discoveryMetadata(de, locale, { canton: "ZH" }).robots, { index: false, follow: true });
    assert.deepEqual(discoveryMetadata(de, locale, { page: "2" }).robots, { index: false, follow: true });
  }
  const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.ok(!sitemap.includes('"/search"'));
  assert.ok(!sitemap.includes('"/standesamt-finden"'));
});

test("name, town, postcode and venue names use the central search", () => {
  const office = swissRegistryOffices.find((item) => item.postalCode === "8001")!;
  assert.ok(office);
  for (const name of [office.name, office.city, office.postalCode]) {
    assert.ok(searchExperienceOffices({ name }).some((item) => item.id === office.id), name);
  }
  const venue = featuredCeremonyVenues()[0];
  assert.ok(searchExperienceOffices({ name: venue.traulokal_name }).length > 0);
  assert.ok(featuredCeremonyVenues({ name: venue.traulokal_name }).some((item) => item.canonicalId === venue.canonicalId));
  assert.equal(searchExperienceOffices({ name: "nonexistent-venue-928173" }).length, 0);
});

test("postcode suggestions are available", () => {
  assert.ok(buildNameSearchSuggestions().some((item) => nameMatchRank(item.name, "8001", [item.searchText]) !== null));
});

test("concrete venue and office names rank as independent internal results", () => {
  const cases = [
    ["The Dolder Grand", "The Dolder Grand", "venue"],
    ["Dolder", "The Dolder Grand", "venue"],
    ["Zivilstandsamt Zürich", "Zivilstandsamt Zürich", "office"],
    ["Zürich", "Zivilstandsamt Zürich", "office"],
    ["8001", "Zivilstandsamt Zürich", "office"],
    ["Blausee", "Hotel Blausee", "venue"],
    ["Amtshaus Saanen", "Amthaus Saanen", "venue"]
  ] as const;

  for (const [query, expectedName, expectedType] of cases) {
    const first = searchExperienceResults({ name: query })[0];
    assert.ok(first, query);
    assert.equal("traulokal_name" in first ? first.traulokal_name : first.name, expectedName, query);
    assert.equal("traulokal_name" in first ? "venue" : "office", expectedType, query);
  }

  const dolder = buildNameSearchSuggestions().find((item) => item.name === "The Dolder Grand");
  assert.ok(dolder);
  assert.match(dolder.href, /^\/trauort\/[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(searchExperienceResults({ name: "The Dolder Grand", canton: "ZH" })[0], searchExperienceResults({ name: "The Dolder Grand" })[0]);
});

test("venue-first ranking tolerates case, accents and spelling variants", () => {
  for (const query of ["DOLDER", "dolder", "The Dolder Grand"]) {
    const first = searchExperienceResults({ name: query })[0];
    assert.ok(first && "traulokal_name" in first, query);
    assert.equal(first.traulokal_name, "The Dolder Grand", query);
  }
  const zurich = searchExperienceResults({ name: "Zürich" });
  const zurichAscii = searchExperienceResults({ name: "zurich" });
  assert.equal("traulokal_name" in zurich[0] ? zurich[0].traulokal_name : zurich[0].name, "traulokal_name" in zurichAscii[0] ? zurichAscii[0].traulokal_name : zurichAscii[0].name);
});

test("exact venue result keeps its detail route in every core language", () => {
  const venue = searchExperienceResults({ name: "Dolder", canton: "ZH" })[0];
  assert.ok(venue && "traulokal_name" in venue);
  for (const locale of ["de", "fr", "it", "en"] as const) {
    const href = withAvailableLocalePath(`/trauort/${venue.slug}`, locale);
    assert.equal(href, `${locale === "de" ? "" : `/${locale}`}/trauort/${venue.slug}`);
  }
});

test("date uses offered weekdays, invalid dates do not invent availability", () => {
  assert.equal(searchWeekday({ date: "2026-09-05" }), "saturday");
  assert.equal(searchWeekday({ date: "2026-09-04" }), "friday");
  assert.equal(searchWeekday({ date: "2026-02-31" }), undefined);
  assert.equal(searchWeekday({ date: "invalid" }), undefined);
  assert.equal(searchWeekday({ month: "09", year: "2026" }), undefined);
  assert.deepEqual(searchExperienceOffices({ date: "2026-09-05" }), searchExperienceOffices({ weekday: "saturday" }));
  assert.deepEqual(featuredCeremonyVenues({ date: "2026-09-05" }), featuredCeremonyVenues({ weekday: "saturday" }));
});

test("combined postcode, canton and Saturday filters remain effective", () => {
  const results = searchExperienceOffices({ name: "8001", canton: "ZH", date: "2026-09-05" });
  assert.ok(results.length > 0);
  assert.ok(results.every((office) => office.canton === "ZH" && office.available_weekdays.includes("saturday")));
  assert.equal(searchExperienceOffices({ name: "8001", canton: "GE" }).length, 0);
});

test("radius uses the central place search as its origin", () => {
  const results = searchExperienceOffices({ name: "Zürich", radius: "10" });
  assert.ok(results.length > 0);
  assert.ok(results.every((office) => typeof office.distanceKm === "number" && office.distanceKm <= 10));
});

test("existing style, capacity and accessibility filters are reused", () => {
  assert.ok(searchExperienceOffices({ tag: "castle" }).every((office) => office.tags.includes("castle")));
  const venues = featuredCeremonyVenues({ maxGuests: "20", wheelchair: "yes" });
  assert.ok(venues.every((venue) => venue.maxCeremonyGuests! >= 20 && venue.wheelchairAccessible === true));
  assert.ok(featuredCeremonyVenues().length >= 6);
});

test("homepage only shows approved photos and prioritizes Top 20 venues", () => {
  const venues = homepageCeremonyVenues();
  const homepageSelection = venues.slice(0, 6);
  const firstNonTop20 = venues.findIndex((venue) => !/^Top20:\d{2}$/.test(venue.websitePriority ?? ""));

  assert.ok(homepageSelection.length > 0);
  assert.ok(venues.every((venue) =>
    venue.imageStatus === "approved" &&
    venue.publicDisplayWithoutCreditApproved === true &&
    Boolean(venue.imageUrl)
  ));
  assert.ok(firstNonTop20 > 0);
  assert.ok(venues.slice(0, firstNonTop20).every((venue) => /^Top20:\d{2}$/.test(venue.websitePriority ?? "")));
  assert.ok(venues.slice(firstNonTop20).every((venue) => !/^Top20:\d{2}$/.test(venue.websitePriority ?? "")));
  assert.deepEqual(
    venues.slice(0, firstNonTop20).map((venue) => venue.websitePriority),
    ["Top20:01", "Top20:05", "Top20:06", "Top20:07"]
  );
});

test("ambiguous venue results prefer approved photos and then Top 20 entries", () => {
  const results = searchExperienceResults({ name: "Schloss Greifensee - Landvogtstube" });
  const matchingVenues = results.filter((result): result is CeremonyVenue =>
    "traulokal_name" in result && result.traulokal_name === "Schloss Greifensee - Landvogtstube"
  );
  assert.ok(matchingVenues.length > 1);
  assert.equal(matchingVenues[0].websitePriority, "Top20:06");
  assert.ok(matchingVenues.every((venue) =>
    venue.imageStatus === "approved" && venue.publicDisplayWithoutCreditApproved === true
  ));
});

test("localized search and inspiration URLs retain parameters", () => {
  for (const locale of ["de", "fr", "it", "en"] as const) {
    assert.equal(withAvailableLocalePath("/search?tag=featured", locale), `${locale === "de" ? "" : `/${locale}`}/search?tag=featured`);
  }
});

test("all enabled languages include homepage labels", () => {
  for (const locale of ["de", "fr", "it", "en"]) {
    const dictionary = JSON.parse(readFileSync(new URL(`../locales/${locale}.json`, import.meta.url), "utf8"));
    for (const key of ["discovery.reset", "discovery.pagination", "discovery.previous", "discovery.next", "discovery.page", "discovery.postalCode", "homeSearch.submit", "homeSearch.title", "homeSearch.date", "homeSearch.guests", "homeSearch.moreFilters", "homeSearch.when", "homeSearch.exactDate", "homeSearch.flexibleDate", "homeSearch.monthYear", "homeSearch.dateRange", "homeSearch.dateHint", "homeSearch.responsibleOffice", "homeSearch.guideProcess", "homeSearch.guideDocuments", "homeSearch.allGuides", "availability.title", "availability.status.unknown", "availability.status.unavailable", "availability.status.source_error", "lead.title", "lead.submit", "lead.error", "favorite.add", "favorite.remove", "shortlist.title", "shortlist.emptyTitle", "shortlist.loading"]) {
      assert.ok(dictionary[key], `${locale}: ${key}`);
    }
  }
});
