const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PAPERS_DIR = path.join(ROOT, 'PastPapers');
const OUTPUT = path.join(ROOT, 'papers-data.js');
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

function scanPapers() {
  const subjects = fs.readdirSync(PAPERS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const data = subjects.map((subject) => {
    const subjectPath = path.join(PAPERS_DIR, subject);
    const files = fs.readdirSync(subjectPath)
      .filter(isPdf)
      .map((fileName) => {
        const title = titleFromFilename(fileName);
        const year = yearFromTitle(title);
        return {
          title,
          year,
          file: path.join('PastPapers', subject, fileName).replace(/\\/g, '/'),
        };
      })
      .sort((a, b) => {
        if (a.year && b.year && a.year !== b.year) {
          return Number(b.year) - Number(a.year);
        }
        return a.title.localeCompare(b.title);
      });

    return {
      subject,
      papers: files,
    };
  });

  return data;
}

function writePapersData() {
  const payload = {
    generatedAt: new Date().toISOString(),
    subjects: scanPapers(),
  };

  const output = `window.PAPERS_DATA = ${JSON.stringify(payload, null, 2)};\n`;
  fs.writeFileSync(OUTPUT, output, 'utf8');
  console.log(`[papers] Updated ${OUTPUT}`);
}

function startWatch() {
  let timer = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      writePapersData();
    }, WATCH_DELAY_MS);
  };

  if (process.platform === 'darwin' || process.platform === 'win32') {
    fs.watch(PAPERS_DIR, { recursive: true }, schedule);
    console.log('[papers] Watching PastPapers for changes...');
    return;
  }

  const watchers = new Map();
  const addWatcher = (dirPath) => {
    if (watchers.has(dirPath)) return;
    const watcher = fs.watch(dirPath, schedule);
    watchers.set(dirPath, watcher);
  };

  const refreshWatchers = () => {
    const entries = fs.readdirSync(PAPERS_DIR, { withFileTypes: true });
    const subjectDirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(PAPERS_DIR, entry.name));

    addWatcher(PAPERS_DIR);
    subjectDirs.forEach(addWatcher);
  };

  refreshWatchers();
  fs.watch(PAPERS_DIR, refreshWatchers);
  console.log('[papers] Watching PastPapers for changes...');
}

if (require.main === module) {
  const watch = process.argv.includes('--watch');
  writePapersData();
  if (watch) {
    startWatch();
  }
}

module.exports = {
  writePapersData,
  startWatch,
};
