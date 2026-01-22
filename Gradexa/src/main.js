import {
  addMark,
  addStudySession,
  addSubject,
  addTodo,
  deleteMark,
  deleteStudySession,
  deleteTodo,
  exportData,
  getMarks,
  getProfile,
  getStudySessions,
  getSubjects,
  getTodos,
  importData,
  addGoal,
  deleteGoal,
  getGoals,
  getNotes,
  saveNotes,
  toggleGoal,
  removeSubject,
  resetStore,
  saveProfile,
  updateMark,
  updateStudySession,
  updateTodo,
  syncFromServer,
} from "./localStore.js";

const state = {
  activeView: window.location.hash.replace("#", "") || "dashboard",
  editingMarkId: null,
  editingSessionId: null,
  todoFilter: "all",
  timerSeconds: 1500,
  timerInterval: null,
};

const THEME_STORAGE = "emberbase-theme";
const THEMES = {
  mono: {
    label: "Mono",
    vars: {
      "--bg-1": "#050505",
      "--bg-2": "#0b0b0b",
      "--bg-3": "#141414",
      "--surface": "rgba(12, 12, 12, 0.88)",
      "--surface-strong": "rgba(12, 12, 12, 0.96)",
      "--line": "rgba(255, 255, 255, 0.12)",
      "--accent": "#f8fafc",
      "--accent-strong": "#e5e7eb",
      "--accent-warm": "#e5e7eb",
      "--accent-deep": "#9ca3af",
      "--accent-sky": "#cbd5e1",
      "--chart-actual": "#f59e0b",
      "--chart-target": "#e5e7eb",
      "--accent-soft": "rgba(255, 255, 255, 0.12)",
      "--accent-border": "rgba(255, 255, 255, 0.18)",
      "--accent-shadow": "rgba(248, 250, 252, 0.2)",
      "--glow-1": "rgba(255, 255, 255, 0.12)",
      "--glow-2": "rgba(255, 255, 255, 0.08)",
      "--glow-3": "rgba(255, 255, 255, 0.06)",
      "--text-strong": "#f8fafc",
      "--text-muted": "#b3b3b3",
      "--shadow": "0 24px 60px rgba(0, 0, 0, 0.7)",
    },
  },
  slate: {
    label: "Slate",
    vars: {
      "--bg-1": "#060811",
      "--bg-2": "#0b1020",
      "--bg-3": "#12172b",
      "--surface": "rgba(13, 18, 33, 0.88)",
      "--surface-strong": "rgba(13, 18, 33, 0.96)",
      "--line": "rgba(139, 92, 246, 0.18)",
      "--accent": "#8b5cf6",
      "--accent-strong": "#a78bfa",
      "--accent-warm": "#22d3ee",
      "--accent-deep": "#5b21b6",
      "--accent-sky": "#60a5fa",
      "--chart-actual": "#22d3ee",
      "--chart-target": "#a78bfa",
      "--accent-soft": "rgba(139, 92, 246, 0.22)",
      "--accent-border": "rgba(139, 92, 246, 0.32)",
      "--accent-shadow": "rgba(139, 92, 246, 0.32)",
      "--glow-1": "rgba(139, 92, 246, 0.28)",
      "--glow-2": "rgba(34, 211, 238, 0.22)",
      "--glow-3": "rgba(255, 255, 255, 0.05)",
      "--text-strong": "#f8fafc",
      "--text-muted": "#c7d2fe",
      "--shadow": "0 24px 60px rgba(6, 8, 24, 0.65)",
    },
  },
  cobalt: {
    label: "Cobalt",
    vars: {
      "--bg-1": "#050b16",
      "--bg-2": "#0a1430",
      "--bg-3": "#111c3b",
      "--surface": "rgba(10, 18, 34, 0.88)",
      "--surface-strong": "rgba(10, 18, 34, 0.96)",
      "--line": "rgba(56, 189, 248, 0.18)",
      "--accent": "#38bdf8",
      "--accent-strong": "#60a5fa",
      "--accent-warm": "#f472b6",
      "--accent-deep": "#1d4ed8",
      "--accent-sky": "#a78bfa",
      "--chart-actual": "#f472b6",
      "--chart-target": "#60a5fa",
      "--accent-soft": "rgba(56, 189, 248, 0.22)",
      "--accent-border": "rgba(56, 189, 248, 0.32)",
      "--accent-shadow": "rgba(56, 189, 248, 0.32)",
      "--glow-1": "rgba(56, 189, 248, 0.28)",
      "--glow-2": "rgba(244, 114, 182, 0.22)",
      "--glow-3": "rgba(255, 255, 255, 0.05)",
      "--text-strong": "#f8fafc",
      "--text-muted": "#c7d2fe",
      "--shadow": "0 24px 60px rgba(4, 8, 22, 0.65)",
    },
  },
  ocean: {
    label: "Ocean",
    vars: {
      "--bg-1": "#031316",
      "--bg-2": "#062026",
      "--bg-3": "#0b2b33",
      "--surface": "rgba(7, 26, 32, 0.88)",
      "--surface-strong": "rgba(7, 26, 32, 0.96)",
      "--line": "rgba(34, 211, 238, 0.18)",
      "--accent": "#22d3ee",
      "--accent-strong": "#0ea5e9",
      "--accent-warm": "#34d399",
      "--accent-deep": "#0f766e",
      "--accent-sky": "#5eead4",
      "--chart-actual": "#34d399",
      "--chart-target": "#0ea5e9",
      "--accent-soft": "rgba(34, 211, 238, 0.22)",
      "--accent-border": "rgba(34, 211, 238, 0.32)",
      "--accent-shadow": "rgba(34, 211, 238, 0.32)",
      "--glow-1": "rgba(34, 211, 238, 0.28)",
      "--glow-2": "rgba(52, 211, 153, 0.22)",
      "--glow-3": "rgba(255, 255, 255, 0.05)",
      "--text-strong": "#f8fafc",
      "--text-muted": "#b5f2e6",
      "--shadow": "0 24px 60px rgba(2, 8, 18, 0.62)",
    },
  },
  aurora: {
    label: "Aurora",
    vars: {
      "--bg-1": "#061118",
      "--bg-2": "#0a1b24",
      "--bg-3": "#112534",
      "--surface": "rgba(9, 26, 34, 0.88)",
      "--surface-strong": "rgba(9, 26, 34, 0.96)",
      "--line": "rgba(94, 234, 212, 0.18)",
      "--accent": "#5eead4",
      "--accent-strong": "#22d3ee",
      "--accent-warm": "#a855f7",
      "--accent-deep": "#6d28d9",
      "--accent-sky": "#c084fc",
      "--chart-actual": "#a855f7",
      "--chart-target": "#22d3ee",
      "--accent-soft": "rgba(94, 234, 212, 0.22)",
      "--accent-border": "rgba(94, 234, 212, 0.32)",
      "--accent-shadow": "rgba(94, 234, 212, 0.32)",
      "--glow-1": "rgba(94, 234, 212, 0.28)",
      "--glow-2": "rgba(168, 85, 247, 0.22)",
      "--glow-3": "rgba(255, 255, 255, 0.05)",
      "--text-strong": "#f8fafc",
      "--text-muted": "#c7f9f1",
      "--shadow": "0 24px 60px rgba(3, 9, 18, 0.62)",
    },
  },
  moss: {
    label: "Moss",
    vars: {
      "--bg-1": "#06110c",
      "--bg-2": "#0a1b14",
      "--bg-3": "#12251c",
      "--surface": "rgba(10, 25, 19, 0.88)",
      "--surface-strong": "rgba(10, 25, 19, 0.96)",
      "--line": "rgba(52, 211, 153, 0.18)",
      "--accent": "#34d399",
      "--accent-strong": "#22c55e",
      "--accent-warm": "#a3e635",
      "--accent-deep": "#047857",
      "--accent-sky": "#86efac",
      "--chart-actual": "#a3e635",
      "--chart-target": "#22c55e",
      "--accent-soft": "rgba(52, 211, 153, 0.22)",
      "--accent-border": "rgba(52, 211, 153, 0.32)",
      "--accent-shadow": "rgba(52, 211, 153, 0.32)",
      "--glow-1": "rgba(52, 211, 153, 0.28)",
      "--glow-2": "rgba(163, 230, 53, 0.22)",
      "--glow-3": "rgba(255, 255, 255, 0.05)",
      "--text-strong": "#f8fafc",
      "--text-muted": "#c5f2da",
      "--shadow": "0 24px 60px rgba(4, 10, 18, 0.62)",
    },
  },
  dune: {
    label: "Dune",
    vars: {
      "--bg-1": "#140e08",
      "--bg-2": "#1b130b",
      "--bg-3": "#241a10",
      "--surface": "rgba(20, 16, 10, 0.88)",
      "--surface-strong": "rgba(20, 16, 10, 0.96)",
      "--line": "rgba(251, 191, 36, 0.18)",
      "--accent": "#fbbf24",
      "--accent-strong": "#f59e0b",
      "--accent-warm": "#f97316",
      "--accent-deep": "#b45309",
      "--accent-sky": "#fdba74",
      "--chart-actual": "#f97316",
      "--chart-target": "#f59e0b",
      "--accent-soft": "rgba(251, 191, 36, 0.22)",
      "--accent-border": "rgba(251, 191, 36, 0.32)",
      "--accent-shadow": "rgba(251, 191, 36, 0.32)",
      "--glow-1": "rgba(251, 191, 36, 0.28)",
      "--glow-2": "rgba(249, 115, 22, 0.22)",
      "--glow-3": "rgba(255, 255, 255, 0.05)",
      "--text-strong": "#fff7ed",
      "--text-muted": "#f3d6a5",
      "--shadow": "0 24px 60px rgba(12, 7, 4, 0.6)",
    },
  },
  sunrise: {
    label: "Sunrise",
    vars: {
      "--bg-1": "#150a10",
      "--bg-2": "#1d1017",
      "--bg-3": "#271421",
      "--surface": "rgba(22, 14, 20, 0.88)",
      "--surface-strong": "rgba(22, 14, 20, 0.96)",
      "--line": "rgba(244, 114, 182, 0.18)",
      "--accent": "#f472b6",
      "--accent-strong": "#fb7185",
      "--accent-warm": "#fb923c",
      "--accent-deep": "#be185d",
      "--accent-sky": "#fde68a",
      "--chart-actual": "#fb923c",
      "--chart-target": "#fb7185",
      "--accent-soft": "rgba(244, 114, 182, 0.22)",
      "--accent-border": "rgba(244, 114, 182, 0.32)",
      "--accent-shadow": "rgba(244, 114, 182, 0.32)",
      "--glow-1": "rgba(244, 114, 182, 0.28)",
      "--glow-2": "rgba(251, 146, 60, 0.22)",
      "--glow-3": "rgba(255, 255, 255, 0.05)",
      "--text-strong": "#fff1f2",
      "--text-muted": "#fbcfe8",
      "--shadow": "0 24px 60px rgba(12, 6, 10, 0.6)",
    },
  },
  ember: {
    label: "Ember",
    vars: {
      "--bg-1": "#16090b",
      "--bg-2": "#1f0d11",
      "--bg-3": "#291119",
      "--surface": "rgba(22, 10, 16, 0.88)",
      "--surface-strong": "rgba(22, 10, 16, 0.96)",
      "--line": "rgba(244, 63, 94, 0.18)",
      "--accent": "#f43f5e",
      "--accent-strong": "#fb7185",
      "--accent-warm": "#f97316",
      "--accent-deep": "#be123c",
      "--accent-sky": "#fdba74",
      "--chart-actual": "#f97316",
      "--chart-target": "#fb7185",
      "--accent-soft": "rgba(244, 63, 94, 0.22)",
      "--accent-border": "rgba(244, 63, 94, 0.32)",
      "--accent-shadow": "rgba(244, 63, 94, 0.32)",
      "--glow-1": "rgba(244, 63, 94, 0.28)",
      "--glow-2": "rgba(249, 115, 22, 0.22)",
      "--glow-3": "rgba(255, 255, 255, 0.05)",
      "--text-strong": "#fff1f2",
      "--text-muted": "#fecaca",
      "--shadow": "0 24px 60px rgba(12, 5, 8, 0.6)",
    },
  },
  noir: {
    label: "Noir",
    vars: {
      "--bg-1": "#050505",
      "--bg-2": "#0a0a0f",
      "--bg-3": "#121216",
      "--surface": "rgba(10, 10, 14, 0.88)",
      "--surface-strong": "rgba(10, 10, 14, 0.96)",
      "--line": "rgba(163, 230, 53, 0.18)",
      "--accent": "#a3e635",
      "--accent-strong": "#d9f99d",
      "--accent-warm": "#38bdf8",
      "--accent-deep": "#4d7c0f",
      "--accent-sky": "#34d399",
      "--chart-actual": "#38bdf8",
      "--chart-target": "#d9f99d",
      "--accent-soft": "rgba(163, 230, 53, 0.22)",
      "--accent-border": "rgba(163, 230, 53, 0.32)",
      "--accent-shadow": "rgba(163, 230, 53, 0.32)",
      "--glow-1": "rgba(163, 230, 53, 0.28)",
      "--glow-2": "rgba(56, 189, 248, 0.22)",
      "--glow-3": "rgba(255, 255, 255, 0.05)",
      "--text-strong": "#f8fafc",
      "--text-muted": "#d9f99d",
      "--shadow": "0 24px 60px rgba(0, 0, 0, 0.72)",
    },
  },
};

