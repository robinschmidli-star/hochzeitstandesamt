import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import process from "node:process";

const argv = process.argv.slice(2);
const option = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 ? argv[index + 1] : fallback;
};
const root = path.resolve(option("root", process.env.MEDIA_DRIVE_ROOT || "../Standesaemter_Fotos"));
const reportDir = path.resolve(option("report-dir", "reports"));
const approveHigh = argv.includes("--approve-high");
const evidencePath = option("gmail-evidence", "");
const driveRootId = option("drive-root-id", process.env.MEDIA_DRIVE_ROOT_ID || "UNKNOWN");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"]);
const rulesSource = fs.readFileSync(path.resolve("../config/matching_rules/default.yaml"), "utf8");
const rule = (name, fallback) => Number(rulesSource.match(new RegExp(`^${name}:\\s*([0-9.]+)`, "m"))?.[1] || fallback);
const matchingRules = {
  high: rule("folder_match_high", 0.9),
  medium: rule("folder_match_medium", 0.7),
  margin: rule("folder_score_margin", 0.05),
  exactName: rule("folder_exact_name_weight", 0.7),
  postalCode: rule("folder_postal_code_weight", 0.2),
  locality: rule("folder_locality_weight", 0.15),
  fuzzyName: rule("folder_fuzzy_name_weight", 0.25)
};
const supportedValues = {
  entityTypes: ["civil_registry_office", "ceremony_venue", "registry_office_venue"],
  photoSubjects: ["exterior", "interior", "ceremony_room", "building_detail", "surroundings", "signage", "map", "logo", "unknown"],
  photoQuality: ["excellent", "good", "acceptable", "poor", "unusable"],
  duplicateStatus: ["exact_duplicate", "near_duplicate", "unique", "unknown"],
  publicationStatus: ["imported", "matched", "needs_review", "approved", "published", "rejected"],
  sourceQuality: ["official_authority", "municipality", "registry_office", "official_venue", "trusted_secondary", "manual", "unknown"]
};
const canonicalCorrections = {
  "37355b0e-15d9-5a8c-98ae-c4b2c86e7898": { officialName: "Zivilstandsamt Schaffhausen", aliases: ["Zivilstandsamt Stadt Schaffhausen"] },
  "e7c2bdb7-f304-5bb0-9eb4-42e200fa01a5": { officialName: "État civil de Boudry", aliases: ["Office de l'état civil de Boudry"] },
  "ea88647b-eb07-5fde-b310-8db8b2a2892b": { officialName: "Schloss Sargans", aliases: ["Sargans, Schloss"] }
};
const knownFolderMatches = {
  "4710_Klus-Balsthal": "13134d6c-2875-52a2-b53a-49033f8ad7e1",
  "8200_Schaffhausen": "37355b0e-15d9-5a8c-98ae-c4b2c86e7898",
  "4143_Dornach": "81c5b63b-887c-5530-9be9-c6b1fb93848a",
  "4603_Olten": "c02e2da9-3dea-5082-89ff-95c2fdeec9d9",
  "2017_Boudry": "e7c2bdb7-f304-5bb0-9eb4-42e200fa01a5",
  "TL0029_Schloss_Sasso_Corbaro": "c6d3d621-e916-5ba1-8b9d-d3014c0a66e8",
  "TL0033_Schloss_Sargans": "ea88647b-eb07-5fde-b310-8db8b2a2892b"
};
const verifiedFolderMatches = {
  "1222_VÃ©senaz": { canonicalId: "60e7f1d5-6471-5ff2-a7e9-e31dee2c704a", duplicateCanonicalIds: ["4160c25f-1f94-5425-aab1-d217fa7ce4bd"], sourceQuality: "official_authority", sourceUrl: "https://www.ge.ch/document/arrondissements-etat-civil-du-canton-geneve-communes-rattachees" },
  "1233_Bernex": { canonicalId: "41d9ba1b-0913-5ed3-b591-0089366ab220", duplicateCanonicalIds: ["009d6565-5b76-5e3c-9686-d12ce19484a7"], sourceQuality: "official_authority", sourceUrl: "https://www.ge.ch/document/arrondissements-etat-civil-du-canton-geneve-communes-rattachees" },
  "1227_Carouge": { canonicalId: "f3e894d9-7209-59b8-baf6-86854fade269", duplicateCanonicalIds: ["6f56b27b-c8ce-560d-a51b-2ca7cf06d59b"], sourceQuality: "official_authority", sourceUrl: "https://www.ge.ch/document/arrondissements-etat-civil-du-canton-geneve-communes-rattachees" },
  "1217_Meyrin": { canonicalId: "1f3cc4bf-0519-5107-a1ce-16a35fe1498d", duplicateCanonicalIds: ["21679e0e-b334-5b1d-baed-d854274a6e4e"], sourceQuality: "official_authority", sourceUrl: "https://www.ge.ch/document/arrondissements-etat-civil-du-canton-geneve-communes-rattachees" },
  "1212_Grand-Lancy_1": { canonicalId: "5f2ae8a9-5cfa-5e38-a391-9b5fa9420132", duplicateCanonicalIds: ["46f3b13a-8dba-5016-af70-0b2f5f740a00"], sourceQuality: "official_authority", sourceUrl: "https://www.ge.ch/document/arrondissements-etat-civil-du-canton-geneve-communes-rattachees" },
  "1224_ChÃªne-Bougeries": { canonicalId: "2bdcec7e-41c3-5970-ac16-9f3aa10fae79", duplicateCanonicalIds: ["b4244918-e347-5e3b-9621-307dd8420906"], sourceQuality: "official_authority", sourceUrl: "https://www.ge.ch/document/arrondissements-etat-civil-du-canton-geneve-communes-rattachees" },
  "1225_ChÃªne-Bourg": { canonicalId: "739194e7-8982-5815-85b2-2d7cc22fc667", duplicateCanonicalIds: ["66f1e848-47b6-5476-b2a4-6250756b3a89"], sourceQuality: "official_authority", sourceUrl: "https://www.ge.ch/document/arrondissements-etat-civil-du-canton-geneve-communes-rattachees" },
  "1211_GenÃ¨ve_6": { canonicalId: "60fb2f9e-f10a-50c1-bf96-e00206d3683e", duplicateCanonicalIds: ["d35f7e7c-ee73-5534-b15a-47ed1590844a"], sourceQuality: "official_authority", sourceUrl: "https://www.ge.ch/document/arrondissements-etat-civil-du-canton-geneve-communes-rattachees" },
  "1292_ChambÃ©sy": { canonicalId: "ac207857-5a05-52c4-b10a-918deb24fe1e", duplicateCanonicalIds: ["bb46004d-1a2e-5e5a-b84b-9c5a7edea1ac"], sourceQuality: "official_authority", sourceUrl: "https://www.ge.ch/document/arrondissements-etat-civil-du-canton-geneve-communes-rattachees" },
  "TL0023_Schloss_Spiez": { canonicalId: "f8ae6f21-ebe4-5a76-bf1e-ce643c3ff755", sourceQuality: "official_authority", sourceUrl: "https://www.zivilstand.sid.be.ch/de/start/heirat/trauungslokale-gaeste.html" },
  "TL0031_Schloss_Habsburg": { canonicalId: "cbaf0a1f-875a-5a8e-9c8a-80e9e7023d7e", sourceQuality: "municipality", sourceUrl: "https://www.brugg.ch/politik-und-verwaltung/dienstleistungen.html/205/l/de/service/399" },
  "TL0032_Schlossberg_Thun": { canonicalId: "da067a71-7a88-57e9-8d51-e98d7904c299", sourceQuality: "official_authority", sourceUrl: "https://www.zivilstand.sid.be.ch/de/start/heirat/externe-trauungslokale/schlossberg-thun.html" },
  "TL0040_Villa_Ciani": { canonicalId: "5e2de59f-7a00-550d-ad82-e8e9be617b93", sourceQuality: "municipality", sourceUrl: "https://www.lugano.ch/vivere-lugano/eventi/attivita-congressuale.html" },
  "TL0041_Hotel_Sonne": { canonicalId: "c93231c4-41db-5e39-8899-014b01da1201", sourceQuality: "municipality", sourceUrl: "https://www.kuesnacht.ch/gemeinde/verwaltung/abteilungen/zentrale-dienste/zivilstandsamt.page/914" },
  "TL0042_Hotel_Blausee": { canonicalId: "8d12e60e-efe9-582e-9dd9-70310cabac95", sourceQuality: "official_authority", sourceUrl: "https://www.zivilstand.sid.be.ch/de/start/heirat/externe-trauungslokale/hotel-blausee.html" },
  "TL0024_Schloss_Laufen_am_Rheinfall": { canonicalId: "8ebae545-eed4-5093-93a5-9a0a8d1aafc0", duplicateCanonicalIds: ["f346ad4f-c79a-5d8f-a022-4a3354d20743"], entityVerified: false, ceremonyStatusVerified: false, sourceQuality: "manual", sourceUrl: null },
  "TL0034_Schloss_Aigle": { canonicalId: "ed5f604c-4808-5229-ac5e-c5c38f385405", duplicateCanonicalIds: ["63687ff3-e088-5ba9-a680-d0563c8e5fa8"], sourceQuality: "official_authority", sourceUrl: "https://www.vd.ch/population/etat-civil/mariage/salles-des-mariages/est-vaudois/aigle" },
  "TL0036_Schloss_Andelfingen": { canonicalId: "3c2e5efb-9e26-5347-ad93-2ed83c63dd07", duplicateCanonicalIds: ["bba88098-7234-5090-9119-3c5fe9cdb1d6"], entityVerified: true, ceremonyStatusVerified: true, sourceQuality: "official_authority", sourceUrl: "https://www.zivba.ch/heirat/schloss-andelfingen.html/36" },
  "TL0037_Musikinsel_Rheinau": { canonicalId: "afcb0f27-9481-5dd3-ac3b-124915ed9d19", duplicateCanonicalIds: ["efef3993-cac9-5c52-88b5-4391e81203b4"], entityVerified: false, ceremonyStatusVerified: false, sourceQuality: "manual", sourceUrl: null }
};
const verifiedUnmatchedFolders = {
  "6210_Sursee": { reason: "verified_entity_missing_from_canonical", sourceUrl: "https://daten.geo.lu.ch/produkt/grzzivsk_ds_v1", sourceQuality: "official_authority" },
  "6011_Kriens": { reason: "verified_entity_missing_from_canonical", sourceUrl: "https://daten.geo.lu.ch/produkt/grzzivsk_ds_v1", sourceQuality: "official_authority" },
  "6130_Willisau": { reason: "verified_entity_missing_from_canonical", sourceUrl: "https://daten.geo.lu.ch/produkt/grzzivsk_ds_v1", sourceQuality: "official_authority" },
  "6280_Hochdorf": { reason: "verified_entity_missing_from_canonical", sourceUrl: "https://daten.geo.lu.ch/produkt/grzzivsk_ds_v1", sourceQuality: "official_authority" },
  "6110_Wolhusen": { reason: "verified_entity_missing_from_canonical", sourceUrl: "https://daten.geo.lu.ch/produkt/grzzivsk_ds_v1", sourceQuality: "official_authority" },
  "6031_Ebikon": { reason: "verified_entity_missing_from_canonical", sourceUrl: "https://daten.geo.lu.ch/produkt/grzzivsk_ds_v1", sourceQuality: "official_authority" },
  "6048_Horw": { reason: "verified_entity_missing_from_canonical", sourceUrl: "https://daten.geo.lu.ch/produkt/grzzivsk_ds_v1", sourceQuality: "official_authority" },
  "6204_Sempach": { reason: "verified_entity_missing_from_canonical", sourceUrl: "https://daten.geo.lu.ch/produkt/grzzivsk_ds_v1", sourceQuality: "official_authority" },
  "6020_EmmenbrÃ¼cke": { reason: "verified_entity_missing_from_canonical", sourceUrl: "https://daten.geo.lu.ch/produkt/grzzivsk_ds_v1", sourceQuality: "official_authority" },
  "6002_Luzern": { reason: "verified_entity_missing_from_canonical", sourceUrl: "https://daten.geo.lu.ch/produkt/grzzivsk_ds_v1", sourceQuality: "official_authority" },
  "5643_Sins": { reason: "verified_entity_missing_from_canonical", sourceUrl: "https://www.ag.ch/de/themen/soziales-gesellschaft/persoenliches-zivilstandswesen/regionale-zivilstandsaemter/sins", sourceQuality: "official_authority" },
  "TL0038_Autohalle_Andelfingen": { reason: "no_matching_canonical_venue", sourceUrl: null, sourceQuality: "unknown" }
};
const multiEntityFolderMatches = {
  "TL0026_Schloss_Greifensee": { canonicalIds: ["861b4599-ef98-54b9-b3d3-e1ec5fdbb613", "39d37718-e2dd-536f-b656-45e667246e3b"], sourceQuality: "municipality", sourceUrl: "https://www.volketswil.ch/verwaltung/abteilungen/praesidiales/traulokale-im-zivilstandskreis-volketswil.html/166" }
};
const indexByFolderReference = (values) => new Map(Object.entries(values)
  .map(([key, value]) => [key.match(/^(?:TL\d+|\d{4})/i)?.[0], value])
  .filter(([key]) => key));
