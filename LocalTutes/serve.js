const http = require('http');
const fs = require('fs');
const path = require('path');
const { writeTutesData, startWatch } = require('./generate-tutes');
const { createUploadHandler } = require('../upload-service');

const ROOT = __dirname;
const PORT = process.env.PORT || 5174;
const AUTO_WATCH = process.env.WATCH_TUTES !== '0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const uploadHandler = createUploadHandler({
  rootDir: path.resolve(__dirname, '..'),
  onStudyUpdate: writeTutesData,
});

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^([/\\])+/, '');
  return path.join(ROOT, normalized);
}

const server = http.createServer((req, res) => {
  if ((req.url || '').startsWith('/api/upload')) {
    uploadHandler(req, res);
    return;
  }
  const requestPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = safePath(requestPath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
  });
});

writeTutesData();
if (AUTO_WATCH) {
  startWatch();
}

server.listen(PORT, () => {
  console.log(`EmberStudy running at http://localhost:${PORT}`);
});
