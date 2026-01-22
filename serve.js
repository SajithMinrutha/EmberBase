const http = require('http');
const fs = require('fs');
const path = require('path');
const { writePapersData, startWatch: startPapersWatch } = require('./LocalAL/generate-papers');
const { writeTutesData, startWatch: startTutesWatch } = require('./LocalTutes/generate-tutes');
const { writeVideosData, startWatch: startVideosWatch } = require('./LocalVideos/generate-videos');
const { createUploadHandler } = require('./upload-service');

const ROOT = __dirname;
const PORT = process.env.PORT || 5050;
const WATCH_PAPERS = process.env.WATCH_PAPERS !== '0';
const WATCH_TUTES = process.env.WATCH_TUTES !== '0';
const WATCH_VIDEOS = process.env.WATCH_VIDEOS !== '0';
const DATA_DIR = path.join(ROOT, 'data');
const TRACK_DATA_FILE = path.join(DATA_DIR, 'embertrack.json');
const API_PREFIX = '/api/embertrack';
const API_RENAME = '/api/rename';
const API_UPLOAD = '/api/upload';
const VAULT_ROOT = path.join(ROOT, 'LocalAL');
const STUDY_ROOT = path.join(ROOT, 'LocalTutes');
const STREAM_ROOT = path.join(ROOT, 'LocalVideos');
const VAULT_ALLOWED = [
  path.join(VAULT_ROOT, 'PastPapers'),
  path.join(VAULT_ROOT, 'OtherPapers'),
];
const STUDY_ALLOWED = [
  path.join(STUDY_ROOT, 'Tutes'),
  path.join(STUDY_ROOT, 'OtherTutes'),
];
const STREAM_ALLOWED = [path.join(STREAM_ROOT, 'Videos')];
const DEFAULT_TRACK_DATA = {
  updated_at: null,
  profile: { name: 'Student', birthday: '', dailyTarget: 60 },
  subjects: [
    { id: 'subject-1', name: 'Combined Maths', created_at: new Date().toISOString() },
    { id: 'subject-2', name: 'Physics', created_at: new Date().toISOString() },
    { id: 'subject-3', name: 'Chemistry', created_at: new Date().toISOString() },
  ],
  marks: [],
  todos: [],
  studySessions: [],
  notes: '',
  goals: [],
};

const ROUTES = [
  { prefix: '/embertrack', dir: path.join(ROOT, 'Gradexa') },
  { prefix: '/embervault', dir: path.join(ROOT, 'LocalAL') },
  { prefix: '/emberstudy', dir: path.join(ROOT, 'LocalTutes') },
  { prefix: '/emberstream', dir: path.join(ROOT, 'LocalVideos') },
];

const uploadHandler = createUploadHandler({
  rootDir: ROOT,
  onVaultUpdate: writePapersData,
  onStudyUpdate: writeTutesData,
  onStreamUpdate: writeVideosData,
});

function normalizeSubjectName(name) {
  return String(name || '').trim();
}

