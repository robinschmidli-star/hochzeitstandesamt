import fs from "node:fs";
import path from "node:path";
import { parseCompoundFile, parseWorkbook } from "./read-xls.mjs";

const sourceFile = process.argv[2];
const outputFile = process.argv[3] ?? "lib/registry-data.ts";
if (!sourceFile) throw new Error("Usage: node scripts/build-registry-data.mjs <source.xls> [output.ts]");

const cantonNames = {
  AG: "Aargau",
  AI: "Appenzell Innerrhoden",
  AR: "Appenzell Ausserrhoden",
  BE: "Bern",
  BL: "Basel-Landschaft",
  BS: "Basel-Stadt",
  FR: "Freiburg",
  GE: "Genf",
  GL: "Glarus",
  GR: "Graubuenden",
  JU: "Jura",
  LU: "Luzern",
  NE: "Neuenburg",
  NW: "Nidwalden",
  OW: "Obwalden",
  SG: "St. Gallen",
  SH: "Schaffhausen",
  SO: "Solothurn",
  SZ: "Schwyz",
  TG: "Thurgau",
  TI: "Tessin",
  UR: "Uri",
  VD: "Waadt",
  VS: "Wallis",
  ZG: "Zug",
  ZH: "Zuerich"
};

const cantonCenters = {
  GE: [12, 72],
  VD: [24, 66],
  VS: [46, 80],
  NE: [30, 51],
  JU: [35, 36],
  FR: [37, 59],
  BE: [47, 55],
  BS: [44, 26],
  BL: [47, 30],
  SO: [50, 39],
  AG: [58, 38],
  LU: [61, 52],
  OW: [62, 62],
  NW: [65, 59],
  UR: [70, 67],
  SZ: [72, 56],
  ZG: [68, 49],
  ZH: [70, 38],
  SH: [75, 25],
  TG: [82, 34],
  SG: [84, 45],
  AR: [88, 43],
  AI: [88, 47],
  GL: [78, 57],
  GR: [86, 72],
  TI: [74, 90]
};

function clean(value) {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function slugify(value) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const workbook = parseCompoundFile(fs.readFileSync(sourceFile));
const [sheet] = parseWorkbook(workbook);
const rows = sheet.rows.slice(6);
const offices = new Map();
const municipalityRows = [];

for (const row of rows) {
  const municipality = clean(row[0]);
  const canton = clean(row[1]);
  const name = clean(row[2]);
  const postalCode = clean(row[3]).replace(/\.0$/, "");
  const city = clean(row[4]);
  const address = clean(row[5]);
  const postBox = clean(row[6]);
  const phone = clean(row[7]);
  const fax = clean(row[8]);
  const email = clean(row[9]);

  if (!canton || !cantonNames[canton] || !name || !postalCode) continue;

  const key = [canton, name, postalCode, city, address, phone, email].join("|");
  if (!offices.has(key)) {
    const baseSlug = slugify(`${name}-${city}-${canton}`);
    offices.set(key, {
      id: baseSlug,
      name,
      slug: baseSlug,
      canton,
      cantonName: cantonNames[canton],
      postalCode,
      city,
      addressLine1: address,
      postBox,
      phone,
      fax,
      email,
      officialUrl: "",
      responsibleMunicipalities: [],
      map: cantonCenters[canton] ?? [50, 50]
    });
  }

  const office = offices.get(key);
  if (municipality && !office.responsibleMunicipalities.includes(municipality)) {
    office.responsibleMunicipalities.push(municipality);
    municipalityRows.push({ municipality, canton, officeSlug: office.slug });
  }
}

const usedSlugs = new Map();
const registryOffices = [...offices.values()].map((office) => {
  const count = usedSlugs.get(office.slug) ?? 0;
  usedSlugs.set(office.slug, count + 1);
  return {
    ...office,
    slug: count ? `${office.slug}-${count + 1}` : office.slug,
    responsibleMunicipalities: office.responsibleMunicipalities.sort((a, b) => a.localeCompare(b, "de-CH"))
  };
});

const registryCantons = Object.entries(cantonNames).map(([code, name]) => ({
  code,
  name,
  slug: slugify(name),
  officeCount: registryOffices.filter((office) => office.canton === code).length,
  municipalityCount: municipalityRows.filter((row) => row.canton === code).length,
  map: cantonCenters[code]
}));

const content = `import type { RegistryCanton, SwissRegistryOffice } from "@/lib/types";

export const registryCantons = ${JSON.stringify(registryCantons, null, 2)} satisfies RegistryCanton[];

export const swissRegistryOffices = ${JSON.stringify(registryOffices, null, 2)} satisfies SwissRegistryOffice[];
`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, content);
console.log(`Wrote ${registryOffices.length} registry offices and ${municipalityRows.length} municipality links to ${outputFile}.`);
