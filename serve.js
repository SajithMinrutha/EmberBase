const http = require('http');
const fs = require('fs');
const path = require('path');
const { writePapersData, startWatch: startPapersWatch } = require('./LocalAL/generate-papers');
const { writeTutesData, startWatch: startTutesWatch } = require('./LocalTutes/generate-tutes');

const ROOT = __dirname;
const PORT = process.env.PORT || 5050;
const WATCH_PAPERS = process.env.WATCH_PAPERS !== '0';
const WATCH_TUTES = process.env.WATCH_TUTES !== '0';

const ROUTES = [
  { prefix: '/embertrack', dir: path.join(ROOT, 'Gradexa') },
  { prefix: '/embervault', dir: path.join(ROOT, 'LocalAL') },
  { prefix: '/emberstudy', dir: path.join(ROOT, 'LocalTutes') },
];

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

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url || '/');
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
