import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";

const root = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const dataSource = fs.readFileSync(path.join(root, "lib", "registry-data.ts"), "utf8");

function extractExport(name) {
  const start = dataSource.indexOf(`export const ${name} = `);
  if (start === -1) return [];
  const jsonStart = dataSource.indexOf("[", start);
  const marker = name === "registryCantons" ? " satisfies RegistryCanton[]" : " satisfies SwissRegistryOffice[]";
  const jsonEnd = dataSource.indexOf(marker, jsonStart);
  return JSON.parse(dataSource.slice(jsonStart, jsonEnd));
}

const registryCantons = extractExport("registryCantons");
const swissRegistryOffices = extractExport("swissRegistryOffices");

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function search(params) {
  const canton = normalize(params.get("canton"));
  const query = normalize(params.get("query"));
  return swissRegistryOffices.filter((office) => {
    const haystack = normalize([
      office.name,
      office.canton,
      office.cantonName,
      office.city,
      office.postalCode,
      office.addressLine1,
      office.phone,
      office.email,
      ...office.responsibleMunicipalities
    ].join(" "));
    const matchesCanton = !canton || normalize(office.canton) === canton || normalize(office.cantonName) === canton;
    const matchesQuery = !query || haystack.includes(query);
    return matchesCanton && matchesQuery;
  });
}

function layout(title, body) {
  return `<!doctype html>
<html lang="de-CH">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)} | hochzeitstandesamt.ch</title>
  <style>
    :root{--paper:#fbf7f1;--linen:#f3eadf;--ink:#24211f;--soft:#5f5751;--gold:#c5a45d;--rose:#d9a6a0}
    *{box-sizing:border-box} body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif}
    a{color:inherit;text-decoration:none}.wrap{max-width:1180px;margin:0 auto;padding:0 22px}.header{position:sticky;top:0;background:rgba(251,247,241,.94);backdrop-filter:blur(12px);border-bottom:1px solid rgba(36,33,31,.1);z-index:10}.nav{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:18px 0}.brand{font-weight:750;font-size:20px}.links{display:flex;gap:22px;color:var(--soft);font-size:14px}.btn{display:inline-flex;border-radius:8px;padding:12px 18px;background:var(--ink);color:white;font-weight:700;border:0;cursor:pointer}.btn.secondary{background:white;color:var(--ink);border:1px solid rgba(36,33,31,.14)}.btn.gold{background:var(--gold);color:var(--ink)}
    .hero{padding:76px 0 48px}.grid{display:grid;gap:24px}.hero-grid{grid-template-columns:1.05fr .95fr;align-items:end}.eyebrow{color:var(--gold);font-weight:750;text-transform:uppercase;letter-spacing:.08em;font-size:13px}.h1{font-size:54px;line-height:1.03;margin:14px 0 0;max-width:780px}.lead{font-size:19px;line-height:1.7;color:var(--soft);max-width:680px}.card{background:white;border:1px solid rgba(36,33,31,.1);border-radius:10px;padding:22px;box-shadow:0 18px 60px rgba(36,33,31,.08)}.search{display:grid;gap:12px}.search label{display:grid;gap:8px;font-size:14px;font-weight:700}.search input,.search select{border:1px solid rgba(36,33,31,.16);border-radius:8px;padding:13px;font:inherit;background:white}.section{padding:44px 0}.section.alt{background:white}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.office h2{margin:6px 0 0;font-size:21px}.muted{color:var(--soft);line-height:1.65}.pill{display:inline-flex;background:var(--linen);border-radius:999px;padding:6px 10px;font-size:12px;color:var(--soft);font-weight:700}.map{position:relative;aspect-ratio:16/10;background:var(--linen);border-radius:10px;overflow:hidden;margin-top:22px}.map svg{position:absolute;inset:0;width:100%;height:100%}.dot{position:absolute;transform:translate(-50%,-50%);width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:white;font-size:11px;font-weight:800;border:1px solid white;box-shadow:0 10px 30px rgba(36,33,31,.15)}.dot:hover{background:var(--gold);color:var(--ink);transform:translate(-50%,-50%) scale(1.12)}.chips{display:flex;flex-wrap:wrap;gap:8px}.footer{background:var(--ink);color:white;margin-top:60px;padding:36px 0}.footer p{color:rgba(255,255,255,.72)}
    @media(max-width:800px){.hero-grid,.cards{grid-template-columns:1fr}.h1{font-size:38px}.links{display:none}}
  </style>
</head>
<body>
  <header class="header"><div class="wrap nav"><a class="brand" href="/">hochzeitstandesamt.ch</a><nav class="links"><a href="/standesamt-finden">Standesamt finden</a><a href="/ratgeber">Ratgeber</a><a href="/kontakt">Kontakt</a></nav><a class="btn" href="/standesamt-finden">Suchen</a></div></header>
  ${body}
  <footer class="footer"><div class="wrap"><strong>hochzeitstandesamt.ch</strong><p>Orientierung für die standesamtliche Hochzeit in der Schweiz. Verbindliche Auskünfte erhältst du direkt beim zuständigen Zivilstandsamt.</p></div></footer>
</body>
</html>`;
}

