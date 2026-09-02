import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { ceremonyVenues } from "../lib/ceremony-venues";
import { ceremonyVenueGallery, ceremonyVenueMedia, registryOfficeMedia } from "../lib/safe-media";
import { swissRegistryOffices } from "../lib/registry-data";

test("office crests are used without exposing source metadata", () => {
  const officeWithCrest = swissRegistryOffices.find((office) => office.coatOfArmsUrl);
  assert.ok(officeWithCrest);
  assert.equal(registryOfficeMedia(officeWithCrest).status, "fallback_crest");
  assert.equal(registryOfficeMedia(officeWithCrest).url, officeWithCrest.coatOfArmsUrl);
  assert.deepEqual(Object.keys(registryOfficeMedia(officeWithCrest)).sort(), ["alt", "fit", "status", "url"]);
});

test("Zurich and Volketswil offices have visible crest fallbacks", () => {
  for (const slug of ["zivilstandsamt-zurich-zurich-zh", "zivilstandsamt-volketswil-volketswil-zh"]) {
    const office = swissRegistryOffices.find((item) => item.slug === slug);
    assert.ok(office);
    assert.equal(registryOfficeMedia(office).status, "fallback_crest");
    assert.ok(registryOfficeMedia(office).url);
  }
});

test("venue photos take precedence and the responsible office crest is the fallback", () => {
  const officeWithCrest = swissRegistryOffices.find((office) => office.coatOfArmsUrl);
  assert.ok(officeWithCrest);
  const base = ceremonyVenues[0];
  const venue = { ...base, standesamt_id: officeWithCrest.id, imageUrl: undefined, imageStatus: undefined };
  assert.equal(ceremonyVenueMedia(venue).url, officeWithCrest.coatOfArmsUrl);
  assert.equal(ceremonyVenueMedia(venue).status, "fallback_crest");

  const withPhoto = ceremonyVenueMedia({
    ...venue,
    imageUrl: "/photo.jpg",
    imageStatus: "approved",
    publicDisplayWithoutCreditApproved: true
  });
  assert.equal(withPhoto.url, "/photo.jpg");
  assert.equal(withPhoto.status, "approved");
  assert.equal(withPhoto.fallback?.url, officeWithCrest.coatOfArmsUrl);
});

test("venue media requires explicit approval for display without credit", () => {
  const unapproved = ceremonyVenueMedia({
    ...ceremonyVenues[0],
    imageUrl: "/test.jpg",
    imageStatus: "approved",
    publicDisplayWithoutCreditApproved: false
  });
  assert.notEqual(unapproved.url, "/test.jpg");
  assert.notEqual(unapproved.status, "approved");

  const approved = ceremonyVenueMedia({
    ...ceremonyVenues[0],
    imageUrl: "/test.jpg",
    imageStatus: "approved",
    publicDisplayWithoutCreditApproved: true
  });
  assert.equal(approved.url, "/test.jpg");
  assert.equal(approved.status, "approved");
  assert.equal(approved.fallback?.status === "fallback_crest" || approved.fallback?.status === "placeholder", true);
});

test("public components do not render media source or attribution text", () => {
  const component = readFileSync(new URL("../components/SafeMediaFrame.tsx", import.meta.url), "utf8");
  const officePage = readFileSync(new URL("../app/zivilstandsamt/[slug]/page.tsx", import.meta.url), "utf8");
  assert.ok(!component.includes("SafeMediaAttribution"));
  assert.ok(!officePage.includes("SafeMediaAttribution"));
});

test("venue gallery keeps approved order, removes duplicates and rejects unapproved images", () => {
  const gallery = ceremonyVenueGallery({
    ...ceremonyVenues[0],
    imageUrl: "/primary.jpg",
    imageAlt: "Primary",
    imageStatus: "approved",
    publicDisplayWithoutCreditApproved: true,
    galleryImages: [
      { url: "/primary.jpg", alt: "Duplicate", publicDisplayWithoutCreditApproved: true },
      { url: "/second.jpg", alt: "Second", publicDisplayWithoutCreditApproved: true },
      { url: "/third.jpg", alt: "Third", publicDisplayWithoutCreditApproved: true },
      { url: "/fourth.jpg", alt: "Fourth", publicDisplayWithoutCreditApproved: true },
      { url: "/fifth.jpg", alt: "Fifth", publicDisplayWithoutCreditApproved: true },
      { url: "/sixth.jpg", alt: "Sixth", publicDisplayWithoutCreditApproved: true },
      { url: "/seventh.jpg", alt: "Seventh", publicDisplayWithoutCreditApproved: true },
      { url: "/blocked.jpg", alt: "Blocked", publicDisplayWithoutCreditApproved: false }
    ]
  });
  assert.deepEqual(gallery.map((image) => image.url), [
    "/primary.jpg", "/second.jpg", "/third.jpg", "/fourth.jpg",
    "/fifth.jpg", "/sixth.jpg", "/seventh.jpg"
  ]);
});