const applyTheme = (name) => {
  const theme = THEMES[name] || THEMES.mono;
  Object.entries(theme.vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  document.documentElement.dataset.theme = name;
  try {
    localStorage.setItem(THEME_STORAGE, name);
  } catch {}
};

const initThemeSwitch = () => {
  const select = qs("themeSelect");
  let stored = "";
  try {
    stored = localStorage.getItem(THEME_STORAGE) || "";
  } catch {}
  const initial = THEMES[stored] ? stored : "mono";
  applyTheme(initial);
  if (!select) return;
  select.value = initial;
  select.addEventListener("change", (event) => {
    applyTheme(event.target.value);
  });
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const qs = (id) => document.getElementById(id);

const navButtons = Array.from(document.querySelectorAll(".nav-btn"));
const viewSections = Array.from(document.querySelectorAll(".view"));

const applyActiveNav = () => {
  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === state.activeView);
  });
  viewSections.forEach((section) => {
    section.classList.toggle(
      "hidden",
      section.id !== `view-${state.activeView}`
    );
  });
};

const roundPoint = (value) => Math.round(value * 10) / 10;

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] || char;
  });

const buildLinePoints = (values, width, height, padding, scale = null) => {
  if (!values.length) return [];
  const min = scale?.min ?? Math.min(...values);
  const max = scale?.max ?? Math.max(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
  return values.map((value, index) => {
    const x = padding + index * step;
    const y =
      height - padding - ((value - min) / range) * (height - padding * 2);
    return { x: roundPoint(x), y: roundPoint(y) };
  });
};

const buildLinePath = (points) =>
  points.reduce(
    (acc, point, index) =>
      `${acc}${index === 0 ? "M" : "L"}${point.x} ${point.y} `,
    ""
  );

const buildLineSvg = ({ lines, width, height, padding, scale = null }) => {
  const gridY = [0.33, 0.66].map(
    (ratio) => roundPoint(padding + (height - padding * 2) * ratio)
  );
  const gridLines = gridY
    .map(
      (y) =>
        `<line class="chart-gridline" x1="${padding}" y1="${y}" x2="${
          width - padding
        }" y2="${y}"></line>`
    )
    .join("");

  const linePaths = lines
    .map((line) => {
      if (!line.values.length) return "";
      const points = buildLinePoints(line.values, width, height, padding, scale);
      if (!points.length) return "";
      const path = buildLinePath(points);
      const dots = points
        .map((point, index) => {
          const tooltip = line.tooltips?.[index];
          const title = tooltip ? `<title>${escapeHtml(tooltip)}</title>` : "";
          const dotStyle = line.dotFill ? ` style="fill: ${line.dotFill}"` : "";
          return `<circle class="${line.dotClass}" cx="${point.x}" cy="${point.y}" r="3.6"${dotStyle}>${title}</circle>`;
        })
        .join("");
      const pathStyle = line.stroke ? ` style="stroke: ${line.stroke}"` : "";
      return `<path class="${line.className}" d="${path}"${pathStyle}></path>${dots}`;
    })
    .join("");

  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Line chart">
      ${gridLines}
      ${linePaths}
    </svg>`;
};

const gradeFromScore = (score) => {
  if (score >= 75) return "A";
  if (score >= 65) return "B";
  if (score >= 55) return "C";
  if (score >= 35) return "S";
  return "W";
};

const renderHeader = () => {
  const todayLabel = qs("todayLabel");
  const profileLabel = qs("profileLabel");
  const profile = getProfile();
  todayLabel.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  profileLabel.textContent = profile.name || "Student";
};

const calculateStreak = (sessions) => {
  if (!sessions.length) return 0;
  const dates = Array.from(
    new Set(sessions.map((s) => s.session_date))
  ).sort();
  let streak = 0;
  let cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!dates.includes(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const renderDashboard = () => {
  const subjects = getSubjects();
  const marks = getMarks();
  const todos = getTodos();
  const sessions = getStudySessions();
  const profile = getProfile();

  qs("statSubjects").textContent = subjects.length;
  qs("statMarks").textContent = marks.length;
  qs("statTodos").textContent = todos.filter((t) => !t.completed).length;
  qs("statStreak").textContent = calculateStreak(sessions);

  const topList = qs("statTopSubjects");
  if (topList) {
    topList.innerHTML = "";
    if (!subjects.length) {
      topList.innerHTML = `<p class="text-xs text-muted">No subjects yet.</p>`;
    } else {
      subjects.forEach((subject) => {
        const subjectMarks = marks.filter((m) => m.subject === subject.name);
        const best = subjectMarks.reduce((acc, m) => {
          const total = (Number(m.mcq) || 0) + (Number(m.essay) || 0);
          if (!acc || total > acc.total) {
            return { total, note: m.message || "" };
          }
          return acc;
        }, null);
        if (!best) {
          topList.insertAdjacentHTML(
            "beforeend",
            `<div class="flex items-center justify-between text-xs text-muted">
              <span>${subject.name}</span>
              <span>-</span>
            </div>`
          );
          return;
        }
        topList.insertAdjacentHTML(
          "beforeend",
          `<div class="flex items-center justify-between text-sm">
            <span class="text-slate-100 font-semibold">${subject.name}</span>
            <span class="text-slate-100">${best.total}</span>
          </div>`
        );
      });
    }
  }

  const recentMarks = marks.slice(0, 4);
  const recentMarksEl = qs("recentMarks");
  recentMarksEl.innerHTML = "";
  if (!recentMarks.length) {
    recentMarksEl.innerHTML = `<p class="text-muted">Add marks to see progress.</p>`;
  } else {
    recentMarks.forEach((m) => {
      const total = (Number(m.mcq) || 0) + (Number(m.essay) || 0);
      recentMarksEl.insertAdjacentHTML(
        "beforeend",
        `<div class="rounded-2xl bg-white/5 p-4 flex items-center justify-between">
          <div>
            <p class="text-slate-100 font-semibold">${m.subject}</p>
            <p class="text-muted text-xs">${m.message || "No note"}</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-semibold text-slate-100">${total}</p>
            <p class="text-xs text-muted">${fmtDate(m.created_at)}</p>
          </div>
        </div>`
      );
    });
  }

  const focusTodos = todos.filter((t) => !t.completed).slice(0, 4);
  const focusEl = qs("focusTodos");
  focusEl.innerHTML = "";
  if (!focusTodos.length) {
    focusEl.innerHTML = `<p class="text-muted">Add tasks to build focus.</p>`;
  } else {
    focusTodos.forEach((t) => {
      focusEl.insertAdjacentHTML(
        "beforeend",
        `<div class="rounded-2xl bg-white/5 p-3 flex items-center justify-between">
          <span class="text-slate-100">${t.title}</span>
          <span class="text-xs text-muted">${t.priority}</span>
        </div>`
      );
    });
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekSessions = sessions.filter(
    (s) => new Date(s.session_date) >= weekStart
  );
  const totalMinutes = weekSessions.reduce(
    (sum, s) => sum + (Number(s.actual_minutes) || 0),
    0
  );
  const avgMinutes = weekSessions.length
    ? Math.round(totalMinutes / weekSessions.length)
    : 0;
  const bySubject = weekSessions.reduce((acc, s) => {
    acc[s.subject] = (acc[s.subject] || 0) + (Number(s.actual_minutes) || 0);
    return acc;
  }, {});
  const topSubject = Object.entries(bySubject).sort((a, b) => b[1] - a[1])[0];

  qs("weekTotal").textContent = `${totalMinutes} min`;
  qs("weekAverage").textContent = `${avgMinutes} min`;
  qs("weekSubject").textContent = topSubject ? topSubject[0] : "-";

  const today = todayIso();
  const todayMinutes = sessions
    .filter((s) => s.session_date === today)
    .reduce((sum, s) => sum + (Number(s.actual_minutes) || 0), 0);
  const target = Number(profile.dailyTarget) || 0;
  const pct = target ? Math.min(100, Math.round((todayMinutes / target) * 100)) : 0;
  qs("dailyTarget").textContent = `${target} min`;
  qs("dailyLogged").textContent = `${todayMinutes} min`;
  qs("dailyProgress").style.width = `${pct}%`;

  const averages = qs("subjectAverages");
  averages.innerHTML = "";
  if (!subjects.length) {
    averages.innerHTML = `<p class="text-muted">Add subjects to see averages.</p>`;
  } else {
    subjects.forEach((subject) => {
      const subjectMarks = marks.filter((m) => m.subject === subject.name);
      const avg =
        subjectMarks.length === 0
          ? 0
          : Math.round(
              subjectMarks.reduce(
                (sum, m) => sum + (Number(m.mcq) || 0) + (Number(m.essay) || 0),
                0
              ) / subjectMarks.length
            );
      const barPct = Math.min(100, Math.round((avg / 100) * 100));
      const grade = gradeFromScore(avg);
      averages.insertAdjacentHTML(
        "beforeend",
        `<div class="rounded-2xl bg-white/5 p-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-100 font-semibold">${subject.name}</span>
            <span class="text-slate-100 font-semibold">${grade}</span>
          </div>
          <div class="text-xs text-muted mt-1">${avg} / 100 · ${grade}</div>
          <div class="mt-2 h-2 rounded-full bg-white/10">
            <div class="h-2 rounded-full bar-warm" style="width: ${barPct}%"></div>
          </div>
        </div>`
      );
    });
  }
};

const renderMarksVisualizer = () => {
  const container = qs("marksVisualizer");
  if (!container) return;
  const subjects = getSubjects();
  const marks = getMarks();
  const palette = [
    {
      lineClass: "chart-line chart-line--accent",
      dotClass: "chart-dot chart-dot--accent",
    },
    {
      lineClass: "chart-line chart-line--warm",
      dotClass: "chart-dot chart-dot--warm",
    },
    {
      lineClass: "chart-line chart-line--sky",
      dotClass: "chart-dot chart-dot--sky",
    },
  ];
  const subjectNames = Array.from(
    new Set([
      ...subjects.map((subject) => subject.name),
      ...marks.map((mark) => mark.subject).filter(Boolean),
    ])
  );
  container.innerHTML = "";
  if (!subjectNames.length) {
    container.innerHTML = `<p class="chart-empty">Add subjects to see marks trends.</p>`;
    return;
  }

  if (!marks.length) {
    container.innerHTML = `<p class="chart-empty">Add marks to see trends.</p>`;
    return;
  }

  subjectNames.forEach((subjectName, index) => {
    const subjectMarks = marks
      .filter((m) => m.subject === subjectName)
      .slice()
      .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
    const recentMarks = subjectMarks.slice(-8);
    const recentTotals = recentMarks.map(
      (m) => (Number(m.mcq) || 0) + (Number(m.essay) || 0)
    );
    const tooltips = recentMarks.map((mark) => {
      const total = (Number(mark.mcq) || 0) + (Number(mark.essay) || 0);
      const date = mark.created_at ? fmtDate(mark.created_at) : "Unknown date";
      return `${date} · ${total} total`;
    });
    const avg = recentTotals.length
      ? Math.round(recentTotals.reduce((sum, v) => sum + v, 0) / recentTotals.length)
      : 0;
    const latest = recentTotals.length ? recentTotals[recentTotals.length - 1] : 0;

    const tone = palette[index % palette.length];
    const chart = recentTotals.length
      ? buildLineSvg({
          lines: [
            {
              values: recentTotals,
              tooltips,
              className: tone.lineClass,
              dotClass: tone.dotClass,
            },
          ],
          width: 260,
          height: 80,
          padding: 8,
        })
      : `<p class="chart-empty">No marks yet.</p>`;

    container.insertAdjacentHTML(
      "beforeend",
      `<div class="chart-card">
        <div class="chart-head">
          <div>
            <div class="text-slate-100 font-semibold">${subjectName}</div>
            <div class="chart-meta">Avg ${avg} · Latest ${latest}</div>
          </div>
        </div>
        ${chart}
      </div>`
    );
  });
};

const renderNotes = () => {
  const notes = getNotes();
  const textarea = qs("quickNotes");
  if (textarea) {
    textarea.value = notes;
  }
};

const renderSubjectOptions = () => {
  const subjects = getSubjects();
  const markSelect = qs("markSubject");
  const sessionSelect = qs("sessionSubject");
  const markFilter = qs("markFilter");
  [markSelect, sessionSelect].forEach((select) => {
    select.innerHTML = "";
    subjects.forEach((s) => {
      select.insertAdjacentHTML(
        "beforeend",
        `<option value="${s.name}">${s.name}</option>`
      );
    });
  });
  markFilter.innerHTML = `<option value="all">All subjects</option>`;
  subjects.forEach((s) => {
    markFilter.insertAdjacentHTML(
      "beforeend",
      `<option value="${s.name}">${s.name}</option>`
    );
  });
  const hint = qs("markHint");
  if (!subjects.length) {
    markSelect.setAttribute("disabled", "disabled");
    sessionSelect.setAttribute("disabled", "disabled");
    hint.textContent = "Add subjects in Settings before logging marks.";
  } else {
    markSelect.removeAttribute("disabled");
    sessionSelect.removeAttribute("disabled");
    hint.textContent = "";
  }
  updateMarkFormLabels();
};

const updateMarkFormLabels = () => {
  const subject = qs("markSubject")?.value || "";
  const isCombinedMaths = subject.toLowerCase().includes("combined maths");
  const mcqLabel = qs("markMcqLabel");
  const essayLabel = qs("markEssayLabel");
  const mcqInput = qs("markMcq");
  const essayInput = qs("markEssay");
  if (!mcqLabel || !essayLabel || !mcqInput || !essayInput) return;

  if (isCombinedMaths) {
    mcqLabel.textContent = "Applied";
    essayLabel.textContent = "Pure";
    mcqInput.placeholder = "Applied";
    essayInput.placeholder = "Pure";
  } else {
    mcqLabel.textContent = "MCQ";
    essayLabel.textContent = "Essay";
    mcqInput.placeholder = "MCQ";
    essayInput.placeholder = "Essay";
  }
};

const renderMarks = () => {
  const marks = getMarks();
  const table = qs("marksTable");
  const filter = qs("markFilter").value || "all";
  table.innerHTML = "";
  const filtered = filter === "all" ? marks : marks.filter((m) => m.subject === filter);
  if (!filtered.length) {
    table.insertAdjacentHTML(
      "beforeend",
      `<tr><td class="p-2 text-muted" colspan="7">No marks yet.</td></tr>`
    );
  } else {
    filtered.forEach((m) => {
      const total = (Number(m.mcq) || 0) + (Number(m.essay) || 0);
      const grade = gradeFromScore(total);
      table.insertAdjacentHTML(
        "beforeend",
        `<tr class="border-t border-white/5">
          <td class="p-2">${m.subject}</td>
          <td class="p-2">${m.mcq ?? "-"}</td>
          <td class="p-2">${m.essay ?? "-"}</td>
          <td class="p-2">${total}</td>
          <td class="p-2">${grade}</td>
          <td class="p-2">${m.message || "-"}</td>
          <td class="p-2">
            <div class="flex flex-wrap gap-2">
              <button class="btn-secondary rounded px-2 py-1 text-xs" data-edit="${
                m.id
              }">Edit</button>
              <button class="btn-ghost rounded px-2 py-1 text-xs text-red-600" data-delete="${
                m.id
              }">Delete</button>
            </div>
          </td>
        </tr>`
      );
    });
  }
  renderMarksVisualizer();
};

const renderTodos = () => {
  const todos = getTodos();
  const list = qs("todoList");
  const stats = qs("todoStats");
  list.innerHTML = "";
  const filtered = todos.filter((t) => {
    if (state.todoFilter === "open") return !t.completed;
    if (state.todoFilter === "done") return t.completed;
    return true;
  });
  if (!filtered.length) {
    list.innerHTML = `<p class="text-muted">No tasks in this filter.</p>`;
  }
  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length || 1;
  const pct = Math.round((completedCount / totalCount) * 100);
  stats.textContent = `${pct}% complete · ${completedCount}/${todos.length} done`;
  if (!filtered.length) {
    return;
  }
  filtered.forEach((t) => {
    list.insertAdjacentHTML(
      "beforeend",
      `<div class="rounded-2xl bg-white/5 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p class="${t.completed ? "line-through text-muted" : "text-slate-100"}">${
            t.title
          }</p>
          <p class="text-xs text-muted">${t.priority} priority</p>
        </div>
        <div class="flex items-center gap-3">
          <label class="text-xs text-muted flex items-center gap-2">
            <input type="checkbox" data-toggle="${t.id}" ${
        t.completed ? "checked" : ""
      } />
            Done
          </label>
          <button class="btn-ghost rounded px-2 py-1 text-xs text-red-600" data-remove="${
            t.id
          }">Delete</button>
        </div>
      </div>`
    );
  });
};

const renderPlanner = () => {
  const sessions = getStudySessions();
  const table = qs("sessionTable");
  table.innerHTML = "";
  if (!sessions.length) {
    table.innerHTML = `<tr><td class="p-2 text-muted" colspan="5">No sessions yet.</td></tr>`;
  } else {
    sessions
      .slice()
      .sort((a, b) => b.session_date.localeCompare(a.session_date))
      .forEach((s) => {
        table.insertAdjacentHTML(
          "beforeend",
          `<tr class="border-t border-white/5">
            <td class="p-2">${fmtDate(s.session_date)}</td>
            <td class="p-2">${s.subject}</td>
            <td class="p-2">${s.target_minutes} min</td>
            <td class="p-2">${s.actual_minutes} min</td>
            <td class="p-2">
              <div class="flex flex-wrap gap-2">
                <button class="btn-secondary rounded px-2 py-1 text-xs" data-edit-session="${
                  s.id
                }">Edit</button>
                <button class="btn-ghost rounded px-2 py-1 text-xs text-red-600" data-delete-session="${
                  s.id
                }">Delete</button>
              </div>
            </td>
          </tr>`
        );
      });
  }

  const subjects = getSubjects();
  const progress = qs("subjectProgress");
  progress.innerHTML = "";
  if (!subjects.length) {
    progress.innerHTML = `<p class="text-muted">Add subjects to start planning.</p>`;
    return;
  }
  subjects.forEach((sub) => {
    const subjectSessions = sessions.filter((s) => s.subject === sub.name);
    const target = subjectSessions.reduce(
      (sum, s) => sum + (Number(s.target_minutes) || 0),
      0
    );
    const actual = subjectSessions.reduce(
      (sum, s) => sum + (Number(s.actual_minutes) || 0),
      0
    );
    const pct = target ? Math.min(100, Math.round((actual / target) * 100)) : 0;
    progress.insertAdjacentHTML(
      "beforeend",
      `<div class="rounded-2xl bg-white/5 p-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-100 font-semibold">${sub.name}</span>
          <span class="text-muted">${actual} / ${target} min</span>
        </div>
        <div class="mt-2 h-2 rounded-full bg-black/10">
          <div class="h-2 rounded-full bar-cool" style="width: ${pct}%"></div>
        </div>
      </div>`
    );
  });

  renderPlannerChart();
};

const renderPlannerChart = () => {
  const chart = qs("plannerChart");
  const axis = qs("plannerAxis");
  if (!chart || !axis) return;

  const sessions = getStudySessions();
  const days = 7;
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));

  const actualSeries = [];
  const targetSeries = [];
  const labels = [];

  for (let i = 0; i < days; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    const daySessions = sessions.filter((s) => s.session_date === key);
    const actual = daySessions.reduce(
      (sum, s) => sum + (Number(s.actual_minutes) || 0),
      0
    );
    const target = daySessions.reduce(
      (sum, s) => sum + (Number(s.target_minutes) || 0),
      0
    );
    actualSeries.push(actual);
    targetSeries.push(target);
    labels.push(day.toLocaleDateString(undefined, { weekday: "short" }));
  }

  chart.innerHTML = "";
  axis.innerHTML = "";

  if (!sessions.length) {
    chart.innerHTML = `<p class="chart-empty">Log sessions to see trends.</p>`;
    return;
  }

  const actualTooltips = labels.map(
    (label, index) => `${label} · ${actualSeries[index]} min actual`
  );
  const targetTooltips = labels.map(
    (label, index) => `${label} · ${targetSeries[index]} min target`
  );

  const combined = [...actualSeries, ...targetSeries];
  const scale = {
    min: Math.min(...combined),
    max: Math.max(...combined),
  };

  chart.innerHTML = buildLineSvg({
    lines: [
      {
        values: actualSeries,
        tooltips: actualTooltips,
        className: "chart-line chart-line--warm",
        dotClass: "chart-dot chart-dot--warm",
      },
      {
        values: targetSeries,
        tooltips: targetTooltips,
        className: "chart-line chart-line--cool",
        dotClass: "chart-dot chart-dot--cool",
      },
    ],
    width: 360,
    height: 140,
    padding: 10,
    scale,
  });

  axis.innerHTML = labels.map((label) => `<span>${label}</span>`).join("");
};

const REPORT_RANGES = {
  "90d": { label: "Last 90 days", days: 90 },
  "180d": { label: "Last 6 months", days: 180 },
  "1y": { label: "Last 1 year", days: 365 },
  "2y": { label: "Last 2 years", days: 730 },
  all: { label: "All time", days: null },
};

const getReportRange = (key) => REPORT_RANGES[key] || REPORT_RANGES["1y"];

const buildReportHtml = (rangeKey = "1y") => {
  const range = getReportRange(rangeKey);
  const endDate = new Date();
  const startDate = range.days
    ? new Date(endDate.getTime() - range.days * 24 * 60 * 60 * 1000)
    : null;
  const rangeLabel = startDate
    ? `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
    : "All time";
  const inRange = (dateValue) => {
    if (!startDate) return true;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return false;
    return date >= startDate && date <= endDate;
  };

  const profile = getProfile();
  const subjects = getSubjects();
  const marks = getMarks().filter((m) => inRange(m.created_at));
  const sessions = getStudySessions().filter((s) => inRange(s.session_date));
  const todos = getTodos().filter((t) => inRange(t.created_at));
  const goals = getGoals();

  const completedTodos = todos.filter((t) => t.completed).length;
  const openTodos = todos.length - completedTodos;
  const topMark = marks.reduce(
    (acc, m) => {
      const total = (Number(m.mcq) || 0) + (Number(m.essay) || 0);
      if (!acc || total > acc.total) {
        return {
          total,
          subject: m.subject || "Unknown",
          note: m.message || "",
          grade: gradeFromScore(total),
        };
      }
      return acc;
    },
    null
  );

  const subjectRows = subjects
    .map((subject) => {
      const subjectMarks = marks.filter((m) => m.subject === subject.name);
      const avg = subjectMarks.length
        ? Math.round(
            subjectMarks.reduce(
              (sum, m) => sum + (Number(m.mcq) || 0) + (Number(m.essay) || 0),
              0
            ) / subjectMarks.length
          )
        : 0;
      const barWidth = Math.min(100, Math.round((avg / 100) * 100));
      return `<div class="report-row">
          <div>
            <div class="report-label">${subject.name}</div>
            <div class="report-muted">${avg} / 100 average</div>
          </div>
          <div class="report-bar">
            <span style="width: ${barWidth}%"></span>
          </div>
        </div>`;
    })
    .join("");

  const days = 7;
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const actualSeries = [];
  const targetSeries = [];
  const labels = [];

  for (let i = 0; i < days; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    const daySessions = sessions.filter((s) => s.session_date === key);
    const actual = daySessions.reduce(
      (sum, s) => sum + (Number(s.actual_minutes) || 0),
      0
    );
    const target = daySessions.reduce(
      (sum, s) => sum + (Number(s.target_minutes) || 0),
      0
    );
    actualSeries.push(actual);
    targetSeries.push(target);
    labels.push(day.toLocaleDateString(undefined, { weekday: "short" }));
  }

  const actualTooltips = labels.map(
    (label, index) => `${label} · ${actualSeries[index]} min actual`
  );
  const targetTooltips = labels.map(
    (label, index) => `${label} · ${targetSeries[index]} min target`
  );

  const plannerChart = sessions.length
    ? buildLineSvg({
        lines: [
          {
            values: actualSeries,
            tooltips: actualTooltips,
            className: "report-line report-line--warm",
            dotClass: "report-dot report-dot--warm",
            stroke: "var(--accent-warm)",
            dotFill: "var(--accent-warm)",
          },
          {
            values: targetSeries,
            tooltips: targetTooltips,
            className: "report-line report-line--cool",
            dotClass: "report-dot report-dot--cool",
            stroke: "var(--accent-cool)",
            dotFill: "var(--accent-cool)",
          },
        ],
        width: 640,
        height: 180,
        padding: 12,
      })
    : `<p class="report-muted">No sessions logged yet.</p>`;

  const generatedAt = new Date().toLocaleString();
  let themeName = "mono";
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE);
    if (storedTheme && THEMES[storedTheme]) {
      themeName = storedTheme;
    }
  } catch {}
  const reportTheme = THEMES[themeName] || THEMES.mono;
  const reportVars = {
    "--bg": reportTheme.vars["--bg-1"],
    "--panel": reportTheme.vars["--surface-strong"],
    "--line": reportTheme.vars["--line"],
    "--accent": reportTheme.vars["--accent"],
    "--accent-warm": reportTheme.vars["--accent-warm"],
    "--accent-cool": reportTheme.vars["--accent-strong"],
    "--text": reportTheme.vars["--text-strong"],
    "--muted": reportTheme.vars["--text-muted"],
    "--shadow": reportTheme.vars["--shadow"],
    "--glow-1": reportTheme.vars["--glow-1"],
    "--glow-2": reportTheme.vars["--glow-2"],
    "--glow-3": reportTheme.vars["--glow-3"],
  };
  const reportVarsCss = Object.entries(reportVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");

  const marksRows = marks
    .slice()
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
    .map((mark) => {
      const total = (Number(mark.mcq) || 0) + (Number(mark.essay) || 0);
      const grade = gradeFromScore(total);
      return `<tr>
          <td>${escapeHtml(mark.subject || "-")}</td>
          <td>${mark.mcq ?? "-"}</td>
          <td>${mark.essay ?? "-"}</td>
          <td>${total}</td>
          <td>${grade}</td>
          <td>${escapeHtml(mark.message || "-")}</td>
          <td>${mark.created_at ? escapeHtml(fmtDate(mark.created_at)) : "-"}</td>
        </tr>`;
    })
    .join("");

  return `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>EmberTrack Report</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Unbounded:wght@500;600;700&display=swap"
        />
        <style>
          :root { ${reportVarsCss} }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: "Manrope", sans-serif;
            color: var(--text);
            background: radial-gradient(circle at 12% 18%, var(--glow-1), transparent 55%),
              radial-gradient(circle at 88% 12%, var(--glow-2), transparent 55%),
              radial-gradient(circle at 40% 90%, var(--glow-3), transparent 60%),
              linear-gradient(180deg, var(--bg), #050505);
            min-height: 100vh;
            padding: 32px;
          }
          body, .report-card, .report-bar span, svg {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          h1, h2 { font-family: "Unbounded", serif; letter-spacing: -0.02em; }
          .report { max-width: 980px; margin: 0 auto; display: grid; gap: 24px; }
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
          }
          .report-card {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 20px;
            padding: 20px;
            box-shadow: var(--shadow);
          }
          .report-actions {
            display: flex;
            gap: 12px;
          }
          .report-button {
            border: 1px solid var(--line);
            background: rgba(15, 20, 26, 0.7);
            color: var(--text);
            padding: 8px 14px;
            border-radius: 999px;
            cursor: pointer;
          }
          .report-meta { color: var(--muted); font-size: 0.9rem; }
          .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
          .report-stat { display: grid; gap: 6px; }
          .report-stat h3 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--muted); }
          .report-stat p { font-size: 1.6rem; font-weight: 600; }
          .report-muted { color: var(--muted); font-size: 0.9rem; }
          .report-row { display: grid; gap: 10px; margin-bottom: 12px; }
          .report-label { font-weight: 600; }
          .report-bar { height: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 999px; overflow: hidden; }
          .report-bar span { display: block; height: 100%; background: linear-gradient(120deg, var(--accent), var(--accent-warm)); }
          .report-chart { margin-top: 12px; }
          .chart-gridline { stroke: rgba(255, 255, 255, 0.08); stroke-width: 1; }
          .report-line { fill: none; stroke-width: 2.4; }
          .report-line--warm { stroke: var(--accent-warm); }
          .report-line--cool { stroke: var(--accent-cool); }
          .report-dot { stroke: rgba(15, 20, 26, 0.8); stroke-width: 1; }
          .report-dot--warm { fill: var(--accent-warm); }
          .report-dot--cool { fill: var(--accent-cool); }
          .report-axis { display: flex; justify-content: space-between; color: var(--muted); font-size: 0.75rem; margin-top: 6px; }
          .report-note { color: var(--muted); font-size: 0.8rem; margin-top: 8px; }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 0.9rem;
          }
          .report-table th,
          .report-table td {
            padding: 10px 8px;
            border-bottom: 1px solid var(--line);
            text-align: left;
          }
          .report-table th {
            color: var(--muted);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
          }
          .report-table tbody tr:last-child td { border-bottom: none; }
          @media print {
            body { background: #ffffff; color: #111827; }
            .report-card { background: #ffffff; box-shadow: none; }
            .report-meta, .report-muted, .report-note { color: #4b5563; }
          }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="report-header">
            <div>
              <h1>EmberTrack Report</h1>
              <p class="report-meta">Generated for ${escapeHtml(
                profile.name || "Student"
              )} · ${escapeHtml(generatedAt)}</p>
              <p class="report-meta">Range: ${escapeHtml(
                rangeLabel
              )} · ${escapeHtml(range.label)}</p>
            </div>
            <div class="report-actions">
              <button class="report-button" onclick="window.print()">Print / Save PDF</button>
            </div>
          </div>
          <p class="report-note">Tip: enable background graphics in your print settings for full color.</p>

          <div class="report-card report-grid">
            <div class="report-stat">
              <h3>Marks logged</h3>
              <p>${marks.length}</p>
              <span class="report-muted">Across ${subjects.length} subjects</span>
            </div>
            <div class="report-stat">
              <h3>Study sessions</h3>
              <p>${sessions.length}</p>
              <span class="report-muted">${todos.length} tasks total</span>
            </div>
            <div class="report-stat">
              <h3>Tasks done</h3>
              <p>${completedTodos}</p>
              <span class="report-muted">${openTodos} remaining</span>
            </div>
            <div class="report-stat">
              <h3>Goals</h3>
              <p>${goals.filter((g) => g.completed).length}/${goals.length}</p>
              <span class="report-muted">Completed</span>
            </div>
          </div>

          <div class="report-card">
            <h2>Top Mark</h2>
            <p class="report-muted">
              ${
                topMark
                  ? `${escapeHtml(topMark.subject)} · ${topMark.total} total · ${topMark.grade}`
                  : "No marks logged yet."
              }
            </p>
            ${
              topMark?.note
                ? `<p class="report-muted">Note: ${escapeHtml(topMark.note)}</p>`
                : ""
            }
          </div>

          <div class="report-card">
            <h2>Subject Averages</h2>
            <div class="report-chart">
              ${subjectRows || `<p class="report-muted">No subjects yet.</p>`}
            </div>
          </div>

          <div class="report-card">
            <h2>Study Trend (Last 7 Days)</h2>
            <div class="report-chart">${plannerChart}</div>
            <div class="report-axis">${labels
              .map((label) => `<span>${escapeHtml(label)}</span>`)
              .join("")}</div>
          </div>

          <div class="report-card">
            <h2>Marks Log</h2>
            ${
              marksRows
                ? `<table class="report-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>MCQ</th>
                        <th>Essay</th>
                        <th>Total</th>
                        <th>Grade</th>
                        <th>Note</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>${marksRows}</tbody>
                  </table>`
                : `<p class="report-muted">No marks logged yet.</p>`
            }
          </div>
        </div>
      </body>
    </html>`;
};