function normalizeSubjectKey(name) {
  return normalizeSubjectName(name).toLowerCase();
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function listSubjectDirs(baseDir) {
  ensureDir(baseDir);
  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function renameDirCase(baseDir, fromName, toName) {
  if (fromName === toName) return;
  const fromPath = path.join(baseDir, fromName);
  const toPath = path.join(baseDir, toName);
  if (fs.existsSync(toPath)) return;
  if (fromPath.toLowerCase() === toPath.toLowerCase()) {
    const tempPath = path.join(baseDir, `${toName}__tmp_${Date.now()}`);
    fs.renameSync(fromPath, tempPath);
    fs.renameSync(tempPath, toPath);
    return;
  }
  fs.renameSync(fromPath, toPath);
}

function syncSubjectDir(baseDir, subjects, options = {}) {
  const subjectMap = new Map();
  subjects.forEach((name) => {
    const clean = normalizeSubjectName(name);
    if (!clean) return;
    subjectMap.set(normalizeSubjectKey(clean), clean);
  });

  const existing = listSubjectDirs(baseDir);
  existing.forEach((dirName) => {
    const key = normalizeSubjectKey(dirName);
    const desired = subjectMap.get(key);
    if (desired && desired !== dirName) {
      renameDirCase(baseDir, dirName, desired);
    }
  });

  const refreshed = listSubjectDirs(baseDir);
  const refreshedKeys = new Set(refreshed.map((dirName) => normalizeSubjectKey(dirName)));

  refreshed.forEach((dirName) => {
    const key = normalizeSubjectKey(dirName);
    if (!subjectMap.has(key)) {
      fs.rmSync(path.join(baseDir, dirName), { recursive: true, force: true });
    }
  });

  subjectMap.forEach((subjectName, key) => {
    if (!refreshedKeys.has(key)) {
      const subjectPath = path.join(baseDir, subjectName);
      ensureDir(subjectPath);
      if (options.ensureTuteTypes) {
        ensureDir(path.join(subjectPath, 'Theory'));
        ensureDir(path.join(subjectPath, 'Revision'));
      }
    }
  });
}

function syncSubjectFolders(subjects) {
  const names = subjects
    .map((subject) => {
      const name = normalizeSubjectName(subject?.name);
      return normalizeSubjectKey(name) === 'combined maths' ? 'Combined Maths' : name;
    })
    .filter(Boolean);

  STUDY_ALLOWED.forEach((dirPath) => {
    syncSubjectDir(dirPath, names, { ensureTuteTypes: true });
  });

  VAULT_ALLOWED.forEach((dirPath) => {
    syncSubjectDir(dirPath, names);
  });

  STREAM_ALLOWED.forEach((dirPath) => {
    syncSubjectDir(dirPath, names);
  });
}



const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.m4v': 'video/x-m4v',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
};
const VIDEO_EXTS = new Set(['.mp4', '.m4v', '.webm', '.mov', '.mkv']);

function safeJoin(baseDir, urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^([/\\])+/, '');
  return path.join(baseDir, normalized);
}

function resolveRoute(urlPath) {
  for (const route of ROUTES) {
    if (urlPath === route.prefix) {
      return { redirect: `${route.prefix}/` };
    }
    if (urlPath.startsWith(`${route.prefix}/`)) {
      const relative = urlPath.slice(route.prefix.length) || '/';
      return { dir: route.dir, relative };
    }
  }
  return { dir: ROOT, relative: urlPath };
}

function send(res, filePath, req) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || 'application/octet-stream';
    const range = req?.headers?.range;
    const isVideo = VIDEO_EXTS.has(ext);

    if (isVideo && range) {
      const size = stat.size;
      const match = /bytes=(\d+)-(\d*)/.exec(range);
      if (!match) {
        res.writeHead(416, { 'Content-Range': `bytes */${size}` });
        res.end();
        return;
      }
      const start = Number(match[1]);
      const end = match[2] ? Number(match[2]) : size - 1;
      if (start >= size || end >= size) {
        res.writeHead(416, { 'Content-Range': `bytes */${size}` });
        res.end();
        return;
      }
      res.writeHead(206, {
        'Content-Type': type,
        'Content-Length': end - start + 1,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
  });
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadTrackData() {
  ensureDataDir();
  if (!fs.existsSync(TRACK_DATA_FILE)) {
    fs.writeFileSync(TRACK_DATA_FILE, JSON.stringify(DEFAULT_TRACK_DATA, null, 2), 'utf8');
    return { ...DEFAULT_TRACK_DATA };
  }
  try {
    const raw = fs.readFileSync(TRACK_DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    return { ...DEFAULT_TRACK_DATA, ...parsed, subjects: parsed.subjects || [] };
  } catch {
    fs.writeFileSync(TRACK_DATA_FILE, JSON.stringify(DEFAULT_TRACK_DATA, null, 2), 'utf8');
    return { ...DEFAULT_TRACK_DATA };
  }
}

function readTrackData(res) {
  const data = loadTrackData();
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(data));
}

function writeTrackData(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const parsed = JSON.parse(body || '{}');
      ensureDataDir();
      fs.writeFile(TRACK_DATA_FILE, JSON.stringify(parsed, null, 2), 'utf8', (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'write-failed' }));
          return;
        }
        syncSubjectFolders(parsed.subjects || []);
        writePapersData();
        writeTutesData();
        writeVideosData();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: 'ok' }));
      });
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'invalid-json' }));
    }
  });
}

