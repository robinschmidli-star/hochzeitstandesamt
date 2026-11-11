Only touch the files strictly required.
Minimal invasive changes only.

# Codex – Schweizer Kalender-Discovery und schrittweiser Rollout

## Bereits erstellt
- `data/availability/ch-offices-discovery.json`: Snapshot der 143 bestehenden Zivilstandsämter aus `web_public_offices` in allen 26 Kantonen; jedes Amt hat einen offiziellen bzw. bisher erfassten Website-Link. `calendar_status=unverified` bedeutet ausdrücklich **keine** bestätigte Kalenderquelle.
- `lib/availability/sync.ts`: 60 Sekunden Toleranz bei fälligen Quellen, um das beobachtete 24-Stunden-Millisekunden-Problem zu vermeiden.

## Nächste Implementierungsschritte
1. Ergänze einen **read-only** Discovery-Prozess auf Basis des Inventars. Nutze ausschliesslich offizielle Seiten, keine Logins, CAPTCHAs, Buchungsaktionen oder personenbezogenen Daten. Prüfe robots.txt/ToS und limitiere Anfragen pro Domain.
2. Klassifiziere jede Quelle nachvollziehbar als `api`, `ics`, `booking`, `published_dates_html`, `manual`, `none` oder `unverified`. Speichere evidenzbasierte `calendar_url`, `checked_at`, `confidence`, `access_requires_login`, `provider`, `reason`. Bei Unsicherheit: `unverified`.
3. Generiere einen Bericht mit 143/143 erfassten Ämtern, Anzahl tatsächlich geprüfter Websites, bestätigten Kalenderquellen, unbestätigten Quellen, gruppierten Providersystemen und priorisierten Top-20-Integrationen. Ungeprüfte Quellen nicht als verifiziert zählen.
4. Prüfe die beiden aktiven Berner Connectoren separat anhand aktueller offizieller HTML-Seiten; schreibe Tests für Datum/Jahresüberschrift/Status. `published_wedding_day` ist **nicht** gleich `available`.
5. Teste die 60-Sekunden-Cron-Toleranz mit Grenzwerten bei 23:59:59 und 24:00:01 Stunden. Stelle sicher, dass zwei unmittelbar aufeinanderfolgende Läufe keine unnötige Synchronisation auslösen.
6. Verifiziere auf einer isolierten Neon-Preview-Datenbank den echten End-to-End-Cron-Aufruf mit geschütztem `CRON_SECRET`; keine Secrets in Logs oder Dateien. Prüfe 2 erfolgreiche Quellen, Run-Zähler, Idempotenz und Duplikate.
7. Erst nach bestandenen Tests eine kleine Gruppe bestätigter Provider-Connectoren implementieren; keine 143 individuellen Scraper. Erst danach eine Datumssuche mit getrennten Zuständen `available`, `unavailable`, `unknown` planen.
8. Bestehende Registry, SEO, Suchseiten und Favoriten nicht verändern. PR vor Merge mit tatsächlichen Testergebnissen dokumentieren.

## Release-Gates
- Discovery und Klassifikation dürfen keinen Kalender als live darstellen, solange keine überprüfbare Verfügbarkeitsinformation vorliegt.
- Kein Live-Frontend-Rollout vor End-to-End-Test und fachlicher Validierung.
- Prüfe Build, Lint, Tests, DB-Integrität und Cron-Logs; dokumentiere explizit alle offenen Punkte.
