import {
  addMark,
  addStudySession,
  addSubject,
  addTodo,
  deleteMark,
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
  updateTodo,
} from "./localStore.js";

const state = {
  activeView: window.location.hash.replace("#", "") || "dashboard",
  editingMarkId: null,
  todoFilter: "all",
  timerSeconds: 1500,
  timerInterval: null,
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

const buildLinePoints = (values, width, height, padding) => {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
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

const buildLineSvg = ({ lines, width, height, padding }) => {
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
      const points = buildLinePoints(line.values, width, height, padding);
      if (!points.length) return "";
      const path = buildLinePath(points);
      const dots = points
        .map((point, index) => {
          const tooltip = line.tooltips?.[index];
          const title = tooltip ? `<title>${escapeHtml(tooltip)}</title>` : "";
          return `<circle class="${line.dotClass}" cx="${point.x}" cy="${point.y}" r="3.6">${title}</circle>`;
        })
        .join("");
      return `<path class="${line.className}" d="${path}"></path>${dots}`;
    })
    .join("");

  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Line chart">
      ${gridLines}
      ${linePaths}
    </svg>`;
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
      averages.insertAdjacentHTML(
        "beforeend",
        `<div class="rounded-2xl bg-white/5 p-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-100 font-semibold">${subject.name}</span>
            <span class="text-muted">${avg} / 100</span>
          </div>
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
  container.innerHTML = "";
  if (!subjects.length) {
    container.innerHTML = `<p class="chart-empty">Add subjects to see marks trends.</p>`;
    return;
  }

  subjects.forEach((subject) => {
    const subjectMarks = marks
      .filter((m) => m.subject === subject.name)
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

    const chart = recentTotals.length
        ? buildLineSvg({
            lines: [
              {
                values: recentTotals,
                tooltips,
                className: "chart-line",
                dotClass: "chart-dot",
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
            <div class="text-slate-100 font-semibold">${subject.name}</div>
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
      `<tr><td class="p-2 text-muted" colspan="6">No marks yet.</td></tr>`
    );
  } else {
    filtered.forEach((m) => {
      const total = (Number(m.mcq) || 0) + (Number(m.essay) || 0);
      table.insertAdjacentHTML(
        "beforeend",
        `<tr class="border-t border-white/5">
          <td class="p-2">${m.subject}</td>
          <td class="p-2">${m.mcq ?? "-"}</td>
          <td class="p-2">${m.essay ?? "-"}</td>
          <td class="p-2">${total}</td>
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
    table.innerHTML = `<tr><td class="p-2 text-muted" colspan="4">No sessions yet.</td></tr>`;
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
  });

  axis.innerHTML = labels.map((label) => `<span>${label}</span>`).join("");
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
  addStudySession({
    subject,
    target_minutes: target,
    actual_minutes: actual,
    session_date: date,
  });
  qs("sessionTarget").value = "";
  qs("sessionActual").value = "";
  qs("sessionDate").value = "";
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
