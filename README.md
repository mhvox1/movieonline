## Verwaltung starten (Ein-Klick)

Wenn du die Verwaltung nutzen willst, ohne manuell das Backend zu starten:

1. Datei `Start-Verwaltung.cmd` im Projektordner per Doppelklick starten.
2. Das Skript startet automatisch das Backend (`node server/index.js`).
3. Danach wird `http://localhost:8787/Verwaltung.html` automatisch im Browser geoeffnet.

Hinweis:
- Das direkte Oeffnen von `dist/Verwaltung.html` als `file://` kann das Backend nicht selbst starten (Browser-Sicherheitsbeschraenkung).

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/99599a1e-a371-45f7-9f9e-3b8f92727895

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Online Core Prototype (V1 Foundation)

The project now includes a first server-authoritative online core in `server/`.

### What is included

1. Time authority rule: 1 real UTC day = 1 in-game month
2. Deterministic RNG utility for reproducible simulation steps
3. Catch-up simulation scaffold for offline progression
4. Server-side monthly economy baseline:
   - Installment payouts from active distribution deals
   - Employee and CEO salary booking
   - Loan installment booking with remaining debt update
   - Monthly transaction aggregation into monthlyHistory
5. Server-side monthly project progression baseline:
   - Active planning completion / contract timeout handling
   - Active project phase transitions
   - PostProduction completion to Completed with deterministic quality
6. HTTP endpoints:
   - `GET /health`
   - `GET /server-time`
   - `POST /simulate-catchup`
   - `GET /studios`
   - `GET /studios/:id`
   - `POST /studios/:id/bootstrap`
   - `POST /studios/:id/sync`
   - `POST /studios/:id/releases/schedule`
   - `POST /world/tick`
   - `POST /world/market-tick`
   - `GET /world/state`
    - `GET /world/charts/latest`
    - `GET /world/charts/history?limit=12`
   - `GET /world/leaderboard?mode=lifetime|monthly-revenue|prestige&monthKey=YYYY-MM`
   - `GET /world/release-board?year=2008&month=4`
   - `GET /world/deals?studioId=<id>&status=all|active|ended`
   - `GET /world/release-calendar?year=2008&month=4`
   - `GET /studios/:id/release-plan?year=2008&month=4`
   - `GET /market/talents`
   - `POST /market/talents/list`
   - `POST /market/talents/buy`

### Run the online core

1. Start server:
   `npm run server`
2. Quick time-model check:
   `npm run server:time`

Default port is `8787` (override with `PORT`).

### World tick processing

To advance all studios in one server-side run:

1. CLI:
   `npm run server:tick`
2. API:
   `POST /world/tick`

Market-only tick and world snapshot:

- `POST /world/market-tick`
- `GET /world/state`

Integration test for world market logic:

`npm run server:test:world-market`

Integration test for release scheduling and chart endpoints:

`npm run server:test:release-charts`

Integration test for release slots, distribution phases, and leaderboard modes:

`npm run server:test:slots-phases`

Release slot limit configuration:

- `WORLD_RELEASE_SLOT_LIMIT` (optional), default: `8`

Release scheduling payload options:

- `priorityTier`: `low | normal | high | blockbuster`
- `strategy`: `balanced | aggressive | awards | niche`

### Persistent studio flow (prototype)

1. Create studio:
   `POST /studios/:id/bootstrap`
2. Sync studio after offline time:
   `POST /studios/:id/sync`
3. Read studio state:
   `GET /studios/:id`

Studios are persisted to `server/data/studios.json` for local development.

### Browser client online sync (shadow mode)

The React client now auto-connects to the online core when a game is loaded:

1. Bootstraps studio once (`POST /studios/:id/bootstrap`)
2. Triggers periodic sync every 60 seconds (`POST /studios/:id/sync`)
3. Shows status panel in-game (top-right) with connection and server month info

Configuration:

- `VITE_ONLINE_CORE_URL` (optional), default: `http://localhost:8787`

Example (`.env.local`):

`VITE_ONLINE_CORE_URL=http://localhost:8787`