const openReport = (rangeKey) => {
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) {
    alert("Popup blocked. Allow popups to open the report.");
    return;
  }
  reportWindow.document.open();
  reportWindow.document.write(buildReportHtml(rangeKey));
  reportWindow.document.close();
  reportWindow.focus();
};

const renderGoals = () => {
  const goals = getGoals();
  const list = qs("goalList");
  list.innerHTML = "";
  if (!goals.length) {
    list.innerHTML = `<p class="text-muted">No goals yet.</p>`;
    return;
  }
  goals.forEach((goal) => {
    list.insertAdjacentHTML(
      "beforeend",
      `<div class="rounded-xl bg-white/5 px-3 py-2 flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" data-goal-toggle="${goal.id}" ${
        goal.completed ? "checked" : ""
      } />
          <span class="${goal.completed ? "line-through text-muted" : ""}">${
        goal.title
      }</span>
        </label>
        <button class="text-xs text-red-500" data-goal-delete="${
          goal.id
        }">Remove</button>
      </div>`
    );
  });
};

const renderSettings = () => {
  const profile = getProfile();
  qs("profileName").value = profile.name || "";
  qs("profileBirthday").value = profile.birthday || "";
  qs("profileTarget").value = profile.dailyTarget ?? 60;

  const list = qs("subjectList");
  list.innerHTML = "";
  const subjects = getSubjects();
  if (!subjects.length) {
    list.innerHTML = `<p class="text-muted">No subjects yet.</p>`;
  } else {
    subjects.forEach((s) => {
      list.insertAdjacentHTML(
        "beforeend",
        `<div class="rounded-xl bg-white/5 px-3 py-2 flex items-center justify-between">
          <span class="text-slate-100">${s.name}</span>
          <button class="text-xs text-red-500" data-remove-subject="${
            s.id
          }">Remove</button>
        </div>`
      );
    });
  }
};

