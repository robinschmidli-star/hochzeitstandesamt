Only touch the files strictly required.
Minimal invasive changes only.

# Codex-Auftrag: Availability stabilisieren und schweizweite Discovery

## Ziel und Ist-Zustand
hochzeitstandesamt.ch besitzt bereits einen Availability-Cron (`/api/cron/availability`), Prisma-Modelle für Sources/Slots/Runs und einen HTML-Connector für Schloss Spiez/Oberhofen. Am 06.11.2026 ergab die produktive Neon-Abfrage: 0 Sources, 0 Slots, 0 Runs. Der Code `lib/availability/prisma.ts` wählt aktuell `WEB_PUBLIC_REPLICA_DATABASE_URL` oder `PUBLIC_REPLICA_DATABASE_URL`, obwohl der öffentliche Replica-Zugang als read-only gedacht ist. In Vercel existieren für Production auch `REPLICA_PUBLISH_DATABASE_URL`, `DATABASE_URL` und `CRON_SECRET`; Geheimwerte nicht ausgeben.

## Teil A – produktiven MVP nachweisbar funktionsfähig machen (vor Discovery)
1. Prüfe exakt, welche Neon-Datenbank die produktiven Availability-Tabellen enthält und welche DB-Rolle INSERT/UPDATE/DELETE auf ihnen ausführen darf. Keinen read-only Public-Replica-Zugang für Schreibvorgänge verwenden. Die Berechtigungen müssen minimal sein; keine Canonical-Core-Schreibrechte einführen.
2. Verwende für Availability einen ausdrücklich dafür freigegebenen Writer-Connection-String (z. B. `AVAILABILITY_DATABASE_URL`) und sichere die korrekte Datenbankzuordnung ab. Keine Secret-Werte in Logs, PRs oder Dokumentation.
3. Prüfe den Cron: Schedule in `vercel.json`, Produktions-Deployment, `CRON_SECRET`, 401 ohne gültige Authentifizierung, Laufzeit-Logs, Datenbankverbindung, Timeout. Bei 0 Runs ist eine erfolgreiche Ausführung **nicht** bewiesen.
4. Registriere die zwei offiziellen Berner Sources idempotent (Spiez/Oberhofen), aber überschreibe nicht manuelle Freigaben, Source-URLs oder bereits geprüfte Konfiguration. Zürich/Basel/Winterthur bleiben deaktiviert.
5. Führe den bestehenden Connector tatsächlich gegen die offiziellen Webseiten aus, nicht durch manuelles Eintragen behaupteter Termine. Prüfe Parser an realem HTML und mit Tests (Jahresüberschriften, Abschnittsgrenzen, Datum/Status, leere Antwort, falsches Jahr, mehrere Trauorte, Duplikate).
6. Bewahre alte Slots bei Fehlern; kennzeichne stale Daten. `unknown` darf niemals als `available` dargestellt werden. Keine erfolgreichen SyncRun-Zähler ohne echten erfolgreichen Abruf.
7. Erster produktiver Lauf: protokolliere Run-ID, beide Source-IDs, Anzahl Slots je Quelle, 2027-Daten, Fehler und Zeitstempel; verifiziere per read-only SQL direkt in der Ziel-DB.
8. Wiederhole den Lauf und prüfe Idempotenz sowie korrekte Change Detection. Bevorzuge Upsert/gezielte Löschung statt unnötigem `deleteMany`/Neuanlegen aller Slots, falls dies für den Nachweis nötig ist.
9. Kein Merge/Live-Rollout, wenn Produktions-DB oder Schreibberechtigung ungeklärt ist. Kein ungesicherter manueller Cron-Endpunkt.

## Teil B – schweizweite Discovery (read-only)
1. Nutze die bestehenden Canonical-/Public-Replica-Entitäten und IDs. Keine zweite Registry-Mastertabelle anlegen; alle aktuellen CH-Zivilstandsämter inventarisieren und zugeordneten Trauorten zuordnen.
2. Für jedes Amt offizielle Website/Termin-URL/Trauort-URL prüfen; auf DE/FR/IT nach Trauterminen, réservation mariage, prenotazione matrimonio, eGov, API, ICS, Kalender, Planyo etc. suchen. Automatisierte Netzabfragen rate-limitieren, Domain-Allowlist und robots/ToS respektieren.
3. Pro Amt einen reproduzierbaren Discovery-Datensatz ausgeben: canonicalId, Slug, Kanton, offizieller Link, gefundene Kalender-URL, Typ (api/ics/booking/html/manual/none/unverified), Login, öffentliche Verfügbarkeit, Evidenzlink, geprüft-am, Confidence, Risiko, Connector-Gruppe, Priorität, Begründung.
4. Unverifizierte Vermutungen als `unverified` kennzeichnen. Eine allgemeine Hochzeitsseite ist kein bestätigter Live-Kalender. Keine Fake-Endpoints und keine Termine erfinden.
5. Output: maschinenlesbare CSV/JSON und übersichtlicher Markdown-Bericht mit Abdeckungszahlen und priorisierter Top-20-Liste. Falls nur Teilabdeckung erreicht, Fortschritt und nicht geprüfte Ämter ausdrücklich zählen.
6. Keine neuen Scraper automatisch aktivieren. Cluster identischer Systeme bevorzugen; weitere Connectoren erst nach manuell geprüften Stichproben und rechtlicher/technischer Validierung.
7. Für Ämter ohne öffentliche Verfügbarkeit: Vorschlag für offiziellen ICS/CSV/API-Feed und E-Mail-Anfrage vorbereiten, aber nicht ohne Freigabe versenden.

## Abnahmekriterien
- Produktions-MVP: zwei echte erfolgreiche Source-Syncs, in Neon sichtbare Slots und Runs, 2. Lauf idempotent, Fehler-/Freshness-Verhalten geprüft.
- Discovery: alle bereits erfassten Schweizer Ämter im Inventar; pro Amt eindeutiger Status mit Quellen-Evidenz oder `unverified`.
- Tests und Build erfolgreich, Änderungen minimal-invasiv, bestehende Such-/SEO-/Trauortseiten unverändert.
- Vor Merge: PR mit Diff, Risiken, offenen Berechtigungen, Vercel/Neon-Prüfergebnissen.
