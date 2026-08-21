import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;
const checkOnly = process.argv.includes("--check");
const connectionString = process.env.PUBLIC_REPLICA_DATABASE_URL ?? process.env.CANONICAL_DATABASE_URL;
if (!connectionString) {
  throw new Error("PUBLIC_REPLICA_DATABASE_URL (or legacy CANONICAL_DATABASE_URL) is required and must expose only the curated web_public_* contract");
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
const text = (value) => (value == null ? "" : String(value).trim());
const number = (value) => {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};
const boolean = (value) => {
  if (value === true || /^(true|yes|ja|1)$/i.test(text(value))) return true;
  if (value === false || /^(false|no|nein|0)$/i.test(text(value))) return false;
  return null;
};
const list = (value) =>
  [...new Set(text(value).split(/[,;|\n]+/).map((item) => item.trim()).filter(Boolean))];

function uniqueMatch(items, key) {
  const matches = items.filter((item) => key(item));
  return matches.length === 1 ? matches[0] : null;
}

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

const mediaByEntityId = new Map(mediaRows.map((row) => [String(row.entity_id), row]));
function publicMediaFields(entityId) {
  const media = mediaByEntityId.get(String(entityId));
  if (!media) {
    return {
      imageUrl: undefined,
      imageAlt: undefined,
      imageSource: undefined,
      imageLicense: undefined,
      imageAttribution: undefined,
      imageStatus: undefined
    };
  }
  return {
    imageUrl: text(media.image_url),
    imageAlt: text(media.image_alt),
    imageSource: text(media.image_source),
    imageLicense: undefined,
    imageAttribution: text(media.image_attribution),
    imageStatus: "approved"
  };
}

const cantonByCode = new Map(existingCantons.map((item) => [item.code, item]));
const oldOfficeByKey = new Map();
for (const office of existingOffices) {
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
  const old = oldMatches.length === 1 ? oldMatches[0] : null;
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
    ceremonySaturday: boolean(profile.saturday_available ?? old?.ceremonySaturday),
    phase1CheckedAt: text(profile.last_verified_at || old?.phase1CheckedAt),
    ...publicMediaFields(row.id)
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
for (const venue of existingVenues) {
  const key = `${venue.kanton}|${normalize(venue.traulokal_name)}`;
  const values = oldVenueByKey.get(key) ?? [];
  values.push(venue);
  oldVenueByKey.set(key, values);
}
const matchedOldVenueNames = new Set();
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
  const old = oldMatches.length === 1 ? oldMatches[0] : null;
  if (old) matchedOldVenueNames.add(`${old.kanton}|${old.traulokal_name}`);
  venues.push({
    ...(old ?? {}),
    canonicalId: String(row.id),
    standesamt_id: office.id,
    standesamt_name: office.name,
    traulokal_name: text(row.name),
    adresse: text(row.address_line1 || profile.address_raw),
    ort: text(row.city || profile.locality || profile.municipality),
    kanton: canton,
    beschreibung: text(profile.description_de || old?.beschreibung),
    ceremonyMonday: boolean(profile.monday_available ?? old?.ceremonyMonday),
    ceremonyTuesday: boolean(profile.tuesday_available ?? old?.ceremonyTuesday),
    ceremonyWednesday: boolean(profile.wednesday_available ?? old?.ceremonyWednesday),
    ceremonyThursday: boolean(profile.thursday_available ?? old?.ceremonyThursday),
    ceremonyFriday: boolean(profile.friday_available ?? old?.ceremonyFriday),
    ceremonySaturday: boolean(profile.saturday_available ?? old?.ceremonySaturday),
    ceremonySunday: boolean(profile.sunday_available ?? old?.ceremonySunday),
    eveningCeremonyAvailable: boolean(
      profile.evening_available ?? old?.eveningCeremonyAvailable
    ),
    maxCeremonyGuests: number(profile.max_personen ?? profile.max_personen_raw ?? old?.maxCeremonyGuests),
    wheelchairAccessible: boolean(profile.rollstuhlgangig ?? old?.wheelchairAccessible),
    parkingAvailable: boolean(profile.parkplatze ?? old?.parkingAvailable),
    outdoorCeremonyAvailable: boolean(profile.aussenbereich ?? old?.outdoorCeremonyAvailable),
    seasonalAvailability: text(profile.ceremony_times_raw || old?.seasonalAvailability),
    venueUrl: text(row.website || profile.website || profile.source_url_detail || old?.venueUrl),
    sourceUrl: text(profile.source_url_detail || profile.source_url || old?.sourceUrl),
    remarks: text(profile.notes || profile.review_note || old?.remarks),
    ...publicMediaFields(row.id)
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
  matchedExistingVenues: matchedOldVenueNames.size,
  unmatchedExistingVenues: existingVenues.length - matchedOldVenueNames.size,
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
