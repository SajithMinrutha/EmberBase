# EmberBase

EmberBase is a local-first study suite that bundles four offline tools behind a
single hub:

- EmberTrack (grade tracker + study dashboard)
- EmberVault (past paper archive)
- EmberStudy (tute library for theory + revision)
- EmberStream (tuition video library)

Everything runs locally with a single command and stays on your machine. No
logins or cloud dependencies.

## Quick start

```bash
npm start
```

Open `http://localhost:5050`.

## Upload papers and tutes

EmberVault and EmberStudy include a floating **+** button that opens an upload modal.
Uploads are saved to the local library folders and indexed automatically.

## Local network access (phone/tablet)

1) Start the server: `npm start`
2) Find your computer's LAN IP:
   - macOS: `ipconfig getifaddr en0`
   - Windows: `ipconfig` (IPv4 Address)
   - Linux: `hostname -I`
3) Open on your phone: `http://<YOUR_IP>:5050`

Make sure both devices are on the same Wi-Fi and your firewall allows Node.

## Deployment (self-hosted)

1) Ensure Node.js 18+ is available.
2) Set environment variables as needed (`PORT`).
3) Run `npm start`.

The server is a single Node process serving static files plus the local upload endpoints.

## Apps and routes

- EmberBase hub: `http://localhost:5050/`
- EmberTrack: `http://localhost:5050/embertrack/`
- EmberVault: `http://localhost:5050/embervault/`
- EmberStudy: `http://localhost:5050/emberstudy/`
- EmberStream: `http://localhost:5050/emberstream/`

### Unified subject names

Subject chips and upload dropdowns inside EmberVault and EmberStudy now pull the current subject list from EmberTrack (`/api/embertrack`), so renaming or adding subjects there automatically refreshes the available filters/subjects in the other two apps.
Tip: change subjects inside EmberTrack → Settings to update the shared subject list for EmberVault/EmberStudy.

## EmberTrack (grades + planner)

Location: `Gradexa/`

Features:
- Marks log with edit + export
- Study planner with targets vs actual + trend chart
- Tasks + goals + streaks
- Subject averages and per-subject top marks
- Marks visualizer and printable report

Notes:
- Data is stored in browser local storage under `embertrack-data-v1`.
- Legacy data auto-migrates from `gradexa-data-v1`.
- When running via the EmberBase server, devices on the same network can share
  the same EmberTrack data (LAN sync).

Report export:
- In EmberTrack → Settings → Data Controls → `Generate Report` to open a modern,
  printable report (with a print/save PDF button).

LAN sync (shared data across devices)
- Run the EmberBase server (`npm start`) on your computer.
- Open EmberTrack on any device on the same Wi-Fi via `http://<YOUR_IP>:5050/embertrack/`.
- EmberTrack will auto-sync data to the server; other devices will pick it up on reload
  or when the app regains focus.

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

## EmberStream (tuition videos)

Location: `LocalVideos/`

Folder structure:

```
LocalVideos/Videos/
  Chemistry/
    Unit 01/
    Unit 02/
  Maths/
    Unit 01/
    Unit 02/
```

Add videos to the folders above. The index is generated automatically while the
server runs. You can also regenerate manually:

```bash
node LocalVideos/generate-videos.js
```

To disable auto-watch:

```bash
WATCH_VIDEOS=0 npm start
```

## Run each app individually (optional)

```bash
node Gradexa/server.js
node LocalAL/serve.js
node LocalTutes/serve.js
node LocalVideos/serve.js
```

Ports:
- EmberTrack: `8080`
- EmberVault: `5173`
- EmberStudy: `5174`
- EmberStream: `5175`

## Project scripts

- `npm start` (root): serves hub + all apps at `http://localhost:5050`

## Run on startup (optional)

### macOS (LaunchAgents)

1) Create a LaunchAgent file at `~/Library/LaunchAgents/com.emberbase.server.plist`
2) Paste the following (update the paths if your project lives elsewhere):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.emberbase.server</string>
    <key>ProgramArguments</key>
    <array>
      <string>/usr/bin/env</string>
      <string>npm</string>
      <string>start</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/minrutha/Documents/CODING2025/LearnHub</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/emberbase.out</string>
    <key>StandardErrorPath</key>
    <string>/tmp/emberbase.err</string>
  </dict>
</plist>
```

3) Load it:

```bash
launchctl load ~/Library/LaunchAgents/com.emberbase.server.plist
```

To stop it:

```bash
launchctl unload ~/Library/LaunchAgents/com.emberbase.server.plist
```

### Windows (Task Scheduler)

1) Open Task Scheduler → Create Task
2) General:
   - Name: `EmberBase`
   - Select **Run whether user is logged on or not**
3) Triggers → New:
   - Begin the task: **At startup**
4) Actions → New:
   - Program/script: `npm`
   - Add arguments: `start`
   - Start in: `C:\Users\minrutha\Documents\CODING2025\LearnHub`
5) Save and enter your Windows password when prompted.

To test, right-click the task and choose **Run**.

## Generated files

- `LocalAL/papers-data.js` and `LocalTutes/tutes-data.js` are generated.
- PDFs are local content and are intentionally not committed.