const renderAll = () => {
  renderHeader();
  renderSubjectOptions();
  renderDashboard();
  renderMarks();
  renderTodos();
  renderPlanner();
  renderSettings();
  renderGoals();
  renderNotes();
};

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.activeView = btn.dataset.view;
    window.location.hash = state.activeView;
    applyActiveNav();
  });
});

qs("markForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const subject = qs("markSubject").value;
  const mcq = Number(qs("markMcq").value || 0);
  const essay = Number(qs("markEssay").value || 0);
  const note = qs("markNote").value.trim();
  if (!subject) return;

  if (state.editingMarkId) {
    updateMark(state.editingMarkId, {
      subject,
      mcq,
      essay,
      message: note,
    });
  } else {
    addMark({ subject, mcq, essay, message: note });
  }
  state.editingMarkId = null;
  qs("markSubmit").textContent = "Add";
  event.target.reset();
  qs("markNote").value = "";
});

qs("markFilter").addEventListener("change", () => {
  renderMarks();
});

qs("markSubject").addEventListener("change", () => {
  updateMarkFormLabels();
});

qs("markCancel").addEventListener("click", () => {
  state.editingMarkId = null;
  qs("markSubmit").textContent = "Add";
  qs("markForm").reset();
});

qs("marksTable").addEventListener("click", (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;
  if (editId) {
    const mark = getMarks().find((m) => m.id === editId);
    if (!mark) return;
    state.editingMarkId = editId;
    qs("markSubject").value = mark.subject;
    qs("markMcq").value = mark.mcq ?? "";
    qs("markEssay").value = mark.essay ?? "";
    qs("markNote").value = mark.message || "";
    qs("markSubmit").textContent = "Save";
  }
  if (deleteId) {
    deleteMark(deleteId);
  }
});

