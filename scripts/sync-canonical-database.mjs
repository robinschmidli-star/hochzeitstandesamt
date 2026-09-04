import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";
import { boolean, number, text, venueFacts } from "./venue-facts.mjs";

const { Client } = pg;
const checkOnly = process.argv.includes("--check");
const connectionString =
  process.env.WEB_PUBLIC_REPLICA_DATABASE_URL ??
  process.env.PUBLIC_REPLICA_DATABASE_URL ??
  process.env.CANONICAL_DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "WEB_PUBLIC_REPLICA_DATABASE_URL, PUBLIC_REPLICA_DATABASE_URL, or legacy CANONICAL_DATABASE_URL is required and must expose only the curated web_public_* contract"
  );
}

const registryPath = path.resolve("lib/registry-data.ts");
const venuesPath = path.resolve("lib/ceremony-venues.ts");
const reportPath = path.resolve(
  checkOnly ? "reports/canonical-database-check.json" : "reports/canonical-database-sync.json"
);

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

function extractArray(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) throw new Error(`Could not parse existing ${label}`);
  return JSON.parse(match[1]);
}

const registrySource = fs.readFileSync(registryPath, "utf8");
const venuesSource = fs.readFileSync(venuesPath, "utf8");
const existingCantons = extractArray(
  registrySource,
  /export const registryCantons = ([\s\S]*?) satisfies RegistryCanton\[\];/,
  "cantons"
);
const existingOffices = extractArray(
  registrySource,
  /export const swissRegistryOffices = ([\s\S]*?) satisfies SwissRegistryOffice\[\];/,
  "offices"
);
const existingVenues = extractArray(
  venuesSource,
  /export const ceremonyVenues: CeremonyVenue\[\] = ([\s\S]*?);\s*$/,
  "venues"
);

const normalize = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const slugify = (value) => normalize(value).replace(/ /g, "-") || "eintrag";
const list = (value) =>
  [...new Set(text(value).split(/[,;|\n]+/).map((item) => item.trim()).filter(Boolean))];

function uniqueSlug(base, used, suffix) {
  let candidate = base;
  if (used.has(candidate)) candidate = `${base}-${suffix}`;
  used.add(candidate);
  return candidate;
}

const sslMode = process.env.PUBLIC_REPLICA_DATABASE_SSL ?? process.env.CANONICAL_DATABASE_SSL;
const sslVerify = process.env.PUBLIC_REPLICA_DATABASE_SSL_VERIFY ?? process.env.CANONICAL_DATABASE_SSL_VERIFY;
const client = new Client({
  connectionString,
  ssl:
    sslMode === "require"
      ? { rejectUnauthorized: sslVerify !== "false" }
      : undefined
});

await client.connect();
let officeRows;
let venueRows;
let assignmentRows;
let mediaRows;
try {
  await client.query("BEGIN READ ONLY");
  officeRows = (await client.query("SELECT * FROM web_public_offices ORDER BY canton_code, name, id")).rows;
  venueRows = (await client.query("SELECT * FROM web_public_venues ORDER BY canton_code, name, id")).rows;
  assignmentRows = (
    await client.query(
      "SELECT venue_id, office_id FROM web_public_venue_office_assignments ORDER BY venue_id, office_id"
    )
  ).rows;
  try {
    mediaRows = (
      await client.query("SELECT * FROM web_public_media ORDER BY entity_type, entity_id")
    ).rows;
  } catch (error) {
    if (error?.code !== "42P01") throw error;
    mediaRows = [];
  }
} finally {
  await client.query("ROLLBACK").catch(() => undefined);
  await client.end();
}

const mediaByEntityId = new Map();
for (const row of mediaRows) {
  const entityId = String(row.entity_id);
  mediaByEntityId.set(entityId, [...(mediaByEntityId.get(entityId) ?? []), row]);
}
for (const rows of mediaByEntityId.values()) {
  rows.sort((left, right) =>
    Number(Boolean(right.is_primary)) - Number(Boolean(left.is_primary)) ||
    Number(left.sort_order ?? 0) - Number(right.sort_order ?? 0) ||
    text(left.image_url).localeCompare(text(right.image_url))
  );
}
function publicMediaFields(entityId, previous = {}) {
  const media = mediaByEntityId.get(String(entityId)) ?? [];
  // The public replica may not expose the optional media contract yet. In that
  // case, retain provenance-reviewed media already present in the TS snapshot.
  const primary = media[0];
  const imageUrl = text(primary?.image_url);
  if (!imageUrl) return {};
  return {
    imageUrl,
    imageAlt: text(primary.image_alt),
    imageStatus: "approved",
    publicDisplayWithoutCreditApproved:
      primary.public_display_without_credit_approved === true ||
      primary.permission_status === "allowed",
    ...((media.length > 1 || previous.imageUrl === imageUrl) && (media.length > 1 || previous.galleryImages?.length > 1) ? {
      galleryImages: media.length > 1 ? media.map((item) => ({
        url: text(item.image_url),
        alt: text(item.image_alt),
        publicDisplayWithoutCreditApproved:
          item.public_display_without_credit_approved === true || item.permission_status === "allowed"
      })) : previous.galleryImages
    } : {})
  };
}