function syncFromTrackFile() {
  const parsed = loadTrackData();
  syncSubjectFolders(parsed.subjects || []);
}

function isSafeRenameTarget(baseRoot, allowedRoots, relativePath) {
  const normalized = path.normalize(relativePath).replace(/^([/\\])+/, '');
  const fullPath = path.resolve(baseRoot, normalized);
  const allowed = allowedRoots.some((root) => fullPath.startsWith(root));
  return allowed ? { fullPath, normalized } : null;
}

function sanitizeFileName(inputName) {
  const base = path.basename(inputName);
  if (!base) return null;
  const ext = path.extname(base);
  if (ext && ext.toLowerCase() !== '.pdf') {
    return null;
  }
  return ext ? base : `${base}.pdf`;
}

function handleRename(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const payload = JSON.parse(body || '{}');
      const kind = payload.kind;
      const filePath = payload.filePath;
      const newName = payload.newName;
      if (!kind || !filePath || !newName) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'missing-fields' }));
        return;
      }

      const safeName = sanitizeFileName(newName);
      if (!safeName) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'invalid-name' }));
        return;
      }

      let target;
      if (kind === 'embervault') {
        target = isSafeRenameTarget(VAULT_ROOT, VAULT_ALLOWED, filePath);
      } else if (kind === 'emberstudy') {
        target = isSafeRenameTarget(STUDY_ROOT, STUDY_ALLOWED, filePath);
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'invalid-kind' }));
        return;
      }

      if (!target) {
        res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'forbidden' }));
        return;
      }

      const nextPath = path.join(path.dirname(target.fullPath), safeName);
      fs.rename(target.fullPath, nextPath, (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'rename-failed' }));
          return;
        }
        if (kind === 'embervault') {
          writePapersData();
        } else {
          writeTutesData();
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: 'ok' }));
      });
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'invalid-json' }));
    }
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url || '/');
  if (urlPath.startsWith(API_PREFIX)) {
    if (req.method === 'GET') {
      readTrackData(res);
      return;
    }
    if (req.method === 'POST' || req.method === 'PUT') {
      writeTrackData(req, res);
      return;
    }
    res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'method-not-allowed' }));
    return;
  }
  if (urlPath.startsWith(API_RENAME)) {
    if (req.method === 'POST') {
      handleRename(req, res);
      return;
    }
    res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'method-not-allowed' }));
    return;
  }
  if (urlPath.startsWith(API_UPLOAD)) {
    uploadHandler(req, res);
    return;
  }
  const route = resolveRoute(urlPath);

  if (route.redirect) {
    res.writeHead(302, { Location: route.redirect });
    res.end();
    return;
  }

  let relativePath = route.relative || '/';
  if (relativePath === '/') {
    relativePath = '/index.html';
  }

  const filePath = safeJoin(route.dir, relativePath);
  if (!filePath.startsWith(route.dir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err) {
      send(res, path.join(route.dir, 'index.html'), req);
      return;
    }
    if (stat.isDirectory()) {
      send(res, path.join(filePath, 'index.html'), req);
      return;
    }
    send(res, filePath, req);
  });
});

syncFromTrackFile();
writePapersData();
writeTutesData();
writeVideosData();
if (WATCH_PAPERS) {
  startPapersWatch();
}
if (WATCH_TUTES) {
  startTutesWatch();
}
if (WATCH_VIDEOS) {
  startVideosWatch();
}

server.listen(PORT, () => {
  console.log(`EmberBase running on http://localhost:${PORT}`);
  console.log('EmberTrack: http://localhost:' + PORT + '/embertrack/');
  console.log('EmberVault: http://localhost:' + PORT + '/embervault/');
  console.log('EmberStudy: http://localhost:' + PORT + '/emberstudy/');
  console.log('EmberStream: http://localhost:' + PORT + '/emberstream/');
});