const verifiedFolderMatchesByReference = indexByFolderReference(verifiedFolderMatches);
const verifiedUnmatchedFoldersByReference = indexByFolderReference(verifiedUnmatchedFolders);
const multiEntityFolderMatchesByReference = indexByFolderReference(multiEntityFolderMatches);
const rejectedFolderMatches = {
  "TL0028_Schloss_Au": { canonicalId: "12d6651f-442f-52d8-807d-ca67f00c69f1", reason: "wrong_location_au_sg_instead_of_waedenswil", sourceQuality: "municipality", sourceUrl: "https://www.waedenswil.ch/_docn/5443759/Entlassung_des_Traulokals_Schloss_Au_und_%C3%84nderung_des_Traulokals_in_der_Gemeinde_Richterswil.pdf" }
};

const normalize = (value = "") => String(value).normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function extractArray(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) throw new Error(`Could not parse ${label}`);
  return JSON.parse(match[1]);
}

function parseCsv(source) {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const headers = (lines.shift() || "").split(";").map((value) => value.trim());
  return lines.map((line) => Object.fromEntries(line.split(";").map((value, index) => [headers[index], value.trim()])));
}

function parseFields(source = "") {
  const result = {};
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*([^:#]{2,80})\s*:\s*(.+?)\s*$/);
    if (match) result[normalize(match[1]).replace(/ /g, "_")] = match[2];
  }
  return result;
}

function walk(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(folder, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function rightsStatus(source) {
  if (!source.trim()) return "UNKNOWN";
  const text = normalize(source);
  if (/nicht erlaubt|keine erlaubnis|abgelehnt|rejected/.test(text)) return "REJECTED";
  const explicitGrant = /(?:nutzung erlaubt|permission|genehmigt)[^\r\n:]*:[^\S\r\n]*(?:ja|yes|oui|si)\b/i.test(source);
  const datedEvidence = /(?:freigabe erhalten am|nachweis)[^\r\n:]*:[^\S\r\n]*\S+/i.test(source);
  const proseGrant = /\b(?:durfen|darf|genehmigt|autorise|consentito)\b.{0,80}\b(?:bilder|fotos|images|photo|verwenden|utiliser|utilizzo)\b/.test(text);
  const granted = explicitGrant || datedEvidence || proseGrant;
  const conditions = /copyright|credit|quelle|source|fotograf|photograph|nennung|erwahnung|mention/.test(text);
  return granted ? (conditions ? "GRANTED_WITH_CONDITIONS" : "GRANTED") : "REVIEW_REQUIRED";
}

function tokenScore(left, right) {
  const ignored = new Set(["schloss", "chateau", "hotel", "villa", "standesamt", "zivilstandsamt"]);
  const tokens = (value) => normalize(value).split(" ").filter((token) => token.length > 1 && !ignored.has(token));
  const a = new Set(tokens(left));
  const b = new Set(tokens(right));
  if (!a.size || !b.size) return 0;
  return [...a].filter((token) => b.has(token)).length / Math.max(a.size, b.size);
}

function matchEntity(name, locality, postalCode, entities, knownCanonicalId) {
  if (knownCanonicalId) {
    const known = entities.find((item) => item.canonicalId === knownCanonicalId);
    if (known) return { status: "MATCHED", confidence: "HIGH", score: 1, scoreMargin: 1, canonicalId: known.canonicalId, candidates: [known.canonicalId], matchReasons: ["known_canonical_mapping"], ambiguous: false };
  }
  const ranked = entities.map((item) => {
    const names = [item.officialName, item.name, ...item.aliases].filter(Boolean);
    const exactName = names.some((candidate) => normalize(candidate) === normalize(name));
    const similarity = Math.max(...names.map((candidate) => tokenScore(name, candidate)), 0);
    const postalMatch = Boolean(postalCode && item.postalCode === postalCode);
    const localityMatch = Boolean(locality && normalize(item.locality) === normalize(locality));
    const matchReasons = [];
    if (exactName) matchReasons.push("exact_name_or_alias");
    else if (similarity > 0) matchReasons.push("fuzzy_name");
    if (postalMatch) matchReasons.push("postal_code_match");
    if (localityMatch) matchReasons.push("locality_match");
    const score = Math.min(1,
      (exactName ? matchingRules.exactName : similarity * matchingRules.fuzzyName) +
      (postalMatch ? matchingRules.postalCode : 0) +
      (localityMatch ? matchingRules.locality : 0));
    return { item, score, matchReasons };
  }).filter((row) => row.score > 0).sort((a, b) => b.score - a.score);
  const top = ranked[0];
  if (!top) return { status: "UNMATCHED", confidence: "LOW", score: 0, scoreMargin: 0, canonicalId: null, candidates: [], matchReasons: [], ambiguous: false };
  const scoreMargin = top.score - (ranked[1]?.score || 0);
  const ambiguous = Boolean(ranked[1] && scoreMargin < matchingRules.margin);
  const confidence = top.score >= matchingRules.high ? "HIGH" : top.score >= matchingRules.medium ? "MEDIUM" : "LOW";
  const status = ambiguous ? "AMBIGUOUS" : confidence === "HIGH" ? "MATCHED" : confidence === "MEDIUM" ? "PROBABLE" : "UNMATCHED";
  return {
    status, confidence, score: Number(top.score.toFixed(4)), scoreMargin: Number(scoreMargin.toFixed(4)),
    canonicalId: status === "MATCHED" ? top.item.canonicalId : null,
    candidates: ranked.slice(0, 8).map((row) => row.item.canonicalId),
    matchReasons: top.matchReasons, ambiguous
  };
}

if (!fs.existsSync(root)) throw new Error(`Media root not found: ${root}`);
const officeSource = fs.readFileSync(path.resolve("lib/registry-data.ts"), "utf8");
const venueSource = fs.readFileSync(path.resolve("lib/ceremony-venues.ts"), "utf8");
const offices = extractArray(officeSource, /export const swissRegistryOffices = ([\s\S]*?) satisfies SwissRegistryOffice\[\];/, "offices")
  .filter((item) => item.canonicalId).map((item) => {
    const correction = canonicalCorrections[item.canonicalId] || {};
    return { canonicalId: item.canonicalId, name: item.name, officialName: correction.officialName || item.name, aliases: [...new Set([...(correction.aliases || []), ...(correction.officialName && correction.officialName !== item.name ? [item.name] : [])])], locality: item.city, postalCode: item.postalCode };
  });
const venues = extractArray(venueSource, /export const ceremonyVenues: CeremonyVenue\[\] = ([\s\S]*?);\s*$/, "venues")
  .filter((item) => item.canonicalId).map((item) => {
    const correction = canonicalCorrections[item.canonicalId] || {};
    return { canonicalId: item.canonicalId, name: item.traulokal_name, officialName: correction.officialName || item.traulokal_name, aliases: [...new Set([...(correction.aliases || []), ...(correction.officialName && correction.officialName !== item.traulokal_name ? [item.traulokal_name] : [])])], locality: item.ort, postalCode: item.postalCode || null };
  });
const mappingFile = path.join(root, "_mapping.csv");
const mapping = fs.existsSync(mappingFile) ? parseCsv(fs.readFileSync(mappingFile, "utf8")) : [];
const mappingByFolder = new Map(mapping.map((row) => [row.Ordner, row]));
let evidence = evidencePath && fs.existsSync(path.resolve(evidencePath)) ? JSON.parse(fs.readFileSync(path.resolve(evidencePath), "utf8")) : {};
const previousAuditPath = path.join(reportDir, "media-inventory-audit.json");
if (!Object.keys(evidence).length && fs.existsSync(previousAuditPath)) {
  const previous = JSON.parse(fs.readFileSync(previousAuditPath, "utf8"));
  evidence = Object.fromEntries((previous.records || []).filter((record) => record.gmailEvidence?.communicationFound)
    .map((record) => [record.folderName, { permissionStatus: record.permissionStatus, deliveryAvailable: record.gmailEvidence.deliveryAvailable, usableAttachmentCount: record.gmailEvidence.usableAttachmentCount, note: record.gmailEvidence.note, attribution: record.attribution, source: record.source, evidenceSummary: record.permissionEvidence }]));
}

const sourceFolders = [];
for (const entry of fs.readdirSync(root, { withFileTypes: true }).filter((item) => item.isDirectory())) {
  if (normalize(entry.name) === "traulokale") {
    sourceFolders.push(...fs.readdirSync(path.join(root, entry.name), { withFileTypes: true })
      .filter((item) => item.isDirectory()).map((item) => ({ name: item.name, relative: path.join(entry.name, item.name), type: "VENUE" })));
  } else sourceFolders.push({ name: entry.name, relative: entry.name, type: mappingByFolder.has(entry.name) ? "OFFICE" : "LEGACY" });
}

const records = sourceFolders.map((folder) => {
  const absolute = path.join(root, folder.relative);
  const files = walk(absolute);
  const rightsFile = files.find((file) => path.basename(file).toLowerCase() === "rechte.txt");
  const infoFile = files.find((file) => path.basename(file).toLowerCase() === "ordner_info.txt");
  const rightsText = rightsFile ? fs.readFileSync(rightsFile, "utf8") : "";
  const rights = parseFields(rightsText);
  const info = parseFields(infoFile ? fs.readFileSync(infoFile, "utf8") : "");
  const mapped = mappingByFolder.get(folder.name);
  const cleanedName = folder.name.replace(/^TL\d+[_\s-]*/i, "").replace(/^\d{4}_/, "");
  const entityName = mapped?.Name || info.name || info.bezeichnung || cleanedName;
  const locality = mapped?.Ort || info.ort || cleanedName;
  const entityType = folder.type === "VENUE" ? "VENUE" : "OFFICE";
  const folderReference = folder.name.match(/^(?:TL\d+|\d{4})/i)?.[0];
  const verifiedMatch = verifiedFolderMatches[folder.name] || verifiedFolderMatchesByReference.get(folderReference);
  const rejectedMatch = rejectedFolderMatches[folder.name];
  const verifiedUnmatched = verifiedUnmatchedFolders[folder.name] || verifiedUnmatchedFoldersByReference.get(folderReference);
  const multiEntityMatch = multiEntityFolderMatches[folder.name] || multiEntityFolderMatchesByReference.get(folderReference);
  const match = rejectedMatch
    ? { status: "UNMATCHED", confidence: "LOW", score: 0, scoreMargin: 0, canonicalId: null, candidates: [], matchReasons: ["rejected_wrong_location"], ambiguous: false }
    : multiEntityMatch
      ? { status: "MULTI_ENTITY", confidence: "HIGH", score: 1, scoreMargin: 1, canonicalId: null, candidates: multiEntityMatch.canonicalIds, matchReasons: ["official_multiple_canonical_entities"], ambiguous: false }
      : verifiedUnmatched
        ? { status: "UNMATCHED", confidence: "LOW", score: 0, scoreMargin: 0, canonicalId: null, candidates: [], matchReasons: [verifiedUnmatched.reason], ambiguous: false }
    : matchEntity(entityName, locality, mapped?.PLZ || null, entityType === "VENUE" ? venues : offices, verifiedMatch?.canonicalId || knownFolderMatches[folder.name]);
  const gmail = evidence[folder.name] || evidence[entityName] || Object.entries(evidence)
    .find(([key]) => normalize(key) === normalize(folder.name) || normalize(key) === normalize(entityName))?.[1] || null;
  const images = files.filter((file) => imageExtensions.has(path.extname(file).toLowerCase())).map((file) => {
    const stat = fs.statSync(file);
    const sha256 = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    return {
      photoId: `sha256:${sha256}`, sha256, driveFileId: null, filename: path.basename(file),
      relativePath: path.relative(root, file), sourceFolder: folder.name,
      extension: path.extname(file).toLowerCase(), sizeBytes: stat.size, modifiedAt: stat.mtime.toISOString(),
      folderContextEntityId: match.canonicalId, probableEntityId: null,
      photoMatchConfidence: 0, photoVerified: false, subjectType: "unknown", quality: null,
      duplicateStatus: "unknown", publicationStatus: "needs_review", requiresManualReview: true
    };
  });
  const permissionStatus = gmail?.permissionStatus || rightsStatus(rightsText);
  const dryRunAction = match.status === "AMBIGUOUS" ? "REVIEW_ENTITY_MATCH"
    : match.status === "MULTI_ENTITY" ? "REVIEW_PHOTO_ENTITY_SPLIT"
    : match.status === "UNMATCHED" ? "REVIEW_OR_CREATE_ENTITY"
    : images.length === 0 && gmail?.deliveryAvailable ? "PROPOSE_GMAIL_IMPORT"
    : images.length === 0 ? "NO_MEDIA_FOUND"
    : ["GRANTED", "GRANTED_WITH_CONDITIONS"].includes(permissionStatus) ? "PROPOSE_MEDIA_IMPORT" : "REVIEW_MEDIA_RIGHTS";
  return {
    driveFolderId: null, folderPath: folder.relative, folderName: folder.name, folderType: folder.type, entityType,
    canonicalEntityType: entityType === "VENUE" ? "ceremony_venue" : "civil_registry_office",
    legacyReference: folder.name.match(/^TL\d+/i)?.[0] || mapped?.Ordner || null,
    entityName, locality, postalCode: mapped?.PLZ || null, canonicalId: match.canonicalId,
    matchStatus: match.status, matchConfidence: match.confidence, matchScore: match.score,
    candidateCanonicalIds: match.candidates,
    duplicateCandidateCanonicalIds: verifiedMatch?.duplicateCanonicalIds || [],
    rejectedCandidateCanonicalIds: rejectedMatch ? [rejectedMatch.canonicalId] : [],
    rejectionReason: rejectedMatch?.reason || null,
    resolutionReason: verifiedUnmatched?.reason || (multiEntityMatch ? "multiple_valid_canonical_entities" : null),
    folderMatch: {
      entityId: match.canonicalId, confidence: match.score, confidenceLevel: match.confidence,
      scoreMargin: match.scoreMargin, matchReasons: verifiedMatch ? [...match.matchReasons, "official_source_verification"] : match.matchReasons, ambiguous: match.ambiguous,
      verified: verifiedMatch ? verifiedMatch.entityVerified !== false : Boolean(verifiedUnmatched || multiEntityMatch),
      entityVerified: verifiedMatch ? verifiedMatch.entityVerified !== false : Boolean(verifiedUnmatched || multiEntityMatch),
      ceremonyStatusVerified: entityType === "VENUE" ? (verifiedMatch ? verifiedMatch.ceremonyStatusVerified !== false : Boolean(multiEntityMatch)) : null,
      sourceQuality: verifiedMatch?.sourceQuality || rejectedMatch?.sourceQuality || verifiedUnmatched?.sourceQuality || multiEntityMatch?.sourceQuality || (knownFolderMatches[folder.name] ? "manual" : "unknown"),
      sourceId: null, sourceUrl: verifiedMatch?.sourceUrl || rejectedMatch?.sourceUrl || verifiedUnmatched?.sourceUrl || multiEntityMatch?.sourceUrl || null,
      verifiedAt: (verifiedMatch || verifiedUnmatched || multiEntityMatch) ? new Date().toISOString() : null,
      verifiedBy: (verifiedMatch || verifiedUnmatched || multiEntityMatch) ? "official_web_research" : null,
      requiresManualReview: match.status !== "MATCHED"
    },
    rightsFilePresent: Boolean(rightsFile), folderInfoPresent: Boolean(infoFile), permissionStatus,
    permissionSource: gmail ? "GMAIL_AND_LOCAL_AUDIT" : rightsFile ? "LOCAL_RIGHTS_FILE" : "NONE",
    license: rights.lizenz || rights.license || null,
    attribution: rights.bildnachweis || rights.credit || rights.copyright || gmail?.attribution || null,
    source: rights.quelle || rights.source || gmail?.source || null,
    permissionEvidence: gmail?.evidenceSummary || (rightsFile ? path.relative(root, rightsFile) : null),
    gmailEvidence: gmail ? { communicationFound: true, usableAttachmentCount: gmail.usableAttachmentCount || 0, deliveryAvailable: Boolean(gmail.deliveryAvailable), note: gmail.note || null } : { communicationFound: false },
    imageCount: images.length, images, duplicateCandidate: match.status === "AMBIGUOUS", dryRunAction, publicApprovalProposed: false
  };
});

const imageHashCounts = new Map();
for (const record of records) for (const image of record.images) imageHashCounts.set(image.sha256, (imageHashCounts.get(image.sha256) || 0) + 1);
for (const record of records) for (const image of record.images) {
  image.duplicateStatus = imageHashCounts.get(image.sha256) > 1 ? "exact_duplicate" : "unique";
  image.duplicateGroupSize = imageHashCounts.get(image.sha256);
}
const reviewQueue = records.flatMap((record) => {
  const folderReview = record.folderMatch.requiresManualReview || record.folderMatch.ambiguous
    ? [{ source: record.folderPath, level: "folder", suggestedEntityId: record.folderMatch.entityId, alternativeEntityIds: record.candidateCanonicalIds, confidence: record.folderMatch.confidence, matchReasons: record.folderMatch.matchReasons, reviewReason: record.folderMatch.ambiguous ? "ambiguous_entity_candidates" : record.matchStatus === "UNMATCHED" ? "entity_not_found" : "confidence_below_high", recommendedAction: "review_folder_entity_match" }]
    : [];
  const photoReviews = record.images.map((image) => ({ source: image.relativePath, level: "photo", suggestedEntityId: record.folderMatch.entityId, alternativeEntityIds: record.candidateCanonicalIds, confidence: image.photoMatchConfidence, matchReasons: ["folder_match_is_context_only"], reviewReason: image.duplicateStatus === "exact_duplicate" ? "exact_duplicate_and_unverified_subject" : "photo_subject_unverified", recommendedAction: "classify_and_verify_photo" }));
  return [...folderReview, ...photoReviews];
});

const counts = (key) => Object.fromEntries([...new Set(records.map((row) => row[key]))].map((value) => [value, records.filter((row) => row[key] === value).length]));
const summary = {
  auditedAt: new Date().toISOString(), mode: "DRY_RUN_READ_ONLY", mediaRoot: root, driveRootId,
  sourceFolderCount: records.length, mappingRowCount: mapping.length, totalFileCount: walk(root).length,
  imageCount: records.reduce((sum, row) => sum + row.imageCount, 0), foldersByType: counts("folderType"),
  matches: counts("matchStatus"), rights: counts("permissionStatus"), proposedActions: counts("dryRunAction")
};
const report = {
  summary, safety: { databaseWrites: 0, driveMutations: 0, gmailMutations: 0, publicApprovals: 0 }, records, reviewQueue,
  matchingRules, supportedValues,
  limitations: ["Drive IDs are UNKNOWN without a future Drive API inventory.", "Gmail evidence is optional structured input; messages and attachments are never changed or downloaded.", "Fuzzy matches are suggestions only and never assign canonicalId.", "safe-media.ts remains authoritative: only imageStatus=approved is public."]
};
fs.mkdirSync(reportDir, { recursive: true });
if (!approveHigh) fs.writeFileSync(path.join(reportDir, "media-inventory-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
const table = records.map((row) => `| ${row.folderPath.replace(/\|/g, "\\|")} | ${row.entityType} | ${row.imageCount} | ${row.matchStatus} | ${row.permissionStatus} | ${row.dryRunAction} |`).join("\n");
fs.writeFileSync(path.join(reportDir, "media-inventory-audit.md"), `# Media inventory audit\n\nGenerated: ${summary.auditedAt}\n\nMode: **read-only dry run**. No database, Drive, Gmail, approval or website mutation was performed.\n\n## Summary\n\n- Entity folders: ${summary.sourceFolderCount}\n- Images: ${summary.imageCount}\n- Canonical matches: ${summary.matches.MATCHED || 0}\n- Ambiguous: ${summary.matches.AMBIGUOUS || 0}\n- Unmatched: ${summary.matches.UNMATCHED || 0}\n\n## Inventory\n\n| Folder | Entity | Images | Match | Rights | Proposed dry-run action |\n|---|---:|---:|---|---|---|\n${table}\n\n## Safety\n\n- Public approvals: **0**.\n- Ambiguous/fuzzy matches require review.\n- The JSON report contains image-level metadata and candidate canonical IDs.\n`);

const aliases = {
  "3653_Oberhofen am Thunersee": { entityType: "VENUE", canonicalName: "Schloss Oberhofen", basis: "MANUAL_FOLDER_TYPE_AND_NAME_ALIAS" }
};
const crosswalk = records.map((record) => {
  const alias = aliases[record.folderName];
  const proposedEntityType = alias?.entityType || record.entityType;
  const pool = proposedEntityType === "OFFICE" ? offices : venues;
  const candidates = pool.filter((item) => record.candidateCanonicalIds.includes(item.canonicalId));
  const locationMatches = pool.filter((item) =>
    (record.postalCode && item.postalCode === record.postalCode) ||
    (record.locality && normalize(item.locality) === normalize(record.locality))
  );
  let selected = null;
  let decision = "REVIEW_REQUIRED";
  let confidence = "NONE";
  let basis = "NO_CANONICAL_CANDIDATE";

  if (record.resolutionReason === "multiple_valid_canonical_entities") {
    decision = "MULTI_ENTITY_REVIEW";
    confidence = "HIGH";
    basis = "MULTIPLE_VALID_CANONICAL_ENTITIES";
  } else if (record.resolutionReason === "verified_entity_missing_from_canonical") {
    decision = "NEW_ENTITY_REVIEW";
    confidence = "HIGH";
    basis = "VERIFIED_ENTITY_MISSING_FROM_CANONICAL";
  } else if (record.resolutionReason === "no_matching_canonical_venue") {
    decision = "NEW_ENTITY_REVIEW";
    basis = "NO_MATCHING_CANONICAL_VENUE";
  } else if (record.rejectedCandidateCanonicalIds.length) {
    basis = "REJECTED_WRONG_LOCATION";
  } else if (record.matchStatus === "MATCHED" && record.canonicalId) {
    selected = pool.find((item) => item.canonicalId === record.canonicalId) || null;
    decision = "CONFIRMED_EXISTING";
    confidence = "HIGH";
    basis = "EXISTING_EXACT_MATCH";
  } else if (alias) {
    const matches = pool.filter((item) => normalize(item.name) === normalize(alias.canonicalName));
    if (matches.length === 1) {
      [selected] = matches;
      decision = "PROPOSED_MATCH";
      confidence = "HIGH";
      basis = alias.basis;
    } else basis = "MANUAL_ALIAS_NOT_UNIQUE";
  } else {
    const narrowed = candidates.filter((item) => locationMatches.some((match) => match.canonicalId === item.canonicalId));
    if (narrowed.length === 1) {
      [selected] = narrowed;
      decision = "PROPOSED_MATCH";
      confidence = "HIGH";
      basis = "CANDIDATE_PLUS_POSTAL_OR_LOCALITY";
    } else if (candidates.length === 1) {
      [selected] = candidates;
      decision = "PROPOSED_MATCH";
      confidence = "MEDIUM";
      basis = "SINGLE_NAME_CANDIDATE";
    } else if (locationMatches.length === 1) {
      [selected] = locationMatches;
      decision = "PROPOSED_MATCH";
      confidence = "HIGH";
      basis = "UNIQUE_POSTAL_OR_LOCALITY_MATCH";
    } else if (record.folderName === "Neuer Ordner") {
      decision = "IGNORE_REVIEW";
      basis = "NON_ENTITY_FOLDER_NAME";
    } else if (candidates.length > 1 || locationMatches.length > 1) {
      basis = "DUPLICATE_CANONICAL_CANDIDATES";
    } else if (proposedEntityType === "VENUE") {
      decision = "NEW_ENTITY_REVIEW";
      basis = "NO_EXISTING_CANONICAL_VENUE";
    } else {
      decision = "LEGACY_ENTITY_RESEARCH";
      basis = "HISTORICAL_OFFICE_NOT_FOUND";
    }
  }

  return {
    sourceFolder: record.folderName,
    originalEntityType: record.entityType,
    proposedEntityType,
    originalMatchStatus: record.matchStatus,
    proposedCanonicalId: selected?.canonicalId || null,
    proposedCanonicalName: selected?.officialName || null,
    aliases: selected?.aliases || [],
    entityMatchConfidence: selected ? (alias ? 1 : record.folderMatch.confidence) : 0,
    entityVerified: record.folderMatch.entityVerified,
    ceremonyStatusVerified: proposedEntityType === "VENUE" ? record.folderMatch.ceremonyStatusVerified : null,
    sourceQuality: record.folderMatch.sourceQuality,
    legacyReference: record.legacyReference,
    decision,
    confidence,
    basis,
    candidateCanonicalIds: [...new Set([...record.candidateCanonicalIds, ...locationMatches.map((item) => item.canonicalId)])],
    duplicateCandidateCanonicalIds: record.duplicateCandidateCanonicalIds,
    rejectedCandidateCanonicalIds: record.rejectedCandidateCanonicalIds,
    rejectionReason: record.rejectionReason,
    manualApprovalRequired: decision !== "CONFIRMED_EXISTING"
  };
});
const crosswalkCounts = Object.fromEntries([...new Set(crosswalk.map((row) => row.decision))]
  .map((value) => [value, crosswalk.filter((row) => row.decision === value).length]));
const crosswalkReport = {
  generatedAt: new Date().toISOString(),
  mode: "DRY_RUN_PROPOSAL_ONLY",
  summary: { total: crosswalk.length, decisions: crosswalkCounts, databaseWrites: 0, approvedAmbiguousRecords: 0 },
  records: crosswalk
};
if (!approveHigh) fs.writeFileSync(path.join(reportDir, "media-canonical-crosswalk.json"), `${JSON.stringify(crosswalkReport, null, 2)}\n`);
if (approveHigh) {
  const approvedMatches = crosswalk
    .filter((row) => row.originalMatchStatus === "MATCHED" && row.confidence === "HIGH" && row.decision === "CONFIRMED_EXISTING")
    .map((row) => ({
      sourceFolder: row.sourceFolder,
      canonicalId: row.proposedCanonicalId,
      canonicalName: row.proposedCanonicalName,
      decision: "APPROVED_ENTITY_MATCH",
      basis: row.basis
    }));
  const decisions = {
    generatedAt: new Date().toISOString(),
    mode: "LOCAL_ENTITY_MATCH_DECISIONS",
    scope: "EXACT_HIGH_MATCHES_ONLY",
    summary: {
      approved: approvedMatches.length,
      databaseWrites: 0,
      mediaApprovals: 0,
      websiteChanges: 0,
      ambiguousApprovals: 0
    },
    records: approvedMatches
  };
  fs.writeFileSync(path.join(reportDir, "media-canonical-match-decisions.json"), `${JSON.stringify(decisions, null, 2)}\n`);
}
const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const csvHeader = ["source_folder", "original_entity_type", "proposed_entity_type", "original_match_status", "proposed_canonical_id", "proposed_canonical_name", "decision", "confidence", "basis", "manual_approval_required"];
const csvRows = crosswalk.map((row) => [row.sourceFolder, row.originalEntityType, row.proposedEntityType, row.originalMatchStatus, row.proposedCanonicalId, row.proposedCanonicalName, row.decision, row.confidence, row.basis, row.manualApprovalRequired].map(csvCell).join(","));
if (!approveHigh) fs.writeFileSync(path.join(reportDir, "media-canonical-crosswalk.csv"), `${csvHeader.map(csvCell).join(",")}\n${csvRows.join("\n")}\n`);
const crosswalkTable = crosswalk.filter((row) => row.decision !== "CONFIRMED_EXISTING")
  .map((row) => `| ${row.sourceFolder.replace(/\|/g, "\\|")} | ${row.proposedEntityType} | ${row.decision} | ${row.proposedCanonicalName || "-"} | ${row.confidence} | ${row.basis} |`).join("\n");
fs.writeFileSync(path.join(reportDir, "media-canonical-crosswalk.md"), `# Media canonical crosswalk\n\nMode: **proposal-only dry run**. No database record or canonical ID was changed.\n\n## Summary\n\n${Object.entries(crosswalkCounts).map(([key, value]) => `- ${key}: ${value}`).join("\n")}\n\nAll rows other than existing exact matches require explicit approval before import.\n\n| Source folder | Proposed type | Decision | Proposed canonical entity | Confidence | Basis |\n|---|---|---|---|---|---|\n${crosswalkTable}\n`);
console.log(JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ crosswalk: crosswalkReport.summary }, null, 2));
