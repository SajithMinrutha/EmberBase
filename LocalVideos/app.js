const data = window.VIDEOS_DATA;
const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const count = document.getElementById('count');
const updated = document.getElementById('updated');
const searchInput = document.getElementById('search');
const subjectChips = document.getElementById('subjectChips');
const unitChips = document.getElementById('unitChips');
const TRACK_SUBJECT_ENDPOINT = '/api/embertrack';
let trackSubjectNames = [];
const SUBJECT_POLL_MS = 10000;
let trackSubjectsLoaded = false;

const uploadToggle = document.getElementById('uploadToggle');
const uploadModal = document.getElementById('uploadModal');
const uploadClose = document.getElementById('uploadClose');
const uploadBackdrop = uploadModal?.querySelector('[data-close="upload"]');
const uploadFile = document.getElementById('uploadFile');
const uploadSubject = document.getElementById('uploadSubject');
const uploadSubjectRow = document.getElementById('uploadSubjectRow');
const uploadSubjectNew = document.getElementById('uploadSubjectNew');
const uploadUnit = document.getElementById('uploadUnit');
const uploadUnitRow = document.getElementById('uploadUnitRow');
const uploadUnitNew = document.getElementById('uploadUnitNew');
const uploadSubmit = document.getElementById('uploadSubmit');
const uploadStatus = document.getElementById('uploadStatus');

const settingsToggle = document.getElementById('settingsToggle');
const settingsModal = document.getElementById('settingsModal');
const settingsClose = document.getElementById('settingsClose');
const settingsBackdrop = settingsModal?.querySelector('[data-close="settings"]');
const settingsSave = document.getElementById('settingsSave');
const settingPreview = document.getElementById('settingPreview');
const settingCompact = document.getElementById('settingCompact');

const state = {
  subject: 'all',
  unit: 'all',
  query: '',
};

const NEW_UNIT_VALUE = '__new__';
const SETTINGS_STORAGE = 'emberstream-settings';

const VIDEO_EXTS = ['.mp4', '.m4v', '.webm', '.mov', '.mkv'];

const settings = {
  showPreview: true,
  compact: false,
};

