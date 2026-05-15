import fs from "node:fs";
import path from "node:path";

const sourceFile = process.argv[2];
const outputFile = process.argv[3] ?? "lib/registry-data.ts";
if (!sourceFile) throw new Error("Usage: node scripts/build-registry-data-from-csv.mjs <source.csv> [output.ts]");

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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  return rows.slice(1);
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
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

const rows = parseCsv(fs.readFileSync(sourceFile, "utf8"));
const offices = new Map();
let municipalityCount = 0;

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

  if (!municipality || !cantonNames[canton] || !name || !postalCode) continue;

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
  if (!office.responsibleMunicipalities.includes(municipality)) {
    office.responsibleMunicipalities.push(municipality);
    municipalityCount += 1;
  }
}

const usedSlugs = new Map();
const registryOffices = [...offices.values()]
  .map((office) => {
    const count = usedSlugs.get(office.slug) ?? 0;
    usedSlugs.set(office.slug, count + 1);
    return {
      ...office,
      slug: count ? `${office.slug}-${count + 1}` : office.slug,
      responsibleMunicipalities: office.responsibleMunicipalities.sort((a, b) => a.localeCompare(b, "de-CH"))
    };
  })
  .sort((a, b) => a.canton.localeCompare(b.canton) || a.name.localeCompare(b.name, "de-CH"));

const registryCantons = Object.entries(cantonNames).map(([code, name]) => ({
  code,
  name,
  slug: slugify(name),
  officeCount: registryOffices.filter((office) => office.canton === code).length,
  municipalityCount: registryOffices
    .filter((office) => office.canton === code)
    .reduce((sum, office) => sum + office.responsibleMunicipalities.length, 0),
  map: cantonCenters[code]
}));

const content = `import type { RegistryCanton, SwissRegistryOffice } from "@/lib/types";

export const registryCantons = ${JSON.stringify(registryCantons, null, 2)} satisfies RegistryCanton[];

export const swissRegistryOffices = ${JSON.stringify(registryOffices, null, 2)} satisfies SwissRegistryOffice[];
`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, content);
console.log(`Wrote ${registryOffices.length} registry offices and ${municipalityCount} municipality links to ${outputFile}.`);
