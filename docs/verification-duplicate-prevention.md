# Verify-Daten: Schutz vor doppelten Trauorten

## Problem

Ein Zivilstandsamt kann durch mehrfach vorhandene Einträge in `web_public_venue_office_assignments` denselben Trauort mehrfach an den Verify-Snapshot liefern. Ursache ist die Vervielfachung im Join, nicht der öffentliche Verify-Link.

## Verbindliche Regel

`buildOfficeSnapshot` muss Trauorte vor der Ausgabe nach ihrer stabilen Venue-ID deduplizieren. Die Deduplizierung darf keine UUIDs ändern, keine Inhalte überschreiben und keine anderen Felder oder Prüflinks verändern.

## Implementierung

Die Snapshot-Abfrage verwendet `jsonb_agg(DISTINCT jsonb_build_object(...))`. Damit wird jeder Venue-Datensatz pro Snapshot höchstens einmal ausgegeben, selbst wenn die Zuordnungstabelle doppelte Assignment-Zeilen enthält.

## Prüfung

Nach Änderungen sind zu prüfen:

1. Office-Link mit mehreren Trauorten: jeder Trauort erscheint einmal.
2. Venue-spezifischer Link: weiterhin genau ein Trauort.
3. Office- und Venue-Felder sowie bestehende Links bleiben unverändert.
4. Submit-/Proposal-Logik akzeptiert weiterhin dieselben stabilen Entity-IDs.

Die Regel ist bewusst auf die Verify-Snapshot-Ausgabe begrenzt. Sie ändert weder die öffentlichen Venue-Daten noch die Zuordnungstabelle und verhindert dadurch keine anderen, ausdrücklich gewünschten Mehrfachzuordnungen ausserhalb des Verify-Snapshots.
