import fs from "node:fs";
import * as topojson from "topojson-client";
import { geoIdentity } from "d3-geo";

const outputFile = process.argv[2] ?? "lib/office-map-points.ts";

const registrySource = fs.readFileSync("lib/registry-data.ts", "utf8");
const swissRegistryOffices = JSON.parse(
  registrySource.match(/export const swissRegistryOffices = ([\s\S]*?) satisfies SwissRegistryOffice\[];/)[1]
);
const addressGeocodes = fs.existsSync("lib/office-address-geocodes.json")
  ? JSON.parse(fs.readFileSync("lib/office-address-geocodes.json", "utf8").replace(/^\uFEFF/, ""))
  : [];
const addressGeocodeBySlug = new Map(addressGeocodes.map((item) => [item.slug, item]));

const postalCodes = JSON.parse(
  fs.readFileSync("node_modules/switzerland-postal-codes/dist/postal-codes-full.json", "utf8")
);
const allPostalEntries = Object.values(postalCodes).flat();
const topo = JSON.parse(fs.readFileSync("node_modules/swiss-maps/2026/ch-combined.json", "utf8"));
const country = topojson.feature(topo, topo.objects.country);
const projection = geoIdentity().reflectY(true).fitSize([1000, 700], country);

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\b[A-Z]{2}\b/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();

const choosePostalEntry = (office) => {
  const entries = postalCodes[String(office.postalCode)] ?? [];
  if (!entries.length) {
    const normalizedCity = normalize(office.city);
    return allPostalEntries.find(
      (entry) => entry.canton === office.canton && normalize(entry.name) === normalizedCity
    );
  }

  const sameCanton = entries.filter((entry) => entry.canton === office.canton);
  const candidates = sameCanton.length ? sameCanton : entries;
  const normalizedCity = normalize(office.city);

  return (
    candidates.find((entry) => normalize(entry.name) === normalizedCity) ??
    candidates.find((entry) => normalize(entry.name).includes(normalizedCity) || normalizedCity.includes(normalize(entry.name))) ??
    candidates[0]
  );
};

const unmatched = [];
const officeMapPoints = swissRegistryOffices
  .map((office) => {
    const addressGeocode = addressGeocodeBySlug.get(office.slug);
    const longitude = addressGeocode?.longitude ? Number(addressGeocode.longitude) : undefined;
    const latitude = addressGeocode?.latitude ? Number(addressGeocode.latitude) : undefined;
    const entry = longitude && latitude ? undefined : choosePostalEntry(office);
    const lonLat = longitude && latitude ? [longitude, latitude] : entry ? [Number(entry.longitude), Number(entry.latitude)] : undefined;

    if (!lonLat) {
      unmatched.push(`${office.canton} ${office.postalCode} ${office.city} (${office.name})`);
      return null;
    }

    const projected = projection(lonLat).map((value) => Number(value.toFixed(1)));

    return {
      slug: office.slug,
      canton: office.canton,
      x: projected[0],
      y: projected[1],
      sourceName: addressGeocode?.label || entry?.name || office.city,
      precision: addressGeocode?.precision === "office-address" ? "office-address" : "postal-code"
    };
  })
  .filter(Boolean);

const content = `export type OfficeMapPoint = {
  slug: string;
  canton: string;
  x: number;
  y: number;
  sourceName: string;
  precision: "office-address" | "postal-code";
};

export const officeMapPoints = ${JSON.stringify(officeMapPoints, null, 2)} satisfies OfficeMapPoint[];
`;

fs.writeFileSync(outputFile, content);
console.log(`Wrote ${officeMapPoints.length} office map points to ${outputFile}.`);
if (unmatched.length) {
  console.log("Unmatched offices:");
  for (const item of unmatched) console.log(`- ${item}`);
}
