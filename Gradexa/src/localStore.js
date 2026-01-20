const nowIso = () => new Date().toISOString();
const makeId = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const STORAGE_KEY = "embertrack-data-v1";
const LEGACY_STORAGE_KEY = "gradexa-data-v1";
const STORAGE_EVENT = "embertrack-storage";
const SERVER_ENDPOINT = "/api/embertrack";
const SYNC_DEBOUNCE_MS = 400;
let syncTimer = null;

const defaultData = {
  profile: { name: "Student", birthday: "", dailyTarget: 60 },
  subjects: [
    { id: "subject-1", name: "Combined maths", created_at: nowIso() },
    { id: "subject-2", name: "Physics", created_at: nowIso() },
    { id: "subject-3", name: "Chemistry", created_at: nowIso() },
  ],
  marks: [],
  todos: [],
  studySessions: [],
  notes: "",
  goals: [],
};

const canSync = () =>
  typeof window !== "undefined" && typeof fetch === "function";

const readStore = () => {
  if (typeof localStorage === "undefined") return { ...defaultData };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const parsedLegacy = JSON.parse(legacyRaw);
        const mergedLegacy = { ...defaultData, ...parsedLegacy };
        writeStore(mergedLegacy);
        return mergedLegacy;
      }
      writeStore({ ...defaultData });
      return { ...defaultData };
    }
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed };
  } catch {
    writeStore({ ...defaultData });
    return { ...defaultData };
  }
};

const scheduleServerSync = (data) => {
  if (!canSync()) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    syncTimer = null;
    try {
      await fetch(SERVER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Ignore sync errors; local storage remains source of truth.
    }
  }, SYNC_DEBOUNCE_MS);
};

const writeStore = (data, options = {}) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }
  if (options.sync !== false) {
    scheduleServerSync(data);
  }
};

const normalizeData = (data) => ({
  profile: { ...defaultData.profile, ...(data.profile || {}) },
  subjects: Array.isArray(data.subjects) ? data.subjects : [],
  marks: Array.isArray(data.marks) ? data.marks : [],
  todos: Array.isArray(data.todos) ? data.todos : [],
  studySessions: Array.isArray(data.studySessions) ? data.studySessions : [],
  notes: typeof data.notes === "string" ? data.notes : "",
  goals: Array.isArray(data.goals) ? data.goals : [],
});

export const getProfile = () => readStore().profile;

export const saveProfile = (profile) => {
  const data = readStore();
  data.profile = { ...data.profile, ...profile };
  writeStore(data);
  return data.profile;
};

export const getSubjects = () => readStore().subjects;

export const addSubject = (name) => {
  const data = readStore();
  const subject = { id: makeId(), name, created_at: nowIso() };
  data.subjects = [...data.subjects, subject];
  writeStore(data);
  return subject;
};

export const removeSubject = (id) => {
  const data = readStore();
  data.subjects = data.subjects.filter((s) => s.id !== id);
  writeStore(data);
};

export const getMarks = () => readStore().marks;

export const addMark = (mark) => {
  const data = readStore();
  const row = { id: makeId(), created_at: nowIso(), ...mark };
  data.marks = [row, ...data.marks];
  writeStore(data);
  return row;
};

export const updateMark = (id, updates) => {
  const data = readStore();
  data.marks = data.marks.map((m) => (m.id === id ? { ...m, ...updates } : m));
  writeStore(data);
};

export const deleteMark = (id) => {
  const data = readStore();
  data.marks = data.marks.filter((m) => m.id !== id);
  writeStore(data);
};

export const getTodos = () => readStore().todos;

export const addTodo = (todo) => {
  const data = readStore();
  const row = {
    id: makeId(),
    created_at: nowIso(),
    completed: false,
    ...todo,
  };
  data.todos = [row, ...data.todos];
  writeStore(data);
  return row;
};

export const updateTodo = (id, updates) => {
  const data = readStore();
  data.todos = data.todos.map((t) => (t.id === id ? { ...t, ...updates } : t));
  writeStore(data);
};

export const deleteTodo = (id) => {
  const data = readStore();
  data.todos = data.todos.filter((t) => t.id !== id);
  writeStore(data);
};

export const getStudySessions = () => readStore().studySessions;

export const addStudySession = (session) => {
  const data = readStore();
  const row = { id: makeId(), created_at: nowIso(), ...session };
  data.studySessions = [...data.studySessions, row];
  writeStore(data);
  return row;
};

export const getNotes = () => readStore().notes || "";

export const saveNotes = (notes) => {
  const data = readStore();
  data.notes = notes;
  writeStore(data);
  return notes;
};

export const getGoals = () => readStore().goals;

export const addGoal = (title) => {
  const data = readStore();
  const row = { id: makeId(), title, completed: false, created_at: nowIso() };
  data.goals = [row, ...data.goals];
  writeStore(data);
  return row;
};

export const toggleGoal = (id) => {
  const data = readStore();
  data.goals = data.goals.map((g) =>
    g.id === id ? { ...g, completed: !g.completed } : g
  );
  writeStore(data);
};

export const deleteGoal = (id) => {
  const data = readStore();
  data.goals = data.goals.filter((g) => g.id !== id);
  writeStore(data);
};

export const exportData = () => readStore();

export const importData = (payload) => {
  const data = normalizeData(payload || {});
  writeStore(data);
  return data;
};

export const resetStore = () => {
  writeStore({ ...defaultData });
};

export const syncFromServer = async () => {
  if (!canSync()) return false;
  const local = readStore();
  try {
    const res = await fetch(SERVER_ENDPOINT, { cache: "no-store" });
    if (res.status === 404) {
      scheduleServerSync(local);
      return false;
    }
    if (!res.ok) return false;
    const payload = await res.json();
    if (!payload || typeof payload !== "object") return false;
    const server = normalizeData(payload);

    const score = (data) =>
      (data.marks?.length || 0) * 2 +
      (data.studySessions?.length || 0) * 2 +
      (data.todos?.length || 0) +
      (data.goals?.length || 0) +
      (data.notes ? 1 : 0);

    const localScore = score(local);
    const serverScore = score(server);

    if (localScore > serverScore) {
      scheduleServerSync(local);
      return true;
    }

    writeStore(server, { sync: false });
    return true;
  } catch {
    return false;
  }
};
