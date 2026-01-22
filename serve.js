const http = require('http');
const fs = require('fs');
const path = require('path');
const { writePapersData, startWatch: startPapersWatch } = require('./LocalAL/generate-papers');
const { writeTutesData, startWatch: startTutesWatch } = require('./LocalTutes/generate-tutes');
const { createUploadHandler } = require('./upload-service');

const ROOT = __dirname;
const PORT = process.env.PORT || 5050;
const WATCH_PAPERS = process.env.WATCH_PAPERS !== '0';
const WATCH_TUTES = process.env.WATCH_TUTES !== '0';
const DATA_DIR = path.join(ROOT, 'data');
const TRACK_DATA_FILE = path.join(DATA_DIR, 'embertrack.json');
const API_PREFIX = '/api/embertrack';
const API_RENAME = '/api/rename';
const API_UPLOAD = '/api/upload';
const VAULT_ROOT = path.join(ROOT, 'LocalAL');
const STUDY_ROOT = path.join(ROOT, 'LocalTutes');
const VAULT_ALLOWED = [
  path.join(VAULT_ROOT, 'PastPapers'),
  path.join(VAULT_ROOT, 'OtherPapers'),
];
const STUDY_ALLOWED = [
  path.join(STUDY_ROOT, 'Tutes'),
  path.join(STUDY_ROOT, 'OtherTutes'),
];

const ROUTES = [
  { prefix: '/embertrack', dir: path.join(ROOT, 'Gradexa') },
  { prefix: '/embervault', dir: path.join(ROOT, 'LocalAL') },
  { prefix: '/emberstudy', dir: path.join(ROOT, 'LocalTutes') },
];

const uploadHandler = createUploadHandler({
  rootDir: ROOT,
  onVaultUpdate: writePapersData,
  onStudyUpdate: writeTutesData,
});



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
};

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

function send(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readTrackData(res) {
  fs.readFile(TRACK_DATA_FILE, 'utf8', (err, raw) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'no-data' }));
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(raw);
  });
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
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: 'ok' }));
      });
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'invalid-json' }));
    }
  });
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
      send(res, path.join(route.dir, 'index.html'));
      return;
    }
    if (stat.isDirectory()) {
      send(res, path.join(filePath, 'index.html'));
      return;
    }
    send(res, filePath);
  });
});

writePapersData();
writeTutesData();
if (WATCH_PAPERS) {
  startPapersWatch();
}
if (WATCH_TUTES) {
  startTutesWatch();
}

server.listen(PORT, () => {
  console.log(`EmberBase running on http://localhost:${PORT}`);
  console.log('EmberTrack: http://localhost:' + PORT + '/embertrack/');
  console.log('EmberVault: http://localhost:' + PORT + '/embervault/');
  console.log('EmberStudy: http://localhost:' + PORT + '/emberstudy/');
});