const THEME_STORAGE = 'emberbase-theme';
const THEMES = {
  mono: {
    label: 'Mono',
    vars: {
      '--bg-1': '#050505',
      '--bg-2': '#0b0b0b',
      '--bg-3': '#141414',
      '--surface': 'rgba(12, 12, 12, 0.88)',
      '--surface-strong': 'rgba(12, 12, 12, 0.96)',
      '--line': 'rgba(255, 255, 255, 0.12)',
      '--accent': '#f8fafc',
      '--accent-2': '#e5e7eb',
      '--accent-3': '#9ca3af',
      '--accent-soft': 'rgba(255, 255, 255, 0.12)',
      '--accent-border': 'rgba(255, 255, 255, 0.18)',
      '--accent-shadow': 'rgba(248, 250, 252, 0.2)',
      '--glow-1': 'rgba(255, 255, 255, 0.12)',
      '--glow-2': 'rgba(255, 255, 255, 0.08)',
      '--glow-3': 'rgba(255, 255, 255, 0.06)',
      '--ink-900': '#f8fafc',
      '--ink-700': '#cfcfcf',
      '--ink-400': '#9aa0a6',
      '--sand-100': '#050505',
      '--sand-200': '#0b0b0b',
      '--shadow': '0 24px 60px rgba(0, 0, 0, 0.7)',
    },
  },
  slate: {
    label: 'Slate',
    vars: {
      '--bg-1': '#060811',
      '--bg-2': '#0b1020',
      '--bg-3': '#12172b',
      '--surface': 'rgba(13, 18, 33, 0.88)',
      '--surface-strong': 'rgba(13, 18, 33, 0.96)',
      '--line': 'rgba(139, 92, 246, 0.18)',
      '--accent': '#8b5cf6',
      '--accent-2': '#22d3ee',
      '--accent-3': '#5b21b6',
      '--accent-soft': 'rgba(139, 92, 246, 0.22)',
      '--accent-border': 'rgba(139, 92, 246, 0.32)',
      '--accent-shadow': 'rgba(139, 92, 246, 0.32)',
      '--glow-1': 'rgba(139, 92, 246, 0.28)',
      '--glow-2': 'rgba(34, 211, 238, 0.22)',
      '--glow-3': 'rgba(255, 255, 255, 0.05)',
      '--ink-900': '#f8fafc',
      '--ink-700': '#c7d2fe',
      '--ink-400': '#96a1d4',
      '--sand-100': '#060811',
      '--sand-200': '#0b1020',
      '--shadow': '0 24px 60px rgba(6, 8, 24, 0.65)',
    },
  },
  cobalt: {
    label: 'Cobalt',
    vars: {
      '--bg-1': '#050b16',
      '--bg-2': '#0a1430',
      '--bg-3': '#111c3b',
      '--surface': 'rgba(10, 18, 34, 0.88)',
      '--surface-strong': 'rgba(10, 18, 34, 0.96)',
      '--line': 'rgba(56, 189, 248, 0.18)',
      '--accent': '#38bdf8',
      '--accent-2': '#f472b6',
      '--accent-3': '#1d4ed8',
      '--accent-soft': 'rgba(56, 189, 248, 0.22)',
      '--accent-border': 'rgba(56, 189, 248, 0.32)',
      '--accent-shadow': 'rgba(56, 189, 248, 0.32)',
      '--glow-1': 'rgba(56, 189, 248, 0.28)',
      '--glow-2': 'rgba(244, 114, 182, 0.22)',
      '--glow-3': 'rgba(255, 255, 255, 0.05)',
      '--ink-900': '#f8fafc',
      '--ink-700': '#c7d2fe',
      '--ink-400': '#93a6d9',
      '--sand-100': '#050b16',
      '--sand-200': '#0a1430',
      '--shadow': '0 24px 60px rgba(4, 8, 22, 0.65)',
    },
  },
  ocean: {
    label: 'Ocean',
    vars: {
      '--bg-1': '#031316',
      '--bg-2': '#062026',
      '--bg-3': '#0b2b33',
      '--surface': 'rgba(7, 26, 32, 0.88)',
      '--surface-strong': 'rgba(7, 26, 32, 0.96)',
      '--line': 'rgba(34, 211, 238, 0.18)',
      '--accent': '#22d3ee',
      '--accent-2': '#34d399',
      '--accent-3': '#0f766e',
      '--accent-soft': 'rgba(34, 211, 238, 0.22)',
      '--accent-border': 'rgba(34, 211, 238, 0.32)',
      '--accent-shadow': 'rgba(34, 211, 238, 0.32)',
      '--glow-1': 'rgba(34, 211, 238, 0.28)',
      '--glow-2': 'rgba(52, 211, 153, 0.22)',
      '--glow-3': 'rgba(255, 255, 255, 0.05)',
      '--ink-900': '#f8fafc',
      '--ink-700': '#b5f2e6',
      '--ink-400': '#7fc9be',
      '--sand-100': '#031316',
      '--sand-200': '#062026',
      '--shadow': '0 24px 60px rgba(2, 8, 18, 0.62)',
    },
  },
  aurora: {
    label: 'Aurora',
    vars: {
      '--bg-1': '#061118',
      '--bg-2': '#0a1b24',
      '--bg-3': '#112534',
      '--surface': 'rgba(9, 26, 34, 0.88)',
      '--surface-strong': 'rgba(9, 26, 34, 0.96)',
      '--line': 'rgba(94, 234, 212, 0.18)',
      '--accent': '#5eead4',
      '--accent-2': '#a855f7',
      '--accent-3': '#6d28d9',
      '--accent-soft': 'rgba(94, 234, 212, 0.22)',
      '--accent-border': 'rgba(94, 234, 212, 0.32)',
      '--accent-shadow': 'rgba(94, 234, 212, 0.32)',
      '--glow-1': 'rgba(94, 234, 212, 0.28)',
      '--glow-2': 'rgba(168, 85, 247, 0.22)',
      '--glow-3': 'rgba(255, 255, 255, 0.05)',
      '--ink-900': '#f8fafc',
      '--ink-700': '#c7f9f1',
      '--ink-400': '#8bd7c8',
      '--sand-100': '#061118',
      '--sand-200': '#0a1b24',
      '--shadow': '0 24px 60px rgba(3, 9, 18, 0.62)',
    },
  },
  moss: {
    label: 'Moss',
    vars: {
      '--bg-1': '#06110c',
      '--bg-2': '#0a1b14',
      '--bg-3': '#12251c',
      '--surface': 'rgba(10, 25, 19, 0.88)',
      '--surface-strong': 'rgba(10, 25, 19, 0.96)',
      '--line': 'rgba(52, 211, 153, 0.18)',
      '--accent': '#34d399',
      '--accent-2': '#a3e635',
      '--accent-3': '#047857',
      '--accent-soft': 'rgba(52, 211, 153, 0.22)',
      '--accent-border': 'rgba(52, 211, 153, 0.32)',
      '--accent-shadow': 'rgba(52, 211, 153, 0.32)',
      '--glow-1': 'rgba(52, 211, 153, 0.28)',
      '--glow-2': 'rgba(163, 230, 53, 0.22)',
      '--glow-3': 'rgba(255, 255, 255, 0.05)',
      '--ink-900': '#f8fafc',
      '--ink-700': '#c5f2da',
      '--ink-400': '#8bd0b0',
      '--sand-100': '#06110c',
      '--sand-200': '#0a1b14',
      '--shadow': '0 24px 60px rgba(4, 10, 18, 0.62)',
    },
  },
  dune: {
    label: 'Dune',
    vars: {
      '--bg-1': '#140e08',
      '--bg-2': '#1b130b',
      '--bg-3': '#241a10',
      '--surface': 'rgba(22, 16, 10, 0.88)',
      '--surface-strong': 'rgba(22, 16, 10, 0.96)',
      '--line': 'rgba(251, 191, 36, 0.18)',
      '--accent': '#fbbf24',
      '--accent-2': '#fb7185',
      '--accent-3': '#b45309',
      '--accent-soft': 'rgba(251, 191, 36, 0.22)',
      '--accent-border': 'rgba(251, 191, 36, 0.32)',
      '--accent-shadow': 'rgba(251, 191, 36, 0.32)',
      '--glow-1': 'rgba(251, 191, 36, 0.28)',
      '--glow-2': 'rgba(251, 113, 133, 0.22)',
      '--glow-3': 'rgba(255, 255, 255, 0.05)',
      '--ink-900': '#fef3c7',
      '--ink-700': '#fcd34d',
      '--ink-400': '#f59e0b',
      '--sand-100': '#140e08',
      '--sand-200': '#1b130b',
      '--shadow': '0 24px 60px rgba(20, 12, 4, 0.6)',
    },
  },
  sunrise: {
    label: 'Sunrise',
    vars: {
      '--bg-1': '#1a0b10',
      '--bg-2': '#2b0d14',
      '--bg-3': '#3d111a',
      '--surface': 'rgba(33, 14, 20, 0.88)',
      '--surface-strong': 'rgba(33, 14, 20, 0.96)',
      '--line': 'rgba(251, 113, 133, 0.2)',
      '--accent': '#fb7185',
      '--accent-2': '#f472b6',
      '--accent-3': '#be123c',
      '--accent-soft': 'rgba(251, 113, 133, 0.22)',
      '--accent-border': 'rgba(251, 113, 133, 0.32)',
      '--accent-shadow': 'rgba(251, 113, 133, 0.32)',
      '--glow-1': 'rgba(251, 113, 133, 0.28)',
      '--glow-2': 'rgba(244, 114, 182, 0.22)',
      '--glow-3': 'rgba(255, 255, 255, 0.05)',
      '--ink-900': '#fdf2f8',
      '--ink-700': '#fbcfe8',
      '--ink-400': '#f9a8d4',
      '--sand-100': '#1a0b10',
      '--sand-200': '#2b0d14',
      '--shadow': '0 24px 60px rgba(25, 8, 14, 0.6)',
    },
  },
  ember: {
    label: 'Ember',
    vars: {
      '--bg-1': '#120b08',
      '--bg-2': '#1c0f0a',
      '--bg-3': '#28140d',
      '--surface': 'rgba(26, 16, 10, 0.88)',
      '--surface-strong': 'rgba(26, 16, 10, 0.96)',
      '--line': 'rgba(249, 115, 22, 0.22)',
      '--accent': '#f97316',
      '--accent-2': '#facc15',
      '--accent-3': '#c2410c',
      '--accent-soft': 'rgba(249, 115, 22, 0.24)',
      '--accent-border': 'rgba(249, 115, 22, 0.32)',
      '--accent-shadow': 'rgba(249, 115, 22, 0.32)',
      '--glow-1': 'rgba(249, 115, 22, 0.28)',
      '--glow-2': 'rgba(250, 204, 21, 0.22)',
      '--glow-3': 'rgba(255, 255, 255, 0.05)',
      '--ink-900': '#fff7ed',
      '--ink-700': '#fed7aa',
      '--ink-400': '#fdba74',
      '--sand-100': '#120b08',
      '--sand-200': '#1c0f0a',
      '--shadow': '0 24px 60px rgba(20, 10, 6, 0.62)',
    },
  },
  noir: {
    label: 'Noir',
    vars: {
      '--bg-1': '#050307',
      '--bg-2': '#09060c',
      '--bg-3': '#0f0914',
      '--surface': 'rgba(12, 8, 16, 0.88)',
      '--surface-strong': 'rgba(12, 8, 16, 0.96)',
      '--line': 'rgba(148, 163, 184, 0.18)',
      '--accent': '#94a3b8',
      '--accent-2': '#f472b6',
      '--accent-3': '#334155',
      '--accent-soft': 'rgba(148, 163, 184, 0.22)',
      '--accent-border': 'rgba(148, 163, 184, 0.32)',
      '--accent-shadow': 'rgba(148, 163, 184, 0.32)',
      '--glow-1': 'rgba(148, 163, 184, 0.2)',
      '--glow-2': 'rgba(244, 114, 182, 0.18)',
      '--glow-3': 'rgba(255, 255, 255, 0.04)',
      '--ink-900': '#f8fafc',
      '--ink-700': '#cbd5f5',
      '--ink-400': '#94a3b8',
      '--sand-100': '#050307',
      '--sand-200': '#09060c',
      '--shadow': '0 24px 60px rgba(4, 2, 8, 0.7)',
    },
  },
};