const cantonByCode = new Map(existingCantons.map((item) => [item.code, item]));
const oldOfficeByKey = new Map();
const oldOfficeByCanonicalId = new Map();
for (const office of existingOffices) {
  if (office.canonicalId) oldOfficeByCanonicalId.set(String(office.canonicalId), office);
  const key = `${office.canton}|${normalize(office.name)}`;
  const values = oldOfficeByKey.get(key) ?? [];
  values.push(office);
  oldOfficeByKey.set(key, values);
}
const usedOfficeSlugs = new Set();
const matchedOldOfficeIds = new Set();
const canonicalOfficeById = new Map();

const offices = officeRows.map((row) => {
  const profile = row.profile ?? {};
  const canton = text(row.canton_code || profile.region_code).toUpperCase();
  const oldMatches = oldOfficeByKey.get(`${canton}|${normalize(row.name)}`) ?? [];
  const old =
    oldOfficeByCanonicalId.get(String(row.id)) ??
    (oldMatches.length === 1 ? oldMatches[0] : null);
  if (old) matchedOldOfficeIds.add(old.id);
  const cantonInfo = cantonByCode.get(canton);
  const city = text(row.city || profile.locality || profile.municipality);
  const slug = uniqueSlug(
    old?.slug ?? slugify(`${row.name}-${city}-${canton}`),
    usedOfficeSlugs,
    String(row.id).slice(0, 8)
  );
  const municipalities = list(profile.jurisdictions_raw);
  const result = {
    ...(old ?? {}),
    canonicalId: String(row.id),
    id: old?.id ?? slug,
    name: text(row.name),
    slug,
    canton,
    cantonName: cantonInfo?.name ?? text(profile.region_name || canton),
    postalCode: text(row.postal_code || profile.postal_code),
    city,
    addressLine1: text(row.address_line1 || profile.address_raw),
    postBox: old?.postBox ?? "",
    phone: text(profile.telephone || old?.phone),
    fax: old?.fax ?? "",
    email: text(profile.email || old?.email),
    officialUrl: text(row.website || profile.website || profile.source_url || old?.officialUrl),
    website_url: text(row.website || profile.website || old?.website_url),
    appointment_url: text(profile.appointment_url || old?.appointment_url),
    openingHours: text(profile.oeffnungszeiten || profile.offnungszeiten || old?.openingHours),
    responsibleMunicipalities:
      municipalities.length > 0 ? municipalities : old?.responsibleMunicipalities ?? [],
    map: old?.map ?? cantonInfo?.map ?? [],
    coatOfArmsUrl: text(profile.coat_of_arms_url || old?.coatOfArmsUrl),
    mediaAlt: text(profile.coat_of_arms_alt || old?.mediaAlt),
    mediaLicenseNote: text(profile.coat_of_arms_source_note || old?.mediaLicenseNote),
    ceremonySaturday: boolean(profile.saturday_available ?? old?.ceremonySaturday),
    phase1CheckedAt: text(profile.last_verified_at || old?.phase1CheckedAt),
    ...publicMediaFields(row.id, old)
  };
  canonicalOfficeById.set(String(row.id), result);
  return result;
});

const officeMunicipalities = new Map(existingCantons.map((item) => [item.code, new Set()]));
for (const office of offices) {
  const values = officeMunicipalities.get(office.canton) ?? new Set();
  office.responsibleMunicipalities.forEach((item) => values.add(item));
  officeMunicipalities.set(office.canton, values);
}
const cantons = existingCantons.map((canton) => ({
  ...canton,
  officeCount: offices.filter((office) => office.canton === canton.code).length,
  municipalityCount: officeMunicipalities.get(canton.code)?.size ?? 0
}));