qs("todoForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = qs("todoTitle").value.trim();
  const priority = qs("todoPriority").value;
  if (!title) return;
  addTodo({ title, priority });
  qs("todoTitle").value = "";
});

qs("reportBtn").addEventListener("click", () => {
  const rangeKey = qs("reportRange")?.value || "1y";
  openReport(rangeKey);
});

qs("todoList").addEventListener("click", (event) => {
  const toggleId = event.target.dataset.toggle;
  const removeId = event.target.dataset.remove;
  if (toggleId) {
    const todo = getTodos().find((t) => t.id === toggleId);
    if (todo) updateTodo(toggleId, { completed: !todo.completed });
  }
  if (removeId) {
    deleteTodo(removeId);
  }
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.todoFilter = btn.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach((other) => {
      other.classList.toggle(
        "active",
        other.dataset.filter === state.todoFilter
      );
    });
    renderTodos();
  });
});

qs("sessionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const subject = qs("sessionSubject").value;
  const target = Number(qs("sessionTarget").value || 0);
  const actual = Number(qs("sessionActual").value || 0);
  const date = qs("sessionDate").value || todayIso();
  if (!subject) return;
  if (state.editingSessionId) {
    updateStudySession(state.editingSessionId, {
      subject,
      target_minutes: target,
      actual_minutes: actual,
      session_date: date,
    });
  } else {
    addStudySession({
      subject,
      target_minutes: target,
      actual_minutes: actual,
      session_date: date,
    });
  }
  resetSessionForm();
});

