# Steam Changelog – 10.03.2026

## Highlights
- Exklusivvertraege wurden funktional erweitert und stabilisiert.
- Mehrere UI-/Flow-Probleme in Casting und Privatleben wurden behoben.
- Die Zeitungsoption arbeitet jetzt strikt wie erwartet.

## Neu / Verbessert
- Exklusivvertraege koennen jetzt aktiv gekuendigt werden:
  - Neuer Button im Talentprofil: `Exklusivvertrag kuendigen`.
  - Sicherheitsabfrage mit konkreten Kosten vor Bestaetigung.
  - Abfindung liegt zwischen 50% und 70% der verbleibenden Vertragssumme.
- Exklusivvertraege laufen jetzt automatisch am Ablaufdatum aus.
  - Beim Vertragsende wird der Exklusivstatus sauber entfernt.
  - Zusaetzlich wird eine Nachricht im Posteingang erstellt.

## Bugfixes – Nachrichten / Zeitung
- Fix: Wenn `Woechentliche Zeitung anzeigen` deaktiviert ist, erscheint keine Zeitung mehr.
- Gilt jetzt konsistent auch fuer historische Ereignisse und Todesmeldungen.

## Bugfixes – Casting
- Fix: Blackscreen beim Ueberspringen des Castings unter bestimmten Teil-Auswahlen behoben.
- `Casting ueberspringen` ist jetzt gesperrt, solange nicht mindestens
  - 1 Regisseur und
  - 1 Schauspieler
  ausgewaehlt wurden.
- Klarer Hinweistext wurde im UI ergaenzt.

## Bugfixes – Privatleben
- Fix: Partner-Interaktionen im Testmodus funktionierten nicht korrekt.
- Interaktionslogik wurde robuster gemacht.
- Wochenregel wurde wieder strikt eingestellt:
  - Es ist weiterhin genau 1 Partner-Interaktion pro 7 Tage moeglich.

## Balancing / Verhalten
- Vorzeitige Kuendigung von Exklusivvertraegen verschlechtert Loyalitaet und Moral des betroffenen Talents.
- Kuendigungszahlungen werden korrekt im Transaktionslog unter `Exklusivvertraege` verbucht.

## Technischer Hinweis
- Die geaenderten Dateien wurden auf TypeScript-/Editor-Fehler geprueft; es wurden keine Fehler gemeldet.