function applyTheme(name) {
  const theme = THEMES[name] || THEMES.mono;
  Object.entries(theme.vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  document.documentElement.dataset.theme = name;
  try {
    localStorage.setItem(THEME_STORAGE, name);
  } catch {}
}

function initThemeSwitch() {
  const select = document.getElementById('themeSelect');
  let stored = '';
  try {
    stored = localStorage.getItem(THEME_STORAGE) || '';
  } catch {}
  const initial = THEMES[stored] ? stored : 'mono';
  applyTheme(initial);
  if (!select) return;
  select.value = initial;
  select.addEventListener('change', (event) => {
    applyTheme(event.target.value);
  });
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    settings.showPreview = parsed.showPreview !== false;
    settings.compact = Boolean(parsed.compact);
  } catch {}
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
  } catch {}
}

function applySettings() {
  document.body.classList.toggle('is-compact', settings.compact);
  if (settingPreview) settingPreview.checked = settings.showPreview;
  if (settingCompact) settingCompact.checked = settings.compact;
}

initThemeSwitch();
loadSettings();
applySettings();

function formatDate(isoString) {
  if (!isoString) return 'Updated recently';
  const date = new Date(isoString);
  return `Updated ${date.toLocaleDateString()}`;
}

function getLocalSubjectNames() {
  return (data?.subjects || []).map((subject) => subject.subject).filter(Boolean);
}

