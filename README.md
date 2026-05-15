# hochzeitstandesamt.ch

MVP für eine Schweizer Plattform zum Finden von Zivilstandsämtern und zuständigen Zivilstandskreisen.

## Was enthalten ist

- Startseite mit Suche nach Kanton, Gemeinde, Postleitzahl und Zivilstandskreis
- Interaktive Schweizkarte nach Kantonen
- Suchseite `/standesamt-finden`
- Detailseiten für alle importierten Zivilstandskreise unter `/zivilstandsamt/[slug]`
- Gemeinde-Landingpages unter `/standesamt/[slug]`
- Kantonsseiten unter `/kanton/[slug]`
- Ratgeber, Kontakt, Datenschutz und Impressum
- Prisma-Datenmodell für spätere Datenbank, Leads, Admin und Inhalte
- Sitemap und robots.txt

## Datenimport

Die Excel-Liste wurde aus `zivilstandskreise (1).xls` importiert. Daraus wurden erzeugt:

- 128 Zivilstandskreise
- 2'830 Gemeinde-Zuordnungen

Die generierte Datenquelle liegt in `lib/registry-data.ts`.

## Lokal starten

Sobald ein Paketmanager verfügbar ist:

```bash
npm install
npm run dev
```

Danach im Browser öffnen:

```text
http://localhost:3000
```

## Datenbank später aktivieren

Die Prisma-Struktur liegt in `prisma/schema.prisma`. Für den produktiven Betrieb `DATABASE_URL` setzen und Migrationen ausführen.