const assignmentsByVenue = new Map();
for (const assignment of assignmentRows) {
  const venueId = String(assignment.venue_id);
  const officeIds = assignmentsByVenue.get(venueId) ?? new Set();
  officeIds.add(String(assignment.office_id));
  assignmentsByVenue.set(venueId, officeIds);
}
const oldVenueByKey = new Map();
const oldVenueByCanonicalId = new Map();
for (const venue of existingVenues) {
  if (venue.canonicalId) oldVenueByCanonicalId.set(String(venue.canonicalId), venue);
  const key = `${venue.kanton}|${normalize(venue.traulokal_name)}`;
  const values = oldVenueByKey.get(key) ?? [];
  values.push(venue);
  oldVenueByKey.set(key, values);
}
const matchedOldVenueIds = new Set();
const ambiguousVenueAssignments = [];
const venues = [];
for (const row of venueRows) {
  const profile = row.profile ?? {};
  const canton = text(row.canton_code || profile.region_code).toUpperCase();
  const officeIds = [...(assignmentsByVenue.get(String(row.id)) ?? [])];
  if (officeIds.length !== 1) {
    ambiguousVenueAssignments.push({
      canonicalId: String(row.id),
      name: row.name,
      officeIds
    });
    continue;
  }
  const office = canonicalOfficeById.get(officeIds[0]);
  if (!office) continue;
  const oldMatches = oldVenueByKey.get(`${canton}|${normalize(row.name)}`) ?? [];
  const old = oldVenueByCanonicalId.get(String(row.id)) ?? (oldMatches.length === 1 ? oldMatches[0] : null);
  if (old) matchedOldVenueIds.add(old.canonicalId ?? `${old.kanton}|${old.traulokal_name}`);
  const beautyStatus = text(profile.beauty_status || old?.beautyStatus);
  const highlightLevel = number(profile.highlight_level ?? old?.highlightLevel);
  const profileTags = Array.isArray(profile.tags)
    ? [...new Set(profile.tags.map(text).filter(Boolean))]
    : [];
  const tags = profileTags.length > 0 ? profileTags : old?.tags ?? [];
  const websitePriority = text(profile.website_priority || old?.websitePriority);
  venues.push({
    ...(old ?? {}),
    canonicalId: String(row.id),
    standesamt_id: office.canonicalId,
    standesamt_name: office.name,
    traulokal_name: text(row.name),
    adresse: text(row.address_line1 || profile.address_raw),
    ort: text(row.city || profile.locality || profile.municipality),
    kanton: canton,
    beschreibung: text(profile.description_de || old?.beschreibung),
    ...venueFacts(profile, old ?? {}),
    ...(profile.official_ceremony_possible != null ? { officialConfirmed: boolean(profile.official_ceremony_possible) } : {}),
    venueUrl: text(profile.information_url || row.website || profile.website || profile.source_url_detail || old?.venueUrl),
    sourceUrl: text(profile.source_url_detail || profile.source_url || old?.sourceUrl),
    remarks: text(profile.notes || profile.review_note || old?.remarks),
    ...(beautyStatus ? { beautyStatus } : {}),
    ...(highlightLevel !== null ? { highlightLevel } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(websitePriority ? { websitePriority } : {}),
    ...publicMediaFields(row.id, old)
  });
}

const registryOutput = `import type { RegistryCanton, SwissRegistryOffice } from "@/lib/types";\n\nexport const registryCantons = ${JSON.stringify(cantons, null, 2)} satisfies RegistryCanton[];\n\nexport const swissRegistryOffices = ${JSON.stringify(offices, null, 2)} satisfies SwissRegistryOffice[];\n`;
const venuesOutput = `import type { CeremonyVenue } from "@/lib/types";\n\nexport const ceremonyVenues: CeremonyVenue[] = ${JSON.stringify(venues, null, 2)};\n`;

const files = {
  registryData: {
    matches: registrySource === registryOutput,
    currentSha256: sha256(registrySource),
    generatedSha256: sha256(registryOutput)
  },
  ceremonyVenues: {
    matches: venuesSource === venuesOutput,
    currentSha256: sha256(venuesSource),
    generatedSha256: sha256(venuesOutput)
  }
};
const inSync = Object.values(files).every((file) => file.matches);

const report = {
  generatedAt: new Date().toISOString(),
  mode: checkOnly ? "check" : "sync",
  status: checkOnly ? (inSync ? "in_sync" : "drift") : "synced",
  publicOffices: offices.length,
  publicVenues: venues.length,
  matchedExistingOffices: matchedOldOfficeIds.size,
  unmatchedExistingOffices: existingOffices.length - matchedOldOfficeIds.size,
  matchedExistingVenues: matchedOldVenueIds.size,
  unmatchedExistingVenues: existingVenues.length - matchedOldVenueIds.size,
  withheldVenuesWithoutExactlyOnePublicOffice: ambiguousVenueAssignments.length,
  withheldVenueDetails: ambiguousVenueAssignments,
  files
};
if (!checkOnly) {
  fs.writeFileSync(registryPath, registryOutput, "utf8");
  fs.writeFileSync(venuesPath, venuesOutput, "utf8");
}
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (checkOnly && !inSync) process.exitCode = 2;