function normalizeSubject(value) {
  return String(value || '').trim().toLowerCase();
}

function formatSubjectName(value) {
  const cleaned = String(value || '').trim();
  return normalizeSubject(cleaned) === 'combined maths' ? 'Combined Maths' : cleaned;
}

function getTrackSubjectNames() {
  const subjects = Array.from(new Set(trackSubjectNames.filter(Boolean)));
  return subjects.sort((a, b) => a.localeCompare(b));
}

function getTrackSubjectMap() {
  const map = new Map();
  getTrackSubjectNames().forEach((subject) => {
    map.set(normalizeSubject(subject), subject);
  });
  return map;
}

function setTrackSubjectNames(names) {
  const next = Array.from(new Set(names.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
  const current = getTrackSubjectNames();
  const changed =
    next.length !== current.length ||
    next.some((subject, index) => subject !== current[index]);
  if (changed) {
    trackSubjectNames = next;
    initContent();
  }
  trackSubjectsLoaded = true;
}

function getUnifiedSubjectNames() {
  const trackSubjects = getTrackSubjectNames();
  if (trackSubjects.length) return trackSubjects;
  const subjects = Array.from(new Set(getLocalSubjectNames()));
  return subjects.sort((a, b) => a.localeCompare(b));
}

function getUnitsForSubject(subjectName) {
  const units = new Set();
  (data?.subjects || []).forEach((subject) => {
    if (
      subjectName !== 'all' &&
      normalizeSubject(subject.subject) !== normalizeSubject(subjectName)
    ) {
      return;
    }
    (subject.units || []).forEach((unit) => {
      if (unit.unit) units.add(unit.unit);
    });
  });
  return Array.from(units).sort((a, b) => a.localeCompare(b));
}

function getDisplaySubject(subjectName) {
  const normalized = normalizeSubject(subjectName);
  const map = getTrackSubjectMap();
  return map.get(normalized) || subjectName;
}

function flattenVideos(subjects) {
  return subjects.flatMap((subject) =>
    (subject.units || []).flatMap((unit) =>
      (unit.videos || []).map((video) => ({
        ...video,
        subject: getDisplaySubject(subject.subject),
        unit: unit.unit,
      }))
    )
  );
}

function matchesFilters(video) {
  const allowedSubjects = getTrackSubjectMap();
  const normalized = normalizeSubject(video.subject);
  const query = state.query.trim().toLowerCase();
  const allowedMatch =
    allowedSubjects.size === 0 || allowedSubjects.has(normalized);
  const subjectMatch =
    allowedMatch &&
    (state.subject === 'all' || normalizeSubject(state.subject) === normalized);
  const unitMatch = state.unit === 'all' || video.unit === state.unit;
  if (!query) return subjectMatch && unitMatch;
  const haystack = `${video.title} ${video.subject} ${video.unit}`.toLowerCase();
  return subjectMatch && unitMatch && haystack.includes(query);
}

function setUploadStatus(message) {
  if (uploadStatus) uploadStatus.textContent = message;
}

function buildUploadSubjects() {
  if (!uploadSubject) return;
  const subjects = getUnifiedSubjectNames();
  const hasSubjects = subjects.length > 0;
  uploadSubject.innerHTML = '';
  if (!hasSubjects) {
    const newOption = document.createElement('option');
    newOption.value = '';
    newOption.textContent = 'Add subjects in EmberTrack';
    newOption.disabled = true;
    uploadSubject.append(newOption);
    uploadSubject.value = '';
    if (uploadSubmit) uploadSubmit.disabled = true;
    if (uploadToggle) uploadToggle.disabled = true;
    setUploadStatus('Add subjects in EmberTrack to upload videos.');
  } else {
    if (uploadSubmit) uploadSubmit.disabled = false;
    if (uploadToggle) uploadToggle.disabled = false;
    setUploadStatus('');
    subjects.forEach((subject) => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      uploadSubject.append(option);
    });
    uploadSubject.value = subjects[0];
  }
  if (uploadSubjectRow) {
    uploadSubjectRow.classList.add('is-hidden');
  }
  buildUploadUnits();
}

function buildUploadUnits() {
  if (!uploadUnit) return;
  const subjectValue = uploadSubject?.value || '';
  const unitSubject = subjectValue === NEW_SUBJECT_VALUE ? '' : subjectValue;
  const units = unitSubject ? getUnitsForSubject(unitSubject) : [];
  uploadUnit.innerHTML = '';
  units.forEach((unit) => {
    const option = document.createElement('option');
    option.value = unit;
    option.textContent = unit;
    uploadUnit.append(option);
  });
  const newOption = document.createElement('option');
  newOption.value = NEW_UNIT_VALUE;
  newOption.textContent = 'New unit...';
  uploadUnit.append(newOption);
  uploadUnit.value = units[0] || NEW_UNIT_VALUE;
  if (uploadUnitRow) {
    uploadUnitRow.classList.toggle('is-hidden', uploadUnit.value !== NEW_UNIT_VALUE);
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1] || '';
        resolve(base64);
        return;
      }
      reject(new Error('file-read-failed'));
    };
    reader.onerror = () => reject(new Error('file-read-failed'));
    reader.readAsDataURL(file);
  });
}