function searchForm(params = new URLSearchParams()) {
  return `<form class="card search" action="/standesamt-finden">
    <label>Kanton<select name="canton"><option value="">Alle Kantone</option>${registryCantons.map((c) => `<option value="${esc(c.code)}"${params.get("canton") === c.code ? " selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label>
    <label>Gemeinde, Ort oder PLZ<input name="query" value="${esc(params.get("query") ?? "")}" placeholder="z.B. Winterthur, Aarau, 8400" /></label>
    <button class="btn gold">Standesamt finden</button>
  </form>`;
}

function mapSection() {
  return `<section class="section"><div class="wrap"><div class="card"><div class="eyebrow">Interaktive Schweizkarte</div><h2>Nach Kanton auswählen</h2><p class="muted">Klicke auf einen Kanton und öffne direkt die passenden Zivilstandsämter.</p><div class="map">
    <svg viewBox="0 0 100 100"><path d="M10 66 L18 52 L25 49 L31 35 L43 25 L58 27 L68 18 L80 25 L91 42 L88 57 L96 67 L84 82 L66 89 L51 82 L38 87 L26 76 Z" fill="#f8efe3" stroke="#c5a45d" stroke-width="1.2"/><path d="M31 35 L47 55 L43 25 M58 27 L57 48 L80 25 M26 76 L47 55 L66 89 M47 55 L88 57" stroke="#d9cbb8" stroke-width=".6"/></svg>
    ${registryCantons.map((c) => `<a class="dot" href="/standesamt-finden?canton=${esc(c.code)}" style="left:${c.map[0]}%;top:${c.map[1]}%" title="${esc(c.name)}">${esc(c.code)}</a>`).join("")}
  </div></div></div></section>`;
}

function officeCard(office) {
  return `<article class="card office"><span class="pill">${esc(office.cantonName)} · ${esc(office.canton)}</span><h2>${esc(office.name)}</h2><p class="muted"><strong>Adresse:</strong> ${esc(office.addressLine1 || office.postBox)}, ${esc(office.postalCode)} ${esc(office.city)}<br><strong>Kontakt:</strong> ${esc(office.phone || "Telefon nicht in der Liste")} ${office.email ? `· ${esc(office.email)}` : ""}<br><strong>Gemeinden:</strong> ${esc(office.responsibleMunicipalities.slice(0, 8).join(", "))}</p><p><a class="btn" href="/zivilstandsamt/${esc(office.slug)}">Details ansehen</a></p></article>`;
}

function home() {
  return layout("Standesamt finden und Hochzeit richtig planen", `<main><section class="hero"><div class="wrap hero-grid grid"><div><div class="eyebrow">Schweizer Zivilstandsämter</div><h1 class="h1">Standesamt finden und Hochzeit in der Schweiz richtig planen</h1><p class="lead">Finde das passende Zivilstandsamt über Kanton, Gemeinde oder Postleitzahl und starte deine standesamtliche Hochzeit mit klaren nächsten Schritten.</p><p><a class="btn" href="/standesamt-finden">Standesamt suchen</a> <a class="btn secondary" href="#ablauf">Ablauf ansehen</a></p></div>${searchForm()}</div></section>${mapSection()}<section class="section alt" id="ablauf"><div class="wrap cards">${["Zuständigkeit klären","Unterlagen vorbereiten","Termin vereinbaren"].map((t,i)=>`<article class="card"><div class="eyebrow">0${i+1}</div><h2>${t}</h2><p class="muted">${i===0?"Suche deine Gemeinde oder deinen Kanton und finde den zuständigen Zivilstandskreis.":i===1?"Prüfe frühzeitig, welche Dokumente für eure persönliche Situation nötig sind.":"Nach der Ehevorbereitung könnt ihr den Trautermin direkt mit dem Amt koordinieren."}</p></article>`).join("")}</div></section><section class="section"><div class="wrap"><div class="eyebrow">Datenbasis</div><h2>Alle Kantone und Zivilstandskreise</h2><p class="muted">${swissRegistryOffices.length} Zivilstandskreise · ${registryCantons.reduce((sum,c)=>sum+c.municipalityCount,0)} Gemeinde-Zuordnungen</p><div class="cards">${swissRegistryOffices.slice(0,4).map(officeCard).join("")}</div></div></section></main>`);
}

function searchPage(url) {
  const results = search(url.searchParams);
  return layout("Zivilstandsamt finden", `<main class="section"><div class="wrap grid"><div><div class="eyebrow">Suche</div><h1 class="h1">Zivilstandsamt finden</h1><p class="lead">Suche nach Kanton, Gemeinde, Ort, Postleitzahl oder Name des Zivilstandskreises.</p></div>${searchForm(url.searchParams)}${mapSection()}<h2>${results.length} Treffer</h2><div class="cards">${results.map(officeCard).join("") || '<p class="muted">Keine Treffer gefunden.</p>'}</div></div></main>`);
}

function detail(slug) {
  const office = swissRegistryOffices.find((item) => item.slug === slug);
  if (!office) return null;
  return layout(office.name, `<main class="section"><div class="wrap grid"><div><div class="eyebrow">${esc(office.cantonName)} · ${esc(office.canton)}</div><h1 class="h1">${esc(office.name)}</h1><p class="lead">Zuständiger Zivilstandskreis für Gemeinden in ${esc(office.cantonName)}.</p></div><article class="card"><h2>Kontakt</h2><p class="muted"><strong>Adresse:</strong> ${esc(office.addressLine1 || office.postBox)}, ${esc(office.postalCode)} ${esc(office.city)}<br><strong>Postfach:</strong> ${esc(office.postBox || "-")}<br><strong>Telefon:</strong> ${esc(office.phone || "-")}<br><strong>E-Mail:</strong> ${esc(office.email || "-")}</p>${office.email ? `<p><a class="btn" href="mailto:${esc(office.email)}">E-Mail an Zivilstandsamt</a></p>` : ""}</article><article class="card"><h2>Zuständige Gemeinden</h2><div class="chips">${office.responsibleMunicipalities.map((m) => `<span class="pill">${esc(m)}</span>`).join("")}</div></article><article class="card"><h2>Nächste Schritte</h2><p class="muted">Kontaktiere das Amt, bestätige die Zuständigkeit und frage die persönliche Dokumentenliste an. Die Informationen dienen der Orientierung; verbindlich ist immer das zuständige Zivilstandsamt.</p></article></div></main>`);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost:3000");
  let html;
  if (url.pathname === "/") html = home();
  else if (url.pathname === "/standesamt-finden") html = searchPage(url);
  else if (url.pathname.startsWith("/zivilstandsamt/")) html = detail(decodeURIComponent(url.pathname.split("/").pop()));
  else html = layout("Seite", `<main class="section"><div class="wrap"><h1>Vorschau</h1><p class="muted">Diese lokale Sofortvorschau zeigt Startseite, Suche, Karte und Detailseiten. Die vollständige Next.js-App liegt im Projektordner bereit.</p><p><a class="btn" href="/">Zur Startseite</a></p></div></main>`);
  res.writeHead(html ? 200 : 404, { "content-type": "text/html; charset=utf-8" });
  res.end(html ?? "Nicht gefunden");
});

server.listen(3000, () => {
  console.log("Preview running at http://localhost:3000");
});
