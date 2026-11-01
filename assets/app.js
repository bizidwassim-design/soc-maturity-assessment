/*
 * SOC Maturity Assessment — application logic.
 *
 * Plain browser JavaScript, no dependencies, no network. Reads the question bank from
 * window.SOC_MATURITY (data/questions.js), renders the questionnaire, computes domain and
 * overall maturity, draws a radar chart with inline SVG, lists the ten weakest questions,
 * exports and imports JSON, and keeps a draft in localStorage.
 *
 * MIT License.
 */
(function () {
  "use strict";

  var DATA = window.SOC_MATURITY;
  if (!DATA || !DATA.questions) {
    document.getElementById("questionnaire").textContent = "Question bank failed to load (data/questions.js).";
    return;
  }

  var STORAGE_KEY = "soc-maturity-draft-v1";
  var THEME_KEY = "soc-maturity-theme";
  var EXPORT_SCHEMA = "soc-maturity-assessment/1.0";
  var GAP_COUNT = 10;

  var state = { answers: {}, notes: {}, meta: { organisation: "", assessor: "", date: "" } };

  var questionsById = {};
  var domainsByKey = {};
  DATA.questions.forEach(function (q) { questionsById[q.id] = q; });
  DATA.domains.forEach(function (d) { domainsByKey[d.key] = d; });

  /* ------------------------------------------------------------ helpers */

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "text") { node.textContent = attrs[k]; }
        else if (k === "class") { node.className = attrs[k]; }
        else { node.setAttribute(k, attrs[k]); }
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) { return; }
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function svgEl(tag, attrs) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function levelName(value) {
    var lvl = DATA.levels[Math.max(0, Math.min(4, Math.round(value)))];
    return lvl ? lvl.name : "";
  }

  function fmt(n) { return n === null ? "–" : n.toFixed(1); }

  function setStatus(message, kind) {
    var s = document.getElementById("status");
    s.textContent = message || "";
    s.className = "status" + (kind ? " " + kind : "");
  }

  function todayIso() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  /* ------------------------------------------------------------ storage */

  function saveDraft() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* Private mode or storage disabled: the app still works, the draft is just not kept. */
    }
  }

  function loadDraft() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) { return false; }
      var parsed = JSON.parse(raw);
      applyImported(parsed, true);
      return true;
    } catch (e) {
      return false;
    }
  }

  function clearDraft() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------ theme */

  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === "dark" || theme === "light") { root.setAttribute("data-theme", theme); }
    else { root.removeAttribute("data-theme"); }
    var isDark = theme === "dark" ||
      (theme !== "light" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var btn = document.getElementById("theme-toggle");
    btn.textContent = isDark ? "Light theme" : "Dark theme";
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
  }

  function initTheme() {
    var saved = null;
    try { saved = window.localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    applyTheme(saved);
    document.getElementById("theme-toggle").addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var isDark = current === "dark" ||
        (current !== "light" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = isDark ? "light" : "dark";
      try { window.localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
      applyTheme(next);
    });
  }

  /* ------------------------------------------------------------ scoring */

  function computeScores() {
    var result = { domains: {}, overall: null, answered: 0, total: DATA.questions.length };
    DATA.domains.forEach(function (d) {
      result.domains[d.key] = { key: d.key, name: d.name, sum: 0, answered: 0, total: 0, score: null, lowest: null };
    });
    DATA.questions.forEach(function (q) {
      var dom = result.domains[q.domain];
      dom.total += 1;
      var a = state.answers[q.id];
      if (typeof a === "number") {
        dom.sum += a;
        dom.answered += 1;
        result.answered += 1;
        if (dom.lowest === null || a < state.answers[dom.lowest]) { dom.lowest = q.id; }
      }
    });
    var scored = [];
    Object.keys(result.domains).forEach(function (k) {
      var dom = result.domains[k];
      if (dom.answered > 0) {
        dom.score = dom.sum / dom.answered;
        scored.push(dom.score);
      }
    });
    if (scored.length) {
      result.overall = scored.reduce(function (a, b) { return a + b; }, 0) / scored.length;
    }
    return result;
  }

  function lowestQuestions(limit) {
    var answered = DATA.questions.filter(function (q) { return typeof state.answers[q.id] === "number"; });
    var domainOrder = {};
    DATA.domains.forEach(function (d, i) { domainOrder[d.key] = i; });
    answered.sort(function (a, b) {
      var diff = state.answers[a.id] - state.answers[b.id];
      if (diff !== 0) { return diff; }
      var dd = domainOrder[a.domain] - domainOrder[b.domain];
      if (dd !== 0) { return dd; }
      return a.id < b.id ? -1 : 1;
    });
    return answered.slice(0, limit);
  }

  /* ------------------------------------------------------------ rendering: questionnaire */

  function renderLegend() {
    var dl = document.getElementById("levels-legend");
    DATA.levels.forEach(function (lvl) {
      dl.appendChild(el("div", { class: "lvl-" + lvl.value }, [
        el("dt", { text: lvl.value + " · " + lvl.name }),
        el("dd", { text: lvl.short })
      ]));
    });
  }

  function renderQuestionnaire() {
    var container = document.getElementById("questionnaire");
    DATA.domains.forEach(function (domain, di) {
      var section = el("section", { class: "card domain-card", id: "domain-" + domain.key, "aria-labelledby": "domain-title-" + domain.key });
      var header = el("div", { class: "domain-header" }, [
        el("div", {}, [
          el("h2", { id: "domain-title-" + domain.key, text: (di + 1) + ". " + domain.name }),
          el("p", { text: domain.description })
        ]),
        el("span", { class: "domain-score", id: "domain-score-" + domain.key, text: "– / 4" })
      ]);
      section.appendChild(header);

      DATA.questions.filter(function (q) { return q.domain === domain.key; }).forEach(function (q) {
        section.appendChild(renderQuestion(q));
      });
      container.appendChild(section);
    });
  }

  function renderQuestion(q) {
    var wrapper = el("div", { class: "question", id: "q-" + q.id });
    wrapper.appendChild(el("p", { class: "question-title" }, [
      el("span", { class: "question-id", text: q.id }),
      el("span", { text: q.text })
    ]));

    var fieldset = el("fieldset", { class: "options" }, [el("legend", { text: q.id + " " + q.text })]);
    q.levels.forEach(function (desc, value) {
      var inputId = "opt-" + q.id + "-" + value;
      var input = el("input", { type: "radio", name: "ans-" + q.id, id: inputId, value: String(value) });
      input.addEventListener("change", function () { onAnswer(q.id, value); });
      var label = el("label", { class: "option lvl-" + value, for: inputId }, [
        input,
        el("span", {}, [
          el("span", { class: "opt-level", text: value + " · " + DATA.levels[value].name }),
          desc
        ])
      ]);
      fieldset.appendChild(label);
    });
    wrapper.appendChild(fieldset);

    var noteId = "note-" + q.id;
    var textarea = el("textarea", { id: noteId, rows: "2", placeholder: "Evidence, owner, comments (kept in the export)" });
    textarea.addEventListener("input", function () {
      state.notes[q.id] = textarea.value;
      if (!textarea.value) { delete state.notes[q.id]; }
      saveDraft();
    });
    wrapper.appendChild(el("details", {}, [
      el("summary", { text: "Notes and evidence" }),
      el("label", { class: "visually-hidden", for: noteId, text: "Notes for " + q.id }),
      textarea
    ]));
    return wrapper;
  }

  function onAnswer(id, value) {
    state.answers[id] = value;
    saveDraft();
    refreshQuestionStyle(id);
    renderResults();
  }

  function refreshQuestionStyle(id) {
    var wrapper = document.getElementById("q-" + id);
    if (!wrapper) { return; }
    var selected = state.answers[id];
    wrapper.querySelectorAll(".option").forEach(function (label) {
      var input = label.querySelector("input");
      var isSel = typeof selected === "number" && Number(input.value) === selected;
      input.checked = isSel;
      label.classList.toggle("selected", isSel);
    });
    var note = document.getElementById("note-" + id);
    if (note) { note.value = state.notes[id] || ""; }
  }

  function refreshAllQuestions() {
    DATA.questions.forEach(function (q) { refreshQuestionStyle(q.id); });
    document.getElementById("meta-org").value = state.meta.organisation || "";
    document.getElementById("meta-assessor").value = state.meta.assessor || "";
    document.getElementById("meta-date").value = state.meta.date || "";
  }

  /* ------------------------------------------------------------ rendering: results */

  function renderResults() {
    var scores = computeScores();

    // progress
    document.getElementById("progress-text").textContent = scores.answered + " of " + scores.total + " answered";
    var bar = document.getElementById("progress-bar");
    bar.max = scores.total;
    bar.value = scores.answered;

    // overall
    var overallEl = document.getElementById("overall-score");
    var labelEl = document.getElementById("overall-label");
    var noteEl = document.getElementById("overall-note");
    if (scores.overall === null) {
      overallEl.textContent = "–";
      labelEl.textContent = "Answer the questions to see your level.";
      noteEl.textContent = "";
    } else {
      overallEl.textContent = fmt(scores.overall);
      labelEl.textContent = "Level " + Math.round(scores.overall) + " · " + levelName(scores.overall);
      noteEl.textContent = scores.answered < scores.total
        ? "Partial: based on " + scores.answered + " of " + scores.total + " questions. Mean of domain averages."
        : "Mean of the six domain averages.";
    }

    // domain table and per-domain badges
    var tbody = document.querySelector("#domain-table tbody");
    tbody.textContent = "";
    DATA.domains.forEach(function (d) {
      var dom = scores.domains[d.key];
      document.getElementById("domain-score-" + d.key).textContent = fmt(dom.score) + " / 4";
      var lowestText = "–";
      if (dom.lowest) {
        lowestText = dom.lowest + " (level " + state.answers[dom.lowest] + ")";
      }
      tbody.appendChild(el("tr", {}, [
        el("td", { text: d.name }),
        el("td", { class: "num", text: dom.answered + " / " + dom.total }),
        el("td", { class: "num", text: fmt(dom.score) }),
        el("td", {}, [levelPill(dom.score)]),
        el("td", { text: lowestText })
      ]));
    });

    renderRadar(scores);
    renderGaps();
  }

  function levelPill(score) {
    if (score === null) { return el("span", { class: "pill lvl-na", text: "n/a" }); }
    var rounded = Math.round(score);
    return el("span", { class: "pill lvl-" + rounded, text: rounded + " " + levelName(score) });
  }

  function renderRadar(scores) {
    var holder = document.getElementById("radar");
    holder.textContent = "";

    var width = 520, height = 400, cx = width / 2, cy = height / 2, radius = 140, maxLevel = 4;
    var n = DATA.domains.length;
    var svg = svgEl("svg", {
      viewBox: "0 0 " + width + " " + height,
      width: width, height: height,
      role: "img",
      "aria-label": "Radar chart of maturity per domain"
    });
    var title = svgEl("title");
    title.textContent = DATA.domains.map(function (d) {
      return d.short + " " + fmt(scores.domains[d.key].score);
    }).join(", ");
    svg.appendChild(title);

    function point(i, value) {
      var angle = (-Math.PI / 2) + (2 * Math.PI * i / n);
      var r = radius * value / maxLevel;
      return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    }

    // rings 1..4
    for (var ring = 1; ring <= maxLevel; ring++) {
      var pts = [];
      for (var i = 0; i < n; i++) { pts.push(point(i, ring).join(",")); }
      svg.appendChild(svgEl("polygon", { class: "radar-grid", points: pts.join(" ") }));
      var lp = point(0, ring);
      var ringLabel = svgEl("text", { class: "radar-ring-label", x: lp[0] + 4, y: lp[1] - 2 });
      ringLabel.textContent = String(ring);
      svg.appendChild(ringLabel);
    }
    // axes and labels
    DATA.domains.forEach(function (d, i) {
      var outer = point(i, maxLevel);
      svg.appendChild(svgEl("line", { class: "radar-axis", x1: cx, y1: cy, x2: outer[0], y2: outer[1] }));
      var lab = point(i, maxLevel + 1.1);
      var anchor = Math.abs(lab[0] - cx) < 10 ? "middle" : (lab[0] < cx ? "end" : "start");
      var text = svgEl("text", { class: "radar-label", x: lab[0], y: lab[1] + 4, "text-anchor": anchor });
      text.textContent = d.short;
      svg.appendChild(text);
      var sc = svgEl("text", { class: "radar-label-score", x: lab[0], y: lab[1] + 18, "text-anchor": anchor });
      sc.textContent = fmt(scores.domains[d.key].score);
      svg.appendChild(sc);
    });
    // shape
    var shapePts = [];
    DATA.domains.forEach(function (d, i) {
      var v = scores.domains[d.key].score;
      shapePts.push(point(i, v === null ? 0 : v));
    });
    svg.appendChild(svgEl("polygon", { class: "radar-shape", points: shapePts.map(function (p) { return p.join(","); }).join(" ") }));
    shapePts.forEach(function (p) {
      svg.appendChild(svgEl("circle", { class: "radar-point", cx: p[0], cy: p[1], r: 4 }));
    });
    holder.appendChild(svg);
  }

  function renderGaps() {
    var tbody = document.querySelector("#gap-table tbody");
    tbody.textContent = "";
    var gaps = lowestQuestions(GAP_COUNT);
    if (!gaps.length) {
      tbody.appendChild(el("tr", {}, [el("td", { colspan: "5", class: "muted", text: "No answers yet." })]));
      return;
    }
    gaps.forEach(function (q, i) {
      var lvl = state.answers[q.id];
      var step = lvl >= 4 ? "Already at the top level: keep the evidence current and re-assess yearly." : q.next[lvl];
      tbody.appendChild(el("tr", {}, [
        el("td", { class: "num", text: String(i + 1) }),
        el("td", {}, [el("strong", { text: q.id + " " }), q.text]),
        el("td", { text: domainsByKey[q.domain].short }),
        el("td", {}, [el("span", { class: "pill lvl-" + lvl, text: lvl + " " + DATA.levels[lvl].name })]),
        el("td", { text: step })
      ]));
    });
  }

  /* ------------------------------------------------------------ export / import */

  function buildExport() {
    var scores = computeScores();
    var domains = {};
    DATA.domains.forEach(function (d) {
      var dom = scores.domains[d.key];
      domains[d.key] = { name: d.name, answered: dom.answered, total: dom.total,
        score: dom.score === null ? null : Math.round(dom.score * 100) / 100 };
    });
    return {
      schema: EXPORT_SCHEMA,
      question_bank_version: DATA.version,
      exported_at: new Date().toISOString(),
      organisation: state.meta.organisation || "",
      assessor: state.meta.assessor || "",
      assessment_date: state.meta.date || "",
      overall_score: scores.overall === null ? null : Math.round(scores.overall * 100) / 100,
      overall_level: scores.overall === null ? null : levelName(scores.overall),
      answered: scores.answered,
      total: scores.total,
      domains: domains,
      answers: state.answers,
      notes: state.notes,
      top_gaps: lowestQuestions(GAP_COUNT).map(function (q) {
        var lvl = state.answers[q.id];
        return { id: q.id, level: lvl, next_step: lvl >= 4 ? null : q.next[lvl] };
      })
    };
  }

  function exportJson() {
    var payload = buildExport();
    var blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var slug = (state.meta.organisation || "soc").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "soc";
    var a = el("a", { href: url, download: "soc-maturity-" + slug + "-" + (state.meta.date || todayIso()) + ".json" });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    setStatus("Exported " + payload.answered + " answers.", "ok");
  }

  function applyImported(obj, silent) {
    if (!obj || typeof obj !== "object" || !obj.answers || typeof obj.answers !== "object") {
      throw new Error("File does not contain an answers object.");
    }
    var answers = {};
    var unknown = 0;
    Object.keys(obj.answers).forEach(function (id) {
      var v = obj.answers[id];
      if (!questionsById[id]) { unknown += 1; return; }
      if (typeof v === "number" && v >= 0 && v <= 4 && Math.floor(v) === v) { answers[id] = v; }
    });
    var notes = {};
    if (obj.notes && typeof obj.notes === "object") {
      Object.keys(obj.notes).forEach(function (id) {
        if (questionsById[id] && typeof obj.notes[id] === "string" && obj.notes[id]) { notes[id] = obj.notes[id].slice(0, 2000); }
      });
    }
    var meta = obj.meta && typeof obj.meta === "object" ? obj.meta : {};
    state = {
      answers: answers,
      notes: notes,
      meta: {
        organisation: String(meta.organisation || obj.organisation || "").slice(0, 200),
        assessor: String(meta.assessor || obj.assessor || "").slice(0, 200),
        date: String(meta.date || obj.assessment_date || "").slice(0, 10)
      }
    };
    refreshAllQuestions();
    renderResults();
    saveDraft();
    if (!silent) {
      var msg = "Imported " + Object.keys(answers).length + " answers";
      if (unknown) { msg += " (" + unknown + " unknown question id(s) ignored)"; }
      setStatus(msg + ".", "ok");
    }
  }

  function importJson(file) {
    if (!file) { return; }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        applyImported(JSON.parse(String(reader.result)), false);
      } catch (e) {
        setStatus("Import failed: " + e.message, "error");
      }
    };
    reader.onerror = function () { setStatus("Could not read the file.", "error"); };
    reader.readAsText(file);
  }

  function loadSample(askFirst) {
    var sample = window.SOC_MATURITY_SAMPLE;
    if (!sample) { setStatus("Sample data is not available.", "error"); return; }
    if (askFirst && Object.keys(state.answers).length &&
        !window.confirm("Replace your current answers with the fictional Northwind Logistics sample?")) {
      return;
    }
    applyImported(sample, true);
    setStatus("Loaded the fictional Northwind Logistics sample (" + Object.keys(state.answers).length + " answers).", "ok");
    document.getElementById("demo-banner").hidden = false;
  }

  /* First visit: show the sample so the results are visible; "start blank" remembers the choice. */
  var BLANK_KEY = "soc-maturity-blank";
  function startBlank() {
    state = { answers: {}, notes: {}, meta: { organisation: "", assessor: "", date: todayIso() } };
    clearDraft();
    try { window.localStorage.setItem(BLANK_KEY, "1"); } catch (e) { /* ignore */ }
    document.getElementById("demo-banner").hidden = true;
    refreshAllQuestions();
    renderResults();
    setStatus("Blank assessment: answer the questions to build your own results.", "ok");
  }
  function wantsBlank() { try { return window.localStorage.getItem(BLANK_KEY) === "1"; } catch (e) { return false; } }

  function resetAll() {
    if (!window.confirm("Clear all answers, notes and the saved draft?")) { return; }
    state = { answers: {}, notes: {}, meta: { organisation: "", assessor: "", date: todayIso() } };
    clearDraft();
    refreshAllQuestions();
    renderResults();
    setStatus("Answers cleared.", "ok");
  }

  /* ------------------------------------------------------------ wiring */

  function bindMeta(id, key) {
    var input = document.getElementById(id);
    input.addEventListener("input", function () {
      state.meta[key] = input.value;
      saveDraft();
    });
  }

  function init() {
    initTheme();
    renderLegend();
    renderQuestionnaire();
    bindMeta("meta-org", "organisation");
    bindMeta("meta-assessor", "assessor");
    bindMeta("meta-date", "date");

    document.getElementById("btn-export").addEventListener("click", exportJson);
    document.getElementById("file-import").addEventListener("change", function (ev) {
      importJson(ev.target.files && ev.target.files[0]);
      ev.target.value = "";
    });
    document.getElementById("btn-print").addEventListener("click", function () { window.print(); });
    document.getElementById("btn-reset").addEventListener("click", resetAll);
    document.getElementById("btn-sample").addEventListener("click", function () { loadSample(true); });
    document.getElementById("btn-start-blank").addEventListener("click", startBlank);

    var wantsSample = /[?&]sample=1(&|$)/.test(window.location.search);
    var restored = wantsSample ? false : loadDraft();
    if (wantsSample || (!restored && !wantsBlank())) {
      loadSample(false);
    } else if (!restored) {
      state.meta.date = todayIso();
      refreshAllQuestions();
      renderResults();
    } else {
      setStatus("Draft restored from this browser.", "");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