function isValidVideo(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('video/')) return true;
  const lower = file.name.toLowerCase();
  return VIDEO_EXTS.some((ext) => lower.endsWith(ext));
}

async function handleUpload() {
  if (!uploadFile || !uploadSubmit) return;
  const file = uploadFile.files?.[0];
  if (!file) {
    setUploadStatus('Choose a video file.');
    return;
  }
  if (!isValidVideo(file)) {
    setUploadStatus('Only video files are supported.');
    return;
  }
  const subjectValue = uploadSubject?.value || '';
  if (!subjectValue) {
    setUploadStatus('Add a subject name.');
    return;
  }
  const selectedUnit = uploadUnit?.value || '';
  const unitValue =
    selectedUnit === NEW_UNIT_VALUE ? uploadUnitNew?.value.trim() : selectedUnit;
  if (!unitValue) {
    setUploadStatus('Add a unit name.');
    return;
  }
  try {
    uploadSubmit.disabled = true;
    uploadFile.disabled = true;
    if (uploadSubject) uploadSubject.disabled = true;
    if (uploadSubjectNew) uploadSubjectNew.disabled = true;
    if (uploadUnit) uploadUnit.disabled = true;
    if (uploadUnitNew) uploadUnitNew.disabled = true;
    setUploadStatus('Uploading...');
    const base64 = await readFileAsBase64(file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'emberstream',
        subject: subjectValue,
        unit: unitValue,
        fileName: file.name,
        data: base64,
      }),
    });
    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload?.error || 'upload-failed');
    }
    setUploadStatus('Uploaded. Refreshing...');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  } catch (err) {
    const message =
      err.message === 'file-too-large'
        ? 'File too large. Try a smaller video.'
        : 'Upload failed. Please try again.';
    setUploadStatus(message);
  } finally {
    uploadSubmit.disabled = false;
    uploadFile.disabled = false;
    if (uploadSubject) uploadSubject.disabled = false;
    if (uploadSubjectNew) uploadSubjectNew.disabled = false;
    if (uploadUnit) uploadUnit.disabled = false;
    if (uploadUnitNew) uploadUnitNew.disabled = false;
  }
}

