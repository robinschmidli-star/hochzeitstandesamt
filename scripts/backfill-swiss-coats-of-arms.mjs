import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const apply = process.argv.includes("--apply");
const root = path.resolve(import.meta.dirname, "..");
const dataPath = path.join(root, "lib", "registry-data.ts");
const assetDir = path.join(root, "public", "coats-of-arms");
const source = fs.readFileSync(dataPath, "utf8");
const match = source.match(/export const swissRegistryOffices = ([\s\S]*?) satisfies SwissRegistryOffice\[\];/);
if (!match) throw new Error("Could not parse registry offices");
const offices = JSON.parse(match[1]);

const explicitMunicipality = new Map([
  ["Estavayer-le-Lac", "Estavayer"],
  ["Châtel-St-Denis", "Châtel-Saint-Denis"],
  ["Morat", "Murten"],
  ["Vésenaz", "Cologny"],
  ["Chambésy", "Pregny-Chambésy"],
  ["Grand-Lancy", "Lancy"],
  ["Emmenbrücke", "Emmen"],
  ["Dornach 1", "Dornach"],
  ["Olten 1 Fächer", "Olten"]
]);
const wikipediaTitle = new Map([
  ["Baden", "Baden_AG"], ["Bühler", "Bühler_AR"], ["Romont", "Romont_FR"],
  ["Langnau i. E.", "Langnau_im_Emmental"],
  ["Bulle", "Bulle_FR"], ["Fribourg", "Freiburg_im_Üechtland"],
  ["Chêne-Bougeries", "Chêne-Bougeries_GE"], ["Cologny", "Cologny_GE"],
  ["Pregny-Chambésy", "Pregny-Chambésy_GE"], ["Bernex", "Bernex_GE"],
  ["Chêne-Bourg", "Chêne-Bourg_GE"], ["Carouge", "Carouge_GE"],
  ["Glarus", "Glarus_(Gemeinde)"], ["Wil", "Wil_SG"], ["Dornach", "Dornach_SO"],
  ["Sierre", "Siders"], ["Sion", "Sitten"]
]);
const explicitCommonsFile = new Map([
  ["Fribourg", "CHE Fribourg COA.svg"],
  ["Chêne-Bougeries", "CHE Chêne-Bougeries COA.svg"],
  ["Cologny", "CHE Cologny COA.svg"],
  ["Pregny-Chambésy", "CHE Pregny-Chambésy COA.svg"],
  ["Chêne-Bourg", "CHE Chêne-Bourg COA.svg"],
  ["Glarus", "Wappen der Gemeinde Glarus.svg"],
  ["Willisau", "CHE Willisau COA.png"],
  ["Emmen", "CHE Emmen COA.svg"],
  ["Hochdorf", "CHE Hochdorf COA.svg"],
  ["Sempach", "CHE Sempach COA.png"],
  ["Wil", "CHE Wil SG COA.svg"]
]);

