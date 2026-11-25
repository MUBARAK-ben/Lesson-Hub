// Replace with your deployed FastAPI backend URL when hosting on Render
const API_BASE = "https://lesson-hub-api.onrender.com";

const state = {
  classes: [],
  lessons: [],
};

const el = {
  apiStatus: document.getElementById("apiStatus"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  filterClass: document.getElementById("filterClass"),
  filterSubject: document.getElementById("filterSubject"),
  filterQuery: document.getElementById("filterQuery"),
  applyFiltersBtn: document.getElementById("applyFiltersBtn"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),
  classForm: document.getElementById("classForm"),
  lessonClassId: document.getElementById("lessonClassId"),
  lessonForm: document.getElementById("lessonForm"),
  feedbackBanner: document.getElementById("feedbackBanner"),
  lessonCount: document.getElementById("lessonCount"),
  lessonsList: document.getElementById("lessonsList"),
};

function showFeedback(message, isError = false) {
  el.feedbackBanner.textContent = message;
  el.feedbackBanner.className = `feedback ${isError ? "err" : "ok"}`;
}

function clearFeedback() {
  el.feedbackBanner.className = "feedback hidden";
  el.feedbackBanner.textContent = "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const errData = await res.json();
      if (errData.detail) detail = errData.detail;
    } catch (_) {
      // Ignore non-JSON error body
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function checkApiHealth() {
  try {
    await apiRequest("/health", { headers: {} });
    el.apiStatus.textContent = "API Online";
    el.apiStatus.className = "status-badge status-online";
  } catch (_) {
    el.apiStatus.textContent = "API Offline";
    el.apiStatus.className = "status-badge status-offline";
  }
}

function renderClassSelectors() {
  const previousFilterVal = el.filterClass.value;
  const previousFormVal = el.lessonClassId.value;

  el.filterClass.innerHTML = `<option value="">All Classes</option>`;
  el.lessonClassId.innerHTML = `<option value="">Select a class...</option>`;

  for (const c of state.classes) {
    const label = `${c.class_name} — ${c.school_name} (${c.term_label})`;

    const filterOpt = document.createElement("option");
    filterOpt.value = String(c.id);
    filterOpt.textContent = label;
    el.filterClass.appendChild(filterOpt);

    const formOpt = document.createElement("option");
    formOpt.value = String(c.id);
    formOpt.textContent = label;
    el.lessonClassId.appendChild(formOpt);
  }

  if (previousFilterVal) el.filterClass.value = previousFilterVal;
  if (previousFormVal) el.lessonClassId.value = previousFormVal;
}

function getClassLabel(classId) {
  const found = state.classes.find((c) => c.id === classId);
  return found ? `${found.class_name} (${found.school_name})` : `Class #${classId}`;
}

function renderLessons() {
  el.lessonCount.textContent = `${state.lessons.length} ${state.lessons.length === 1 ? "lesson" : "lessons"}`;

  if (!state.lessons.length) {
    el.lessonsList.innerHTML = `<p class="empty-state">No lessons match the current filter.</p>`;
    return;
  }

  el.lessonsList.innerHTML = state.lessons
    .map((lesson) => {
      const resourcesHtml = (lesson.resources || [])
        .map(
          (res) => `
          <div class="resource-item">
            <div>
              <strong>[${escapeHtml(res.resource_type)}] ${escapeHtml(res.title)}</strong>
              ${res.content ? `<div class="lesson-block">${escapeHtml(res.content)}</div>` : ""}
            </div>
            <button type="button" class="btn btn-danger-sm" data-delete-resource="${res.id}">Remove</button>
          </div>`
        )
        .join("");

      return `
        <article class="lesson-card" data-lesson-id="${lesson.id}">
          <div class="lesson-top">
            <div>
              <div class="lesson-meta">Week ${escapeHtml(lesson.week_number)} • ${escapeHtml(lesson.subject)} • ${escapeHtml(getClassLabel(lesson.class_id))}</div>
              <h3 class="lesson-title">${escapeHtml(lesson.topic)}</h3>
            </div>
            <button type="button" class="btn btn-danger-sm" data-delete-lesson="${lesson.id}">Delete</button>
          </div>
          ${lesson.objectives ? `<div class="lesson-block"><strong>Objectives:</strong> ${escapeHtml(lesson.objectives)}</div>` : ""}
          ${lesson.lesson_notes ? `<div class="lesson-block"><strong>Notes:</strong> ${escapeHtml(lesson.lesson_notes)}</div>` : ""}
          <div class="resources-box">
            <h4>Resources (${(lesson.resources || []).length})</h4>
            ${resourcesHtml || `<p class="lesson-meta">No resources attached yet.</p>`}
            <form class="resource-form" data-resource-form="${lesson.id}">
              <select name="resource_type" required>
                <option value="Worksheet">Worksheet</option>
                <option value="Quiz">Quiz</option>
                <option value="Rubric">Rubric</option>
                <option value="Reference">Reference</option>
              </select>
              <input name="title" type="text" required placeholder="Resource title" />
              <input name="content" type="text" placeholder="Notes or prompt..." />
              <button type="submit" class="btn btn-secondary">+ Add</button>
            </form>
          </div>
        </article>`;
    })
    .join("");
}

async function loadClasses() {
  state.classes = await apiRequest("/classes", { headers: {} });
  renderClassSelectors();
}

async function loadLessons() {
  const params = new URLSearchParams();
  if (el.filterClass.value) params.set("class_id", el.filterClass.value);
  if (el.filterSubject.value.trim()) params.set("subject", el.filterSubject.value.trim());
  if (el.filterQuery.value.trim()) params.set("q", el.filterQuery.value.trim());

  const queryString = params.toString();
  const path = queryString ? `/lessons?${queryString}` : "/lessons";
  state.lessons = await apiRequest(path, { headers: {} });
  renderLessons();
}

function exportLessonsCsv() {
  const headers = ["id", "week_number", "subject", "class", "topic", "objectives", "lesson_notes", "resources_count"];
  const rows = state.lessons.map((l) => [
    l.id,
    l.week_number,
    l.subject,
    getClassLabel(l.class_id),
    l.topic,
    l.objectives,
    l.lesson_notes,
    (l.resources || []).length,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lesson_hub_export.csv";
  link.click();
  URL.revokeObjectURL(url);
}

el.classForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFeedback();
  const formData = new FormData(el.classForm);
  const payload = {
    school_name: String(formData.get("school_name") || "").trim(),
    class_name: String(formData.get("class_name") || "").trim(),
    term_label: String(formData.get("term_label") || "").trim(),
  };
  try {
    const created = await apiRequest("/classes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    el.classForm.reset();
    await loadClasses();
    el.lessonClassId.value = String(created.id);
    showFeedback("Class saved.");
  } catch (err) {
    showFeedback(err.message, true);
  }
});

el.lessonForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFeedback();
  const formData = new FormData(el.lessonForm);
  const classIdNum = Number(formData.get("class_id"));
  const weekNum = Number(formData.get("week_number"));

  if (!classIdNum) {
    showFeedback("Please select or create a class first.", true);
    return;
  }

  const payload = {
    class_id: classIdNum,
    subject: String(formData.get("subject") || "").trim(),
    week_number: weekNum,
    topic: String(formData.get("topic") || "").trim(),
    objectives: String(formData.get("objectives") || "").trim(),
    lesson_notes: String(formData.get("lesson_notes") || "").trim(),
  };

  try {
    await apiRequest("/lessons", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    el.lessonForm.reset();
    document.getElementById("lessonWeek").value = "1";
    if (classIdNum) el.lessonClassId.value = String(classIdNum);
    await loadLessons();
    showFeedback("Lesson plan added.");
  } catch (err) {
    showFeedback(err.message, true);
  }
});

el.lessonsList.addEventListener("submit", async (e) => {
  const form = e.target.closest("[data-resource-form]");
  if (!form) return;
  e.preventDefault();
  clearFeedback();

  const lessonId = Number(form.getAttribute("data-resource-form"));
  const formData = new FormData(form);
  const payload = {
    lesson_id: lessonId,
    resource_type: String(formData.get("resource_type") || "Worksheet").trim(),
    title: String(formData.get("title") || "").trim(),
    content: String(formData.get("content") || "").trim(),
  };

  try {
    await apiRequest("/resources", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    form.reset();
    await loadLessons();
    showFeedback("Resource attached to lesson.");
  } catch (err) {
    showFeedback(err.message, true);
  }
});

el.lessonsList.addEventListener("click", async (e) => {
  const deleteLessonBtn = e.target.closest("[data-delete-lesson]");
  if (deleteLessonBtn) {
    const lessonId = deleteLessonBtn.getAttribute("data-delete-lesson");
    if (!window.confirm("Delete this lesson and all its attached resources?")) return;
    clearFeedback();
    try {
      await apiRequest(`/lessons/${lessonId}`, { method: "DELETE", headers: {} });
      await loadLessons();
      showFeedback("Lesson deleted.");
    } catch (err) {
      showFeedback(err.message, true);
    }
    return;
  }

  const deleteResourceBtn = e.target.closest("[data-delete-resource]");
  if (deleteResourceBtn) {
    const resourceId = deleteResourceBtn.getAttribute("data-delete-resource");
    clearFeedback();
    try {
      await apiRequest(`/resources/${resourceId}`, { method: "DELETE", headers: {} });
      await loadLessons();
      showFeedback("Resource removed.");
    } catch (err) {
      showFeedback(err.message, true);
    }
  }
});

el.applyFiltersBtn.addEventListener("click", async () => {
  clearFeedback();
  try {
    await loadLessons();
  } catch (err) {
    showFeedback(err.message, true);
  }
});

el.resetFiltersBtn.addEventListener("click", async () => {
  el.filterClass.value = "";
  el.filterSubject.value = "";
  el.filterQuery.value = "";
  clearFeedback();
  try {
    await loadLessons();
  } catch (err) {
    showFeedback(err.message, true);
  }
});

el.exportCsvBtn.addEventListener("click", exportLessonsCsv);

async function init() {
  await checkApiHealth();
  try {
    await loadClasses();
    await loadLessons();
  } catch (err) {
    showFeedback(`Could not load initial data: ${err.message}`, true);
  }
}

init();