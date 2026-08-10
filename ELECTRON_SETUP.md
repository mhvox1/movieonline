Electron Desktop Build & Run

Voraussetzungen
- Node.js (>=16) und npm installiert

Entwickler-Start (öffnet die App nach einem Produktions-Build):

```bash
npm install
npm run build    # erstellt dist/ mit Vite
npm start        # startet Electron (nutzt dist/index.html)
```

Schnellstart im Entwicklung (optional, benutzt Vite dev server):

```bash
# im Dev-Modus kannst du Electron gegen den Vite dev-server starten (nur falls du main.js anpasst)
npm install
npm run dev      # falls du ein script für dev einrichtest, sonst: run vite dev in einem Terminal
# dann in anderem Terminal: electron .
```

Erstellen von Installern (Windows/macOS/Linux):

```bash
npm run dist     # baut mit electron-builder gemäß build-Konfiguration in package.json
```

Wichtige Hinweise
- macOS: Code-Signing und Notarisierung sind erforderlich, wenn du .dmg/.pkg für Verteilung erstellst.
- Prüfe `build/icon.ico` (Windows) bzw. `build/icon.icns` (macOS) für Icons.
- `main.js` lädt `dist/index.html`; stelle sicher, dass `vite build` erfolgreich ist.
- Wenn du Hot-Reload für Electron willst, empfiehlt sich `electron-reload` oder `electronmon`.

Wenn du möchtest, kann ich nun:
- `npm install` ausführen (falls noch nicht geschehen),
- `npm run build` ausführen und prüfen, ob `dist/` erzeugt wurde, und
- optional `npm run dist` (erstellt Installer) ausführen.
