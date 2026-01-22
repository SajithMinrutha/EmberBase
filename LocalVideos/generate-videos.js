const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const VIDEOS_DIR = path.join(ROOT, 'Videos');
const OUTPUT = path.join(ROOT, 'videos-data.js');
const WATCH_DELAY_MS = 250;
const VIDEO_EXTS = new Set(['.mp4', '.m4v', '.webm', '.mov', '.mkv']);

function isVideo(fileName) {
  return VIDEO_EXTS.has(path.extname(fileName).toLowerCase());
}

function titleFromFilename(fileName) {
  return path.basename(fileName, path.extname(fileName));
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readVideos(dirPath, baseLabelParts) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter(isVideo)
    .map((fileName) => ({
      title: titleFromFilename(fileName),
      ext: path.extname(fileName).slice(1).toUpperCase(),
      file: path.join(...baseLabelParts, fileName).replace(/\\/g, '/'),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

function scanVideoDir() {
  ensureDir(VIDEOS_DIR);

  const subjects = fs
    .readdirSync(VIDEOS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return subjects.map((subject) => {
    const subjectPath = path.join(VIDEOS_DIR, subject);
    const unitEntries = fs
      .readdirSync(subjectPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    const units = unitEntries.map((unit) => {
      const unitPath = path.join(subjectPath, unit);
      return {
        unit,
        videos: readVideos(unitPath, ['Videos', subject, unit]),
      };
    });

    const subjectVideos = readVideos(subjectPath, ['Videos', subject]);
    if (subjectVideos.length) {
      units.unshift({
        unit: 'General',
        videos: subjectVideos,
      });
    }

    return {
      subject,
      units,
    };
  });
}

function writeVideosData() {
  const payload = {
    generatedAt: new Date().toISOString(),
    subjects: scanVideoDir(),
  };

  const output = `window.VIDEOS_DATA = ${JSON.stringify(payload, null, 2)};\n`;
  fs.writeFileSync(OUTPUT, output, 'utf8');
  console.log(`[videos] Updated ${OUTPUT}`);
}

function startWatch() {
  let timer = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      writeVideosData();
    }, WATCH_DELAY_MS);
  };

  if (process.platform === 'darwin' || process.platform === 'win32') {
    fs.watch(VIDEOS_DIR, { recursive: true }, schedule);
    console.log('[videos] Watching Videos for changes...');
    return;
  }

  const watchers = new Map();
  const addWatcher = (dirPath) => {
    if (watchers.has(dirPath)) return;
    try {
      const watcher = fs.watch(dirPath, schedule);
      watchers.set(dirPath, watcher);
    } catch {
      // Ignore directories that disappear before watching.
    }
  };

  const refreshWatchers = () => {
    const directories = new Set([VIDEOS_DIR]);
    if (fs.existsSync(VIDEOS_DIR)) {
      const subjectEntries = fs
        .readdirSync(VIDEOS_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      subjectEntries.forEach((subject) => {
        const subjectPath = path.join(VIDEOS_DIR, subject);
        directories.add(subjectPath);
        const unitEntries = fs
          .readdirSync(subjectPath, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name);
        unitEntries.forEach((unit) => {
          directories.add(path.join(subjectPath, unit));
        });
      });
    }

    for (const [dirPath, watcher] of watchers) {
      if (!directories.has(dirPath)) {
        watcher.close();
        watchers.delete(dirPath);
      }
    }

    directories.forEach(addWatcher);
  };

  refreshWatchers();
  fs.watch(VIDEOS_DIR, refreshWatchers);
  console.log('[videos] Watching Videos for changes...');
}

if (require.main === module) {
  const watch = process.argv.includes('--watch');
  writeVideosData();
  if (watch) {
    startWatch();
  }
}

module.exports = {
  writeVideosData,
  startWatch,
};