const resetSessionForm = () => {
  state.editingSessionId = null;
  const submit = qs("sessionSubmit");
  if (submit) submit.textContent = "Add Session";
  qs("sessionForm").reset();
  qs("sessionDate").value = todayIso();
};

qs("sessionCancel").addEventListener("click", () => {
  resetSessionForm();
});

qs("sessionTable").addEventListener("click", (event) => {
  const editId = event.target.dataset.editSession;
  const deleteId = event.target.dataset.deleteSession;
  if (editId) {
    const session = getStudySessions().find((s) => s.id === editId);
    if (!session) return;
    state.editingSessionId = editId;
    qs("sessionSubject").value = session.subject;
    qs("sessionTarget").value = session.target_minutes ?? "";
    qs("sessionActual").value = session.actual_minutes ?? "";
    qs("sessionDate").value = session.session_date || todayIso();
    qs("sessionSubmit").textContent = "Save Session";
  }
  if (deleteId) {
    if (deleteId === state.editingSessionId) {
      resetSessionForm();
    }
    deleteStudySession(deleteId);
  }
});

qs("saveProfile").addEventListener("click", () => {
  const name = qs("profileName").value.trim() || "Student";
  const birthday = qs("profileBirthday").value;
  const dailyTarget = Number(qs("profileTarget").value || 0);
  saveProfile({ name, birthday, dailyTarget });
  const msg = qs("profileMessage");
  msg.textContent = "Profile saved.";
  setTimeout(() => {
    msg.textContent = "";
  }, 2000);
});

