# EmberBase

EmberBase is a local-first study suite that bundles three offline tools behind a
single hub:

- EmberTrack (grade tracker + study dashboard)
- EmberVault (past paper archive)
- EmberStudy (tute library for theory + revision)

Everything runs locally with a single command and stays on your machine. No
logins or cloud dependencies.

## Quick start

```bash
npm start
```

Open `http://localhost:5050`.

## Local network access (phone/tablet)

1) Start the server: `npm start`
2) Find your computer's LAN IP:
   - macOS: `ipconfig getifaddr en0`
   - Windows: `ipconfig` (IPv4 Address)
   - Linux: `hostname -I`
3) Open on your phone: `http://<YOUR_IP>:5050`

Make sure both devices are on the same Wi-Fi and your firewall allows Node.

## Apps and routes

- EmberBase hub: `http://localhost:5050/`
- EmberTrack: `http://localhost:5050/embertrack/`
- EmberVault: `http://localhost:5050/embervault/`
- EmberStudy: `http://localhost:5050/emberstudy/`

## EmberTrack (grades + planner)

Location: `Gradexa/`

Features:
- Marks log with edit + export
- Study planner with targets vs actual
- Tasks + goals + streaks
- Subject averages and charts

Notes:
- Data is stored in browser local storage under `embertrack-data-v1`.
- Legacy data auto-migrates from `gradexa-data-v1`.

If you update styles in `Gradexa/src/index.css`, rebuild the compiled CSS:

```bash
cd Gradexa
npm run build:css
```

## EmberVault (past papers)

Location: `LocalAL/`

Folder structure:

```
LocalAL/PastPapers/
  Chemistry/
  Maths/
  Physics/
```

Add PDFs to the folders above. The index is generated automatically while the
server runs. You can also regenerate manually:

```bash
node LocalAL/generate-papers.js
```

To disable auto-watch:

```bash
WATCH_PAPERS=0 npm start
```

## EmberStudy (tute library)

Location: `LocalTutes/`

Folder structure:

```
LocalTutes/Tutes/
  Chemistry/
    Theory/
    Revision/
  Maths/
    Theory/
    Revision/
  Physics/
    Theory/
    Revision/
```

Add PDFs to the folders above. The index is generated automatically while the
server runs. You can also regenerate manually:

```bash
node LocalTutes/generate-tutes.js
```

To disable auto-watch:

```bash
WATCH_TUTES=0 npm start
```

## Run each app individually (optional)

```bash
node Gradexa/server.js
node LocalAL/serve.js
node LocalTutes/serve.js
```

Ports:
- EmberTrack: `8080`
- EmberVault: `5173`
- EmberStudy: `5174`

## Project scripts

- `npm start` (root): serves hub + all apps at `http://localhost:5050`

## Generated files

- `LocalAL/papers-data.js` and `LocalTutes/tutes-data.js` are generated.
- PDFs are local content and are intentionally not committed.
