const fs = require('fs');
const path = require('path');

const MAX_BODY_BYTES = Number(process.env.UPLOAD_BODY_BYTES || 50000000);
const MAX_UPLOAD_BYTES = Number(process.env.UPLOAD_MAX_BYTES || 25000000);

const BUCKETS = new Set(['main', 'other']);
const STUDY_TYPES = {
  theory: 'Theory',
  revision: 'Revision',
};

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > MAX_BODY_BYTES) {
        reject(new Error('payload-too-large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sanitizeSegment(value, fallback) {
  const cleaned = String(value || '')
    .trim()
    .replace(/[^a-z0-9 _-]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || fallback;
}

function sanitizeFileName(inputName) {
  const base = path.basename(String(inputName || ''));
  if (!base) return null;
  const ext = path.extname(base).toLowerCase();
  const name = ext ? base.slice(0, -ext.length) : base;
  if (ext && ext !== '.pdf') return null;
  const cleaned = name
    .trim()
    .replace(/[^a-z0-9 _-]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const safeName = cleaned || 'upload';
  return `${safeName}.pdf`;
}

function stripDataUrl(input) {
  const value = String(input || '').trim();
  if (value.startsWith('data:')) {
    const parts = value.split(',');
    return parts[1] || '';
  }
  return value;
}

function estimateBytes(base64) {
  return Math.floor((base64.length * 3) / 4);
}

function uniqueFilePath(dir, fileName) {
  let target = path.join(dir, fileName);
  if (!fs.existsSync(target)) return target;
  const ext = path.extname(fileName);
  const base = fileName.slice(0, -ext.length);
  let index = 1;
  while (index < 1000) {
    const candidate = path.join(dir, `${base}-${index}${ext}`);
    if (!fs.existsSync(candidate)) return candidate;
    index += 1;
  }
  return path.join(dir, `${base}-${Date.now()}${ext}`);
}

function createUploadHandler({ rootDir, onVaultUpdate, onStudyUpdate }) {
  const vaultRoot = path.join(rootDir, 'LocalAL');
  const studyRoot = path.join(rootDir, 'LocalTutes');
  const vaultDirs = {
    main: path.join(vaultRoot, 'PastPapers'),
    other: path.join(vaultRoot, 'OtherPapers'),
  };
  const studyDirs = {
    main: path.join(studyRoot, 'Tutes'),
    other: path.join(studyRoot, 'OtherTutes'),
  };

  return async function handleUpload(req, res) {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'method-not-allowed' });
      return;
    }

    let payload;
    try {
      const raw = await readJsonBody(req);
      payload = JSON.parse(raw || '{}');
    } catch (err) {
      if (err.message === 'payload-too-large') {
        sendJson(res, 413, { error: 'payload-too-large' });
        return;
      }
      sendJson(res, 400, { error: 'invalid-json' });
      return;
    }

    const kind = String(payload.kind || '').toLowerCase();
    const bucket = String(payload.bucket || 'main').toLowerCase();
    const subject = String(payload.subject || '');
    const type = String(payload.type || '');
    const fileName = sanitizeFileName(payload.fileName);
    const rawData = stripDataUrl(payload.data);

    if (!kind || !fileName || !rawData) {
      sendJson(res, 400, { error: 'missing-fields' });
      return;
    }
    if (!BUCKETS.has(bucket)) {
      sendJson(res, 400, { error: 'invalid-bucket' });
      return;
    }

    const estimated = estimateBytes(rawData);
    if (estimated > MAX_UPLOAD_BYTES) {
      sendJson(res, 413, { error: 'file-too-large' });
      return;
    }

    let targetDir = '';
    if (kind === 'embervault') {
      const safeSubject = sanitizeSegment(subject, 'General');
      const baseDir = bucket === 'other' ? vaultDirs.other : vaultDirs.main;
      targetDir = path.join(baseDir, safeSubject);
    } else if (kind === 'emberstudy') {
      const safeSubject = sanitizeSegment(subject, 'General');
      const typeKey = type.toLowerCase();
      const safeType = STUDY_TYPES[typeKey];
      if (!safeType) {
        sendJson(res, 400, { error: 'invalid-type' });
        return;
      }
      const baseDir = bucket === 'other' ? studyDirs.other : studyDirs.main;
      targetDir = path.join(baseDir, safeSubject, safeType);
    } else {
      sendJson(res, 400, { error: 'invalid-kind' });
      return;
    }

    try {
      await fs.promises.mkdir(targetDir, { recursive: true });
      const filePath = uniqueFilePath(targetDir, fileName);
      const buffer = Buffer.from(rawData, 'base64');
      await fs.promises.writeFile(filePath, buffer);
      if (kind === 'embervault' && onVaultUpdate) {
        onVaultUpdate();
      }
      if (kind === 'emberstudy' && onStudyUpdate) {
        onStudyUpdate();
      }
      sendJson(res, 200, { status: 'ok' });
    } catch (err) {
      sendJson(res, 500, { error: 'upload-failed' });
    }
  };
}

module.exports = { createUploadHandler };