function toggleModal(modal, nextState) {
  if (!modal) return;
  const shouldOpen =
    typeof nextState === 'boolean'
      ? nextState
      : !modal.classList.contains('is-open');
  modal.classList.toggle('is-open', shouldOpen);
  modal.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
}

function renderCards(videos, target) {
  target.innerHTML = '';
  const fragment = document.createDocumentFragment();

  videos.forEach((videoData) => {
    const card = document.createElement('article');
    card.className = settings.compact ? 'card card--compact' : 'card';

    const tags = document.createElement('div');
    tags.className = 'card__tags';
    tags.innerHTML = `
      <span class="tag">${videoData.subject}</span>
      <span class="tag tag--unit">${videoData.unit}</span>
    `;

    const title = document.createElement('div');
    title.className = 'card__title';
    title.textContent = videoData.title;

    if (settings.showPreview) {
      const media = document.createElement('div');
      media.className = 'card__media';
      const player = document.createElement('video');
      player.controls = true;
      player.preload = 'metadata';
      player.src = videoData.file;
      player.setAttribute('playsinline', '');
      media.append(player);
      card.append(tags, title, media);
    } else {
      card.append(tags, title);
    }

    const meta = document.createElement('div');
    meta.className = 'card__meta';
    const extLabel = videoData.ext ? videoData.ext : 'VIDEO';
    meta.innerHTML = `<span>${extLabel}</span><span>${videoData.unit}</span>`;

    const actions = document.createElement('div');
    actions.className = 'card__actions';

    const view = document.createElement('a');
    view.href = videoData.file;
    view.target = '_blank';
    view.rel = 'noopener';
    view.textContent = 'Play';

    const download = document.createElement('a');
    download.href = videoData.file;
    download.textContent = 'Download';
    download.setAttribute('download', '');

    actions.append(view, download);
    card.append(meta, actions);
    fragment.append(card);
  });

  target.append(fragment);
}

function updateUI() {
  const videos = flattenVideos(data?.subjects || []).filter(matchesFilters);
  renderCards(videos, grid);
  empty.hidden = videos.length !== 0;
  count.textContent = `${videos.length} videos`;
}

function setActiveChips(container, value) {
  Array.from(container.querySelectorAll('.chip')).forEach((chip) => {
    chip.classList.toggle('is-active', chip.dataset.value === value);
  });
}

function addChip(container, value, label, handler) {
  const chip = document.createElement('button');
  chip.className = 'chip';
  chip.dataset.value = value;
  chip.type = 'button';
  chip.textContent = label;
  chip.addEventListener('click', handler);
  container.append(chip);
}