const slugify = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const normalized = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function resolveCoat(name) {
  const explicitFile = explicitCommonsFile.get(name);
  if (explicitFile) {
    const storageName = explicitFile.replaceAll(" ", "_");
    const hash = crypto.createHash("md5").update(storageName).digest("hex");
    const fileUrl = `https://upload.wikimedia.org/wikipedia/commons/${hash[0]}/${hash.slice(0, 2)}/${encodeURIComponent(storageName)}`;
    return {
      pageUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(explicitFile)}`,
      imageUrl: `https://images.weserv.nl/?url=${encodeURIComponent(fileUrl)}&output=png&w=512`,
      extension: ".png",
      score: 100
    };
  }
  const title = wikipediaTitle.get(name) ?? name.replaceAll(" ", "_");
  const pageUrl = `https://de.wikipedia.org/wiki/${encodeURIComponent(title).replaceAll("%2F", "/")}`;
  const response = await fetch(pageUrl, { headers: { "User-Agent": "hochzeitstandesamt.ch coat-of-arms audit/1.0" } });
  if (!response.ok) return null;
  const html = await response.text();
  const candidates = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const src = tag.match(/\bsrc="([^"]+)"/i)?.[1]?.replaceAll("&amp;", "&");
    if (!src) continue;
    const imageUrl = src.startsWith("//") ? `https:${src}` : new URL(src, pageUrl).href;
    if (!/\.(?:svg|gif)(?:\.png)?(?:\/|\?|$)/i.test(imageUrl)) continue;
    const haystack = normalized(decodeURIComponent(new URL(imageUrl).pathname));
    const nameTokens = normalized(name).split(" ").filter((token) => token.length >= 4);
    const nameMatches = nameTokens.filter((token) => haystack.includes(token)).length;
    if (!nameMatches) continue;
    const score = nameMatches * 10
      + (/\b(?:coa|wappen|blason|coat of arms)\b/.test(haystack) ? 4 : 0)
      + (/\/1[02]0px-|\/2[05]0px-/.test(imageUrl) ? 2 : 0)
      - (/\/20px-|canton|kanton|district|bezirk|matt/.test(imageUrl) ? 8 : 0);
    candidates.push({ pageUrl: response.url, imageUrl, score });
  }
  const best = candidates.sort((left, right) => right.score - left.score)[0];
  return best?.score >= 10 ? best : null;
}

const missing = offices.filter((office) => !office.coatOfArmsUrl);
const resolvedByMunicipality = new Map();
const records = [];
for (const office of missing) {
  const municipality = explicitMunicipality.get(office.city) ?? office.city;
  let resolved = resolvedByMunicipality.get(municipality);
  if (resolved === undefined) {
    resolved = await resolveCoat(municipality);
    resolvedByMunicipality.set(municipality, resolved);
    await wait(250);
  }
  if (!resolved) {
    records.push({ canonicalId: office.canonicalId, office: office.name, municipality, status: "NOT_FOUND" });
    continue;
  }
  const extension = resolved.extension ?? (resolved.imageUrl.toLowerCase().includes(".svg.png") ? ".png" : path.extname(new URL(resolved.imageUrl).pathname).toLowerCase() || ".png");
  const assetName = `${slugify(municipality)}${extension}`;
  records.push({ canonicalId: office.canonicalId, office: office.name, municipality, status: "RESOLVED", assetName, ...resolved });
}

if (apply) {
  fs.mkdirSync(assetDir, { recursive: true });
  for (const record of records.filter((item) => item.status === "RESOLVED")) {
    const target = path.join(assetDir, record.assetName);
    if (!fs.existsSync(target)) {
      let response;
      response = await fetch(record.imageUrl, { headers: { "User-Agent": "hochzeitstandesamt.ch coat-of-arms audit/1.0" } });
      if (response.status === 429) {
        const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(record.imageUrl)}&output=png`;
        response = await fetch(proxyUrl, { headers: { "User-Agent": "hochzeitstandesamt.ch coat-of-arms audit/1.0" } });
      }
      if (!response?.ok) {
        record.status = "DOWNLOAD_FAILED";
        continue;
      }
      fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
      await wait(1000);
    }
    const office = offices.find((item) => item.canonicalId === record.canonicalId);
    office.coatOfArmsUrl = `/coats-of-arms/${record.assetName}`;
    office.mediaAlt = `Wappen der Gemeinde ${record.municipality}`;
    office.mediaLicenseNote = `Quelle: ${record.pageUrl}; abgerufen am 2026-08-21`;
  }
  const nextArray = JSON.stringify(offices, null, 2);
  fs.writeFileSync(dataPath, source.replace(match[1], nextArray));
}

const summary = {
  mode: apply ? "APPLY" : "DRY_RUN",
  total: offices.length,
  existing: offices.length - missing.length,
  missingBefore: missing.length,
  resolved: records.filter((item) => item.status === "RESOLVED").length,
  open: records.filter((item) => item.status !== "RESOLVED").length
};
console.log(JSON.stringify({ summary, open: records.filter((item) => item.status !== "RESOLVED"), records }, null, 2));
