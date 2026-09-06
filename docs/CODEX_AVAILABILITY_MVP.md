# Codex-Anweisung: Trautermin-/Availability-MVP

Only touch the files strictly required.
Minimal invasive changes only.

## Ziel

Erweitere hochzeitstandesamt.ch um eine skalierbare Availability-Infrastruktur für publizierte Trautage und freie Trautermine. Der MVP startet mit wenigen verifizierbaren Quellen, die Architektur muss aber ohne grundlegenden Umbau auf alle Schweizer Zivilstandsämter und Trauorte erweiterbar sein.

## Architektur-Leitplanken

1. Bestehenden Canonical-Core/Public-Replica-Lesepfad nicht ersetzen oder duplizieren.
2. Prisma ist nicht der Canonical Master für Ämter/Trauorte. Availability referenziert bestehende Entities über stabile `canonicalId` und/oder bestehende Website-Slugs.
3. Source-spezifische Logik bleibt ausschliesslich in Connectoren.
4. Alle externen Daten werden in ein gemeinsames internes Availability-Format normalisiert.
5. Keine personenbezogenen Daten abrufen, speichern oder verarbeiten. Keine Logins/CAPTCHAs umgehen und keine Buchungen ausführen.
6. Bevorzugte Quellenreihenfolge: offizielle API > strukturierter offizieller Endpoint > ICS > öffentliches Buchungssystem > offizielle HTML-Seite > manuelle offizielle Information.

## Datenmodell

Eine `AvailabilitySource` beschreibt eine offizielle Datenquelle für ein Amt oder einen Trauort. Sie enthält Zieltyp, canonicalId/Slug, Provider-/Connector-Typ, Source-URL, Qualität, Aktivstatus, Sync-Frequenz, letzte Prüfung, letzten erfolgreichen Sync, letzte Änderung und Fehlerstatus.

Ein `AvailabilitySlot` enthält normalisiert: Datum, optionale Start-/Endzeit, Status (`available`, `unavailable`, `unknown`), Präzision (`exact_slot`, `date_only`, `published_wedding_day`, `unknown`), Prüfzeitpunkt und eine stabile externe/fingerprint-basierte ID.

Ein `AvailabilitySyncRun` protokolliert jeden Batch-Run und seine Erfolgs-/Fehlerzahlen.

## MVP-Connectoren

Implementiere zuerst einen generischen offiziellen HTML-Connector für publizierte Trautage. Er muss Schweizer/deutsche Datumsformate erkennen und den Status `ausgebucht` als `unavailable` abbilden. Ein publizierter Trautag ohne explizite Verfügbarkeitsbestätigung darf NICHT automatisch als frei gelten; er wird `unknown` mit Präzision `published_wedding_day`.

MVP-Quellen:
- Schloss Spiez, offizielle Seite Kanton Bern
- Schloss Oberhofen, offizielle Seite Kanton Bern

Zürich, Basel-Stadt und Winterthur werden als vorbereitete Discovery-/Connector-Kandidaten dokumentiert, aber erst aktiviert, wenn ein stabiler öffentlicher Endpoint verifiziert wurde. Keine fragile Browserautomation nur für den MVP bauen.

## Daily Sync

Ein zentraler, mit `CRON_SECRET` geschützter Endpoint synchronisiert alle aktiven Sources einmal täglich. Anforderungen:
- idempotent
- Timeout pro Quelle
- Fehler einer Quelle dürfen den Batch nicht abbrechen
- begrenzte Parallelität
- alte Slots einer erfolgreich synchronisierten Quelle sauber ersetzen/upserten
- bei fehlgeschlagenem Sync keine alten Daten fälschlich als aktuell markieren
- Status/Fehler am Source-Datensatz und im SyncRun speichern

## Skalierung

Neue Ämter/Trauorte sollen später nur durch neue `AvailabilitySource`-Einträge und – falls nötig – einen zusätzlichen Connector ergänzt werden. Suche/Frontend dürfen nicht provider-spezifisch werden. Die Struktur muss mehrere hundert Sources täglich verarbeiten können.

## Frontend-Scope MVP

Noch keinen grossen Kalender und keine neue Suchlogik erzwingen. Datenpipeline zuerst stabilisieren. Bestehende Seiten dürfen nicht brechen. Spätere UI soll klar zwischen bestätigter Verfügbarkeit, publiziertem Trautag und unbekannter Verfügbarkeit unterscheiden und `lastCheckedAt` anzeigen.

## Tests/Abschluss

Prüfe mindestens Normalisierung, Status-Mapping, Duplikat-/Idempotenz-Verhalten und Fehlerisolierung. Dokumentiere, wie eine neue Source bzw. ein neuer Connector ergänzt wird. Führe Prisma-Validierung, Typecheck/Build und vorhandene Tests aus, soweit die Umgebung dies zulässt.