qs("addSubject").addEventListener("click", () => {
  const input = qs("newSubject");
  const name = input.value.trim();
  if (!name) return;
  addSubject(name);
  input.value = "";
});

qs("subjectList").addEventListener("click", (event) => {
  const removeId = event.target.dataset.removeSubject;
  if (removeId) removeSubject(removeId);
});

qs("exportData").addEventListener("click", () => {
  const data = exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `localgradeanalyzer-${todayIso()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  qs("dataMessage").textContent = "Exported data file.";
});

qs("exportCsv").addEventListener("click", () => {
  const marks = getMarks();
  if (!marks.length) {
    qs("dataMessage").textContent = "No marks to export.";
    return;
  }
  const header = ["subject", "mcq", "essay", "total", "note", "created_at"];
  const rows = marks.map((m) => [
    m.subject,
    m.mcq ?? "",
    m.essay ?? "",
    (Number(m.mcq) || 0) + (Number(m.essay) || 0),
    m.message || "",
    m.created_at || "",
  ]);
  const csv = [header, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `marks-${todayIso()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  qs("dataMessage").textContent = "CSV exported.";
});

qs("importFile").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      importData(payload);
      qs("dataMessage").textContent = "Imported data successfully.";
    } catch (err) {
      qs("dataMessage").textContent = "Import failed. Invalid JSON file.";
    }
  };
  reader.readAsText(file);
});

