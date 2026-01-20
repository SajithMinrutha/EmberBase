const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TUTES_DIR = path.join(ROOT, 'Tutes');
const OUTPUT = path.join(ROOT, 'tutes-data.js');
const TYPES = ['Theory', 'Revision'];
const WATCH_DELAY_MS = 250;

function isPdf(fileName) {
  return path.extname(fileName).toLowerCase() === '.pdf';
}

function titleFromFilename(fileName) {
  return path.basename(fileName, path.extname(fileName));
}

function yearFromTitle(title) {
  const match = title.match(/(19|20)\d{2}/);
  return match ? match[0] : '';
}

function scanTutes() {
  if (!fs.existsSync(TUTES_DIR)) {
    fs.mkdirSync(TUTES_DIR, { recursive: true });
  }
  const subjects = fs
    .readdirSync(TUTES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return subjects.map((subject) => {
    const subjectPath = path.join(TUTES_DIR, subject);
    const result = {
      subject,
      theory: [],
      revision: [],
    };

    TYPES.forEach((type) => {
      const folderPath = path.join(subjectPath, type);
      if (!fs.existsSync(folderPath)) return;

      const files = fs
        .readdirSync(folderPath)
        .filter(isPdf)
        .map((fileName) => {
          const title = titleFromFilename(fileName);
          const year = yearFromTitle(title);
          return {
            title,
            year,
            file: path
              .join('Tutes', subject, type, fileName)
              .replace(/\\/g, '/'),
          };
        })
        .sort((a, b) => {
          if (a.year && b.year && a.year !== b.year) {
            return Number(b.year) - Number(a.year);
          }
          return a.title.localeCompare(b.title);
        });

      const key = type.toLowerCase();
      result[key] = files;
    });

    return result;
  });
}

function writeTutesData() {
  const payload = {
    generatedAt: new Date().toISOString(),
    subjects: scanTutes(),
  };

  const output = `window.TUTES_DATA = ${JSON.stringify(payload, null, 2)};\n`;
  fs.writeFileSync(OUTPUT, output, 'utf8');
  console.log(`[tutes] Updated ${OUTPUT}`);
}

function startWatch() {
  let timer = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      writeTutesData();
    }, WATCH_DELAY_MS);
  };

  if (process.platform === 'darwin' || process.platform === 'win32') {
    fs.watch(TUTES_DIR, { recursive: true }, schedule);
    console.log('[tutes] Watching Tutes for changes...');
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
    const subjectEntries = fs
      .readdirSync(TUTES_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    const directories = new Set([TUTES_DIR]);
    subjectEntries.forEach((subject) => {
      const subjectPath = path.join(TUTES_DIR, subject);
      directories.add(subjectPath);
      TYPES.forEach((type) => {
        const typePath = path.join(subjectPath, type);
        if (fs.existsSync(typePath)) {
          directories.add(typePath);
        }
      });
    });

    for (const [dirPath, watcher] of watchers) {
      if (!directories.has(dirPath)) {
        watcher.close();
        watchers.delete(dirPath);
      }
    }

    directories.forEach(addWatcher);
  };

  refreshWatchers();
  fs.watch(TUTES_DIR, refreshWatchers);
  console.log('[tutes] Watching Tutes for changes...');
}

if (require.main === module) {
  const watch = process.argv.includes('--watch');
  writeTutesData();
  if (watch) {
    startWatch();
  }
}

module.exports = {
  writeTutesData,
  startWatch,
};
