const data = window.TUTES_DATA;
const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const count = document.getElementById('count');
const updated = document.getElementById('updated');
const searchInput = document.getElementById('search');
const subjectChips = document.getElementById('subjectChips');
const typeChips = document.getElementById('typeChips');

const state = {
  subject: 'all',
  type: 'all',
  query: '',
};

function formatDate(isoString) {
  if (!isoString) return 'Updated recently';
  const date = new Date(isoString);
  return `Updated ${date.toLocaleDateString()}`;
}

function flattenSubjects(subjects) {
  return subjects.flatMap((subject) => {
    const theory = (subject.theory || []).map((tute) => ({
      ...tute,
      subject: subject.subject,
      type: 'Theory',
    }));
    const revision = (subject.revision || []).map((tute) => ({
      ...tute,
      subject: subject.subject,
      type: 'Revision',
    }));
    return [...theory, ...revision];
  });
}

function matchesFilters(tute) {
  const subjectMatch = state.subject === 'all' || tute.subject === state.subject;
  const typeMatch = state.type === 'all' || tute.type === state.type;
  const query = state.query.trim().toLowerCase();
  if (!query) return subjectMatch && typeMatch;
  const haystack = `${tute.title} ${tute.year} ${tute.subject} ${tute.type}`.toLowerCase();
  return subjectMatch && typeMatch && haystack.includes(query);
}

function renderCards(tutes) {
  grid.innerHTML = '';
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

    actions.append(view, download);
    card.append(tags, title, meta, actions);
    fragment.append(card);
  });

  grid.append(fragment);
}

function updateUI() {
  const tutes = flattenSubjects(data?.subjects || []).filter(matchesFilters);
  renderCards(tutes);
  empty.hidden = tutes.length !== 0;
  count.textContent = `${tutes.length} tutes`;
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

  const subjects = (data?.subjects || [])
    .map((subject) => subject.subject)
    .sort((a, b) => a.localeCompare(b));

  subjects.forEach((subject) => {
    addChip(subjectChips, subject, subject, () => {
      state.subject = subject;
      setActiveChips(subjectChips, state.subject);
      updateUI();
    });
  });

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

if (data) {
  updated.textContent = formatDate(data.generatedAt);
  buildChips();
  updateUI();
}