function buildUnitChips() {
  unitChips.innerHTML = '';

  addChip(unitChips, 'all', 'All units', () => {
    state.unit = 'all';
    setActiveChips(unitChips, state.unit);
    updateUI();
  });

  const units = getUnitsForSubject(state.subject);
  units.forEach((unit) => {
    addChip(unitChips, unit, unit, () => {
      state.unit = unit;
      setActiveChips(unitChips, state.unit);
      updateUI();
    });
  });

  if (state.unit !== 'all' && !units.includes(state.unit)) {
    state.unit = 'all';
  }

  setActiveChips(unitChips, state.unit);
}

function buildChips() {
  subjectChips.innerHTML = '';

  addChip(subjectChips, 'all', 'All subjects', () => {
    state.subject = 'all';
    setActiveChips(subjectChips, state.subject);
    buildUnitChips();
    updateUI();
  });

  const subjects = getUnifiedSubjectNames();

  subjects.forEach((subject) => {
    addChip(subjectChips, subject, subject, () => {
      state.subject = subject;
      setActiveChips(subjectChips, state.subject);
      buildUnitChips();
      updateUI();
    });
  });

  if (state.subject !== 'all' && !subjects.includes(state.subject)) {
    state.subject = 'all';
  }

  setActiveChips(subjectChips, state.subject);
  buildUnitChips();
}

if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    updateUI();
  });
}

if (uploadToggle) {
  uploadToggle.addEventListener('click', () => toggleModal(uploadModal, true));
}

if (uploadClose) {
  uploadClose.addEventListener('click', () => toggleModal(uploadModal, false));
}

if (uploadBackdrop) {
  uploadBackdrop.addEventListener('click', () => toggleModal(uploadModal, false));
}

if (uploadSubject) {
  uploadSubject.addEventListener('change', () => {
    if (uploadSubjectRow) {
      uploadSubjectRow.classList.add('is-hidden');
    }
    buildUploadUnits();
  });
}

if (uploadUnit) {
  uploadUnit.addEventListener('change', () => {
    if (!uploadUnitRow) return;
    uploadUnitRow.classList.toggle('is-hidden', uploadUnit.value !== NEW_UNIT_VALUE);
  });
}

if (uploadSubmit) {
  uploadSubmit.addEventListener('click', handleUpload);
}

if (settingsToggle) {
  settingsToggle.addEventListener('click', () => toggleModal(settingsModal, true));
}

if (settingsClose) {
  settingsClose.addEventListener('click', () => toggleModal(settingsModal, false));
}

if (settingsBackdrop) {
  settingsBackdrop.addEventListener('click', () => toggleModal(settingsModal, false));
}

if (settingsSave) {
  settingsSave.addEventListener('click', () => {
    settings.showPreview = settingPreview?.checked !== false;
    settings.compact = Boolean(settingCompact?.checked);
    saveSettings();
    applySettings();
    updateUI();
    toggleModal(settingsModal, false);
  });
}

function initContent() {
  if (!data) return;
  updated.textContent = formatDate(data.generatedAt);
  buildChips();
  buildUploadSubjects();
  updateUI();
}

async function loadTrackSubjectNames() {
  if (typeof fetch !== 'function') {
    return readTrackSubjectsFromStorage();
  }
  try {
    const response = await fetch(TRACK_SUBJECT_ENDPOINT, { cache: 'no-store' });
    if (!response.ok) return readTrackSubjectsFromStorage();
    const payload = await response.json();
    if (!Array.isArray(payload.subjects)) return readTrackSubjectsFromStorage();
    const names = payload.subjects
      .map((subject) => formatSubjectName(subject.name))
      .filter(Boolean);
    return names.length ? names : readTrackSubjectsFromStorage();
  } catch {
    return readTrackSubjectsFromStorage();
  }
}

function readTrackSubjectsFromStorage() {
  try {
    const raw = localStorage.getItem('embertrack-data-v1');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.subjects)) return [];
    return parsed.subjects
      .map((subject) => formatSubjectName(subject.name))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function primeTrackSubjectsFromStorage() {
  const names = readTrackSubjectsFromStorage();
  if (names.length) {
    setTrackSubjectNames(names);
  }
}

initContent();
primeTrackSubjectsFromStorage();
const refreshTrackSubjects = () =>
  loadTrackSubjectNames()
    .then((names) => setTrackSubjectNames(names))
    .catch(() => setTrackSubjectNames([]));

refreshTrackSubjects();
setInterval(refreshTrackSubjects, SUBJECT_POLL_MS);
window.addEventListener('focus', refreshTrackSubjects);
