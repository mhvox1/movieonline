# Steam Changelog – 03.03.2026

## Highlights
- Marketing-Kampagnen für parallele Produktionen wurden grundlegend verbessert.
- Mehrere kritische Zuordnungs- und UI-Probleme wurden behoben.
- Lokalisierung und Savegame-Kompatibilität wurden weiter stabilisiert.

## Neu / Verbessert
- Produktionskampagnen laufen jetzt parallel pro Film:
  - Pro Film ist weiterhin nur 1 aktive Kampagne gleichzeitig möglich.
  - Bei mehreren parallelen Produktionen können mehrere Kampagnen parallel laufen (je Film eine).
- Kampagnen sind jetzt eindeutig an den jeweiligen Film gebunden (`projectTitle`), um Fehlzuordnungen zu verhindern.
- Filmreiter im Kampagnen-Tab bleiben bei mehreren Produktionen immer sichtbar, damit jederzeit zwischen Projekten gewechselt werden kann.

## Bugfixes – Marketing & Kampagnen
- Fix: Black-Screen/Absturz beim Öffnen von `Marketing -> Kampagne` behoben.
- Fix: Hype-Zuordnung bei parallelen Kampagnen korrigiert:
  - Jede Kampagne erhöht jetzt nur den Hype des zugehörigen Films.
  - Fehlerfall „ein Film bekommt Hype von beiden Kampagnen“ behoben.
- Fix: Kampagnen-Abschlussmeldungen zeigen jetzt das passende Filmcover in den Nachrichten (wie bei Vermarktungsangeboten).
- UI-Optimierung: Redundantes Fenster mit aktiven Kampagnen wurde entfernt, da Filmreiter als Zuordnung ausreichen.

## Bugfixes – Projekte
- Fix: Doppelte Filmtitel in der Planung werden verhindert.
  - Prüfung gegen laufende Planung, aktive Projekte und gespeicherte geplante Projekte.
  - Titel wird wieder verfügbar, sobald das entsprechende gespeicherte Projekt gelöscht wurde.
- Live-Validierung für Filmtitel in der Planung ergänzt (inkl. visuellem Hinweis).

## Bugfixes – Privatleben
- Fix: Button „Beziehung beenden“ funktionierte nicht mehr.
  - Bestätigungsdialog wurde wieder korrekt eingebunden.
  - Trennung/Scheidung wird jetzt wieder zuverlässig ausgeführt.
- Fix/Härtung: Nach Trennung werden Partner-Reste in Family-/Talent-Listen bereinigt (keine „Geisterpartner“-Einträge mehr).

## Bugfixes – Casting & Alter
- Fix: Unplausible/negative Altersanzeigen im Casting (z. B. „-8 Jahre“) behoben.
- Ursache behoben: Talent-Generierung nutzt jetzt konsistent das Ingame-Datum statt Systemdatum.
- Savegame-Härtung: Zukunfts-Geburtsdaten in bestehenden Spielständen werden beim Laden plausibel korrigiert.

## Lokalisierung
- EN/DE-Übersetzungen in Marketing- und Event-Pfaden überarbeitet.
- Zusätzliche harte Texte in der Kampagnen-UI auf Translation-Keys umgestellt.
- Veraltete/ungenutzte Translation-Keys bereinigt.

## Technischer Hinweis
- Umfangreiche Diagnostics-Checks wurden durchgeführt; in den geänderten Dateien wurden keine Fehler gefunden.
