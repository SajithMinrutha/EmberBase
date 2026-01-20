const data = window.PAPERS_DATA;
const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const count = document.getElementById('count');
const updated = document.getElementById('updated');
const searchInput = document.getElementById('search');
const chips = Array.from(document.querySelectorAll('.chip'));

const state = {
  filter: 'all',
  query: '',
};

function formatDate(isoString) {
  if (!isoString) return 'Updated recently';
  const date = new Date(isoString);
  return `Updated ${date.toLocaleDateString()}`;
}

function flattenSubjects(subjects) {
  return subjects.flatMap((subject) =>
    subject.papers.map((paper) => ({
      ...paper,
      subject: subject.subject,
    }))
  );
}

function matchesFilters(paper) {
  const filterMatches = state.filter === 'all' || paper.subject === state.filter;
  const query = state.query.trim().toLowerCase();
  if (!query) return filterMatches;
  const haystack = `${paper.title} ${paper.year} ${paper.subject}`.toLowerCase();
  return filterMatches && haystack.includes(query);
}

function renderCards(papers) {
  grid.innerHTML = '';
  const fragment = document.createDocumentFragment();

  papers.forEach((paper) => {
    const card = document.createElement('article');
    card.className = 'card';

    const subject = document.createElement('div');
    subject.className = 'card__subject';
    subject.textContent = paper.subject;

    const title = document.createElement('div');
    title.className = 'card__title';
    title.textContent = paper.title;

    const meta = document.createElement('div');
    meta.className = 'card__meta';
    meta.innerHTML = `<span>${paper.year || 'Year n/a'}</span><span>PDF</span>`;

    const actions = document.createElement('div');
    actions.className = 'card__actions';

    const view = document.createElement('a');
    view.href = paper.file;
    view.target = '_blank';
    view.rel = 'noopener';
    view.textContent = 'View';

    const download = document.createElement('a');
    download.href = paper.file;
    download.setAttribute('download', '');
    download.textContent = 'Download';

    actions.append(view, download);
    card.append(subject, title, meta, actions);
    fragment.append(card);
  });

  grid.append(fragment);
}

function updateUI() {
  const papers = flattenSubjects(data.subjects).filter(matchesFilters);
  renderCards(papers);
  empty.hidden = papers.length !== 0;
  count.textContent = `${papers.length} papers`;
}

function setActiveChip(value) {
  chips.forEach((chip) => {
    chip.classList.toggle('is-active', chip.dataset.filter === value);
  });
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    state.filter = chip.dataset.filter;
    setActiveChip(state.filter);
    updateUI();
  });
});

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  updateUI();
});

if (data) {
  updated.textContent = formatDate(data.generatedAt);
  updateUI();
}
