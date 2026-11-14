# Schweizweite Kalender-Discovery: Ausgangslage (11.11.2026)

**Status:** Inventar, noch keine Verifikation der Kalender-Endpoints. Dies ist **keine** Liste bestätigter Verfügbarkeiten.

- Erfasste Ämter: **143** in **26 Kantonen**.
- Erfasste Amt-Websites: **143**.
- Unterschiedliche Hostnames: **106**. Gleiche Hostnames bedeuten nicht automatisch gleiche Buchungssysteme.
- Bestätigte Kalender-Endpoints durch diese Discovery: **0**; **143** weiterhin `unverified`.

## Häufige Website-Hosts als Prüfpriorität

| Host | Anzahl erfasste Ämter |
|---|---:|
| www.zivilstand.sid.be.ch | 7 |
| www.fr.ch | 7 |
| www.ag.ch | 6 |
| www.vs.ch | 6 |
| so.ch | 4 |
| www4.ti.ch | 4 |
| www.chene-bougeries.ch | 2 |
| www.cologny.ch | 2 |
| www.pregny-chambesy.ch | 2 |
| www.bernex.ch | 2 |
| www.chene-bourg.ch | 2 |
| www.lancy.ch | 2 |
| www.carouge.ch | 2 |
| www.geneve.ch | 2 |
| zivilstandsamt.tg.ch | 2 |

## Prüfregeln

1. Je Host prüfen, ob mehrere Ämter dieselbe technische Kalenderlösung verwenden. Nicht aus der Domain ableiten.
2. Offizielle Quelle und konkrete Kalender-URL mit Datum und Prüfnachweis dokumentieren.
3. Trautage ohne bestätigte freie Slots immer als `unknown` behandeln.
4. Bei fehlendem Kalender-Endpoint `unverified` belassen und nach offiziellen Datenfeeds fragen.
5. Keine neuen Connectoren automatisch aktivieren.

Quelle: `data/availability/ch-offices-discovery.json` (Snapshot aus `web_public_offices`).