qs("resetData").addEventListener("click", () => {
  if (!confirm("This will erase all local data. Continue?")) return;
  resetStore();
  qs("dataMessage").textContent = "Local data cleared.";
});

qs("clearCompleted").addEventListener("click", () => {
  const todos = getTodos();
  todos.filter((t) => t.completed).forEach((t) => deleteTodo(t.id));
});

qs("addGoal").addEventListener("click", () => {
  const input = qs("newGoal");
  const title = input.value.trim();
  if (!title) return;
  addGoal(title);
  input.value = "";
});

qs("goalList").addEventListener("click", (event) => {
  const toggleId = event.target.dataset.goalToggle;
  const deleteId = event.target.dataset.goalDelete;
  if (toggleId) toggleGoal(toggleId);
  if (deleteId) deleteGoal(deleteId);
});

const updateTimerDisplay = () => {
  const mins = Math.floor(state.timerSeconds / 60);
  const secs = state.timerSeconds % 60;
  qs("timerDisplay").textContent = `${String(mins).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
};

const stopTimer = () => {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  qs("timerStatus").textContent = "Paused";
};

qs("timerStart").addEventListener("click", () => {
  if (state.timerInterval) return;
  qs("timerStatus").textContent = "Running";
  state.timerInterval = setInterval(() => {
    if (state.timerSeconds <= 0) {
      stopTimer();
      qs("timerStatus").textContent = "Complete";
      return;
    }
    state.timerSeconds -= 1;
    updateTimerDisplay();
  }, 1000);
});

qs("timerPause").addEventListener("click", () => {
  stopTimer();
});

qs("timerReset").addEventListener("click", () => {
  stopTimer();
  state.timerSeconds = 1500;
  updateTimerDisplay();
  qs("timerStatus").textContent = "Ready";
});

let notesTimer = null;
qs("quickNotes").addEventListener("input", (event) => {
  const value = event.target.value;
  const status = qs("notesStatus");
  status.textContent = "Saving...";
  if (notesTimer) clearTimeout(notesTimer);
  notesTimer = setTimeout(() => {
    saveNotes(value);
    status.textContent = "Saved";
    setTimeout(() => {
      status.textContent = "";
    }, 1200);
  }, 300);
});

window.addEventListener("embertrack-storage", renderAll);
initThemeSwitch();
syncFromServer();
window.addEventListener("focus", () => {
  syncFromServer();
});
window.addEventListener("hashchange", () => {
  const nextView = window.location.hash.replace("#", "") || "dashboard";
  state.activeView = nextView;
  applyActiveNav();
});

qs("sessionDate").value = todayIso();
document
  .querySelector('.filter-btn[data-filter="all"]')
  .classList.add("active");
updateTimerDisplay();
applyActiveNav();
renderAll();
