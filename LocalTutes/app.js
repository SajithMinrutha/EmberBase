const data = window.TUTES_DATA;
const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const otherSection = document.getElementById('otherSection');
const otherGrid = document.getElementById('otherGrid');
const otherEmpty = document.getElementById('otherEmpty');
const count = document.getElementById('count');
const updated = document.getElementById('updated');
const searchInput = document.getElementById('search');
const subjectChips = document.getElementById('subjectChips');
const typeChips = document.getElementById('typeChips');
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
const uploadType = document.getElementById('uploadType');
const uploadLibrary = document.getElementById('uploadLibrary');
const uploadSubmit = document.getElementById('uploadSubmit');
const uploadStatus = document.getElementById('uploadStatus');

const state = {
  subject: 'all',
  type: 'all',
  query: '',
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
      '--surface': 'rgba(20, 16, 10, 0.88)',
      '--surface-strong': 'rgba(20, 16, 10, 0.96)',
      '--line': 'rgba(251, 191, 36, 0.18)',
      '--accent': '#fbbf24',
      '--accent-2': '#f97316',
      '--accent-3': '#b45309',
      '--accent-soft': 'rgba(251, 191, 36, 0.22)',
      '--accent-border': 'rgba(251, 191, 36, 0.32)',
      '--accent-shadow': 'rgba(251, 191, 36, 0.32)',
      '--glow-1': 'rgba(251, 191, 36, 0.28)',
      '--glow-2': 'rgba(249, 115, 22, 0.22)',
      '--glow-3': 'rgba(255, 255, 255, 0.05)',
      '--ink-900': '#fff7ed',
      '--ink-700': '#f3d6a5',
      '--ink-400': '#c8a978',
      '--sand-100': '#140e08',
      '--sand-200': '#1b130b',
      '--shadow': '0 24px 60px rgba(12, 7, 4, 0.6)',
    },
  },
  sunrise: {
    label: 'Sunrise',
    vars: {
      '--bg-1': '#150a10',
      '--bg-2': '#1d1017',
      '--bg-3': '#271421',
      '--surface': 'rgba(22, 14, 20, 0.88)',
      '--surface-strong': 'rgba(22, 14, 20, 0.96)',
      '--line': 'rgba(244, 114, 182, 0.18)',
      '--accent': '#f472b6',
      '--accent-2': '#fb923c',
      '--accent-3': '#be185d',
      '--accent-soft': 'rgba(244, 114, 182, 0.22)',
      '--accent-border': 'rgba(244, 114, 182, 0.32)',
      '--accent-shadow': 'rgba(244, 114, 182, 0.32)',
      '--glow-1': 'rgba(244, 114, 182, 0.28)',
      '--glow-2': 'rgba(251, 146, 60, 0.22)',
      '--glow-3': 'rgba(255, 255, 255, 0.05)',
      '--ink-900': '#fff1f2',
      '--ink-700': '#fbcfe8',
      '--ink-400': '#f3a6c4',
      '--sand-100': '#150a10',
      '--sand-200': '#1d1017',
      '--shadow': '0 24px 60px rgba(12, 6, 10, 0.6)',
    },
  },
  ember: {
    label: 'Ember',
    vars: {
      '--bg-1': '#16090b',
      '--bg-2': '#1f0d11',
      '--bg-3': '#291119',
      '--surface': 'rgba(22, 10, 16, 0.88)',
      '--surface-strong': 'rgba(22, 10, 16, 0.96)',
      '--line': 'rgba(244, 63, 94, 0.18)',
      '--accent': '#f43f5e',
      '--accent-2': '#f97316',
      '--accent-3': '#be123c',
      '--accent-soft': 'rgba(244, 63, 94, 0.22)',
      '--accent-border': 'rgba(244, 63, 94, 0.32)',
      '--accent-shadow': 'rgba(244, 63, 94, 0.32)',
      '--glow-1': 'rgba(244, 63, 94, 0.28)',
      '--glow-2': 'rgba(249, 115, 22, 0.22)',
      '--glow-3': 'rgba(255, 255, 255, 0.05)',
      '--ink-900': '#fff1f2',
      '--ink-700': '#fecaca',
      '--ink-400': '#f59aa7',
      '--sand-100': '#16090b',
      '--sand-200': '#1f0d11',
      '--shadow': '0 24px 60px rgba(12, 5, 8, 0.6)',
    },
  },
  noir: {
    label: 'Noir',
    vars: {
      '--bg-1': '#050505',
      '--bg-2': '#0a0a0f',
      '--bg-3': '#121216',
      '--surface': 'rgba(10, 10, 14, 0.88)',
      '--surface-strong': 'rgba(10, 10, 14, 0.96)',
      '--line': 'rgba(163, 230, 53, 0.18)',
      '--accent': '#a3e635',
      '--accent-2': '#38bdf8',
      '--accent-3': '#4d7c0f',
      '--accent-soft': 'rgba(163, 230, 53, 0.22)',
      '--accent-border': 'rgba(163, 230, 53, 0.32)',
      '--accent-shadow': 'rgba(163, 230, 53, 0.32)',
      '--glow-1': 'rgba(163, 230, 53, 0.28)',
      '--glow-2': 'rgba(56, 189, 248, 0.22)',
      '--glow-3': 'rgba(255, 255, 255, 0.05)',
      '--ink-900': '#f8fafc',
      '--ink-700': '#d9f99d',
      '--ink-400': '#9ccb5d',
      '--sand-100': '#050505',
      '--sand-200': '#0a0a0f',
      '--shadow': '0 24px 60px rgba(0, 0, 0, 0.72)',
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

initThemeSwitch();

function formatDate(isoString) {
  if (!isoString) return 'Updated recently';
  const date = new Date(isoString);
  return `Updated ${date.toLocaleDateString()}`;
}

function getLocalSubjectNames() {
  return [
    ...(data?.subjects || []).map((subject) => subject.subject),
    ...(data?.otherSubjects || []).map((subject) => subject.subject),
  ].filter(Boolean);
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

function getDisplaySubject(subjectName) {
  const normalized = normalizeSubject(subjectName);
  const map = getTrackSubjectMap();
  return map.get(normalized) || subjectName;
}

function flattenSubjects(subjects) {
  return subjects.flatMap((subject) => {
    const theory = (subject.theory || []).map((tute) => ({
      ...tute,
      subject: getDisplaySubject(subject.subject),
      type: 'Theory',
    }));
    const revision = (subject.revision || []).map((tute) => ({
      ...tute,
      subject: getDisplaySubject(subject.subject),
      type: 'Revision',
    }));
    return [...theory, ...revision];
  });
}

function matchesFilters(tute) {
  const allowedSubjects = getTrackSubjectMap();
  const normalized = normalizeSubject(tute.subject);
  const allowedMatch =
    allowedSubjects.size === 0 || allowedSubjects.has(normalized);
  const subjectMatch =
    allowedMatch &&
    (state.subject === 'all' || normalizeSubject(state.subject) === normalized);
  const typeMatch = state.type === 'all' || tute.type === state.type;
  const query = state.query.trim().toLowerCase();
  if (!query) return subjectMatch && typeMatch;
  const haystack = `${tute.title} ${tute.year} ${tute.subject} ${tute.type}`.toLowerCase();
  return subjectMatch && typeMatch && haystack.includes(query);
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
    setUploadStatus('Add subjects in EmberTrack to upload tutes.');
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

async function handleUpload() {
  if (!uploadFile || !uploadSubmit) return;
  const file = uploadFile.files?.[0];
  if (!file) {
    setUploadStatus('Choose a PDF file.');
    return;
  }
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    setUploadStatus('Only PDF files are supported.');
    return;
  }
  const subjectValue = uploadSubject?.value || '';
  if (!subjectValue) {
    setUploadStatus('Add a subject name.');
    return;
  }
  const typeValue = uploadType?.value || '';
  if (!typeValue) {
    setUploadStatus('Select a tute type.');
    return;
  }
  const library = uploadLibrary?.value || 'main';
  try {
    uploadSubmit.disabled = true;
    uploadFile.disabled = true;
    if (uploadSubject) uploadSubject.disabled = true;
    if (uploadSubjectNew) uploadSubjectNew.disabled = true;
    if (uploadType) uploadType.disabled = true;
    if (uploadLibrary) uploadLibrary.disabled = true;
    setUploadStatus('Uploading...');
    const base64 = await readFileAsBase64(file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'emberstudy',
        bucket: library,
        subject: subjectValue,
        type: typeValue,
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
        ? 'File too large. Try a smaller PDF.'
        : 'Upload failed. Please try again.';
    setUploadStatus(message);
  } finally {
    uploadSubmit.disabled = false;
    uploadFile.disabled = false;
    if (uploadSubject) uploadSubject.disabled = false;
    if (uploadSubjectNew) uploadSubjectNew.disabled = false;
    if (uploadType) uploadType.disabled = false;
    if (uploadLibrary) uploadLibrary.disabled = false;
  }
}

function toggleUploadModal(nextState) {
  if (!uploadModal) return;
  const shouldOpen =
    typeof nextState === 'boolean'
      ? nextState
      : !uploadModal.classList.contains('is-open');
  uploadModal.classList.toggle('is-open', shouldOpen);
  uploadModal.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
}

async function renameFile(filePath) {
  const currentName = decodeURIComponent(filePath.split('/').pop() || '');
  const baseName = currentName.replace(/\.pdf$/i, '');
  const next = window.prompt('Rename file', baseName);
  if (!next) return;
  const newName = next.trim();
  if (!newName) return;
  try {
    const res = await fetch('/api/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'emberstudy',
        filePath,
        newName,
      }),
    });
    if (!res.ok) {
      window.alert('Rename failed. Please try again.');
      return;
    }
    window.location.reload();
  } catch {
    window.alert('Rename failed. Please try again.');
  }
}

function renderCards(tutes, target) {
  target.innerHTML = '';
  const fragment = document.createDocumentFragment();

  tutes.forEach((tute) => {
    const card = document.createElement('article');
    card.className = 'card';

    const tags = document.createElement('div');
    tags.className = 'card__tags';
    tags.innerHTML = `
      <span class="tag">${tute.subject}</span>
      <span class="tag tag--type">${tute.type}</span>
    `;

    const title = document.createElement('div');
    title.className = 'card__title';
    title.textContent = tute.title;

    const meta = document.createElement('div');
    meta.className = 'card__meta';
    meta.innerHTML = `<span>${tute.year || 'Year n/a'}</span><span>PDF</span>`;

    const actions = document.createElement('div');
    actions.className = 'card__actions';

    const view = document.createElement('a');
    view.href = tute.file;
    view.target = '_blank';
    view.rel = 'noopener';
    view.textContent = 'View';

    const download = document.createElement('a');
    download.href = tute.file;
    download.textContent = 'Download';
    download.setAttribute('download', '');

    const rename = document.createElement('button');
    rename.type = 'button';
    rename.textContent = 'Rename';
    rename.addEventListener('click', () => {
      renameFile(tute.file);
    });

    actions.append(view, download, rename);
    card.append(tags, title, meta, actions);
    fragment.append(card);
  });

  target.append(fragment);
}

function updateUI() {
  const tutes = flattenSubjects(data?.subjects || []).filter(matchesFilters);
  renderCards(tutes, grid);
  empty.hidden = tutes.length !== 0;
  count.textContent = `${tutes.length} tutes`;

  const otherTutes = flattenSubjects(data?.otherSubjects || []).filter(matchesFilters);
  if (otherSection) {
    otherSection.hidden = (data?.otherSubjects || []).length === 0;
  }
  if (otherGrid) {
    renderCards(otherTutes, otherGrid);
  }
  if (otherEmpty) {
    otherEmpty.hidden = otherTutes.length !== 0;
  }
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

function buildChips() {
  subjectChips.innerHTML = '';
  typeChips.innerHTML = '';

  addChip(subjectChips, 'all', 'All subjects', () => {
    state.subject = 'all';
    setActiveChips(subjectChips, state.subject);
    updateUI();
  });

  const subjects = getUnifiedSubjectNames();

  subjects.forEach((subject) => {
    addChip(subjectChips, subject, subject, () => {
      state.subject = subject;
      setActiveChips(subjectChips, state.subject);
      updateUI();
    });
  });

  if (state.subject !== 'all' && !subjects.includes(state.subject)) {
    state.subject = 'all';
  }

  const types = ['Theory', 'Revision'];
  addChip(typeChips, 'all', 'All types', () => {
    state.type = 'all';
    setActiveChips(typeChips, state.type);
    updateUI();
  });

  types.forEach((type) => {
    addChip(typeChips, type, type, () => {
      state.type = type;
      setActiveChips(typeChips, state.type);
      updateUI();
    });
  });

  setActiveChips(subjectChips, state.subject);
  setActiveChips(typeChips, state.type);
}

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  updateUI();
});

if (uploadToggle) {
  uploadToggle.addEventListener('click', () => toggleUploadModal(true));
}

if (uploadClose) {
  uploadClose.addEventListener('click', () => toggleUploadModal(false));
}

if (uploadBackdrop) {
  uploadBackdrop.addEventListener('click', () => toggleUploadModal(false));
}

if (uploadSubject) {
  uploadSubject.addEventListener('change', () => {
    if (uploadSubjectRow) {
      uploadSubjectRow.classList.add('is-hidden');
    }
  });
}

if (uploadSubmit) {
  uploadSubmit.addEventListener('click', handleUpload);
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
