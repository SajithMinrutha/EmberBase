const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PAPERS_DIR = path.join(ROOT, 'PastPapers');
const OTHER_PAPERS_DIR = path.join(ROOT, 'OtherPapers');
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

function scanSubjectDir(baseDir, baseLabel) {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  const subjects = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return subjects.map((subject) => {
    const subjectPath = path.join(baseDir, subject);
    const files = fs.readdirSync(subjectPath)
      .filter(isPdf)
      .map((fileName) => {
        const title = titleFromFilename(fileName);
        const year = yearFromTitle(title);
        return {
          title,
          year,
          file: path.join(baseLabel, subject, fileName).replace(/\\/g, '/'),
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
}

function writePapersData() {
  const payload = {
    generatedAt: new Date().toISOString(),
    subjects: scanSubjectDir(PAPERS_DIR, 'PastPapers'),
    otherSubjects: scanSubjectDir(OTHER_PAPERS_DIR, 'OtherPapers'),
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
    fs.watch(OTHER_PAPERS_DIR, { recursive: true }, schedule);
    console.log('[papers] Watching PastPapers and OtherPapers for changes...');
    return;
  }

  const watchers = new Map();
  const addWatcher = (dirPath) => {
    if (watchers.has(dirPath)) return;
    const watcher = fs.watch(dirPath, schedule);
    watchers.set(dirPath, watcher);
  };

  const refreshWatchers = () => {
    [PAPERS_DIR, OTHER_PAPERS_DIR].forEach((dir) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const subjectDirs = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(dir, entry.name));

      addWatcher(dir);
      subjectDirs.forEach(addWatcher);
    });
  };

  refreshWatchers();
  fs.watch(PAPERS_DIR, refreshWatchers);
  fs.watch(OTHER_PAPERS_DIR, refreshWatchers);
  console.log('[papers] Watching PastPapers and OtherPapers for changes...');
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
