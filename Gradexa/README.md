# EmberTrack

EmberTrack is a student dashboard for tracking marks, study sessions,
and tasks in one calm workspace. This version is fully offline using browser
local storage.

## Features
- Offline-first storage (no server, no login)
- Marks log with edit and quick totals
- Study planner with target vs actual minutes
- Task manager with priority filters
- Weekly summary + streak indicator
- Daily focus target tracking
- Subject averages with progress bars
- Focus timer + quick notes panel
- Goals tracker with progress toggles
- Data export/import + CSV export + reset tools

## Tech Stack
- HTML + JavaScript + Tailwind (compiled to a static CSS file)
- No framework, no bundler
- Node static server for local use
- Typography: Space Grotesk + Fraunces

## Local Setup (Offline)

### Option A: Run with Node (recommended)
```bash
npm start
```

Open `http://localhost:8080`.

### Option B: Open the file directly
Open `index.html` in your browser. (Some browsers restrict local storage on file URLs,
so Option A is more reliable.)

## Tailwind CSS (optional rebuild)
If you change the HTML and want to rebuild the Tailwind CSS file:
```bash
npm install
npm run build:css
```

This regenerates `styles.css`.

## Notes
- All data is stored in your browser's local storage under the key
  `embertrack-data-v1` (auto-migrated from `gradexa-data-v1`).
- Use the Settings page to export/import data or reset everything.
- The app opens directly to the dashboard (no landing, no auth).
- Local storage auto-initializes with default subjects: Combined maths, Physics, Chemistry.

## Scripts
- `npm start` - run the local Node server on `http://localhost:8080`
- `npm run build:css` - rebuild `styles.css` from Tailwind sources
