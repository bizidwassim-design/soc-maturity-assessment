#!/usr/bin/env node
/*
 * Generates the derived data files from the source of truth (data/questions.js, data/sample.js):
 *   - data/questions.csv            the question bank for spreadsheets and GRC imports
 *   - examples/northwind-sample.json  a complete export in the app's JSON format
 *
 * Output is deterministic (LF line endings, fixed key and column order, fixed timestamp for the
 * sample) so CI can verify the generated files are up to date with `git diff --exit-code`.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const data = require(path.join(root, "data", "questions.js"));
const sample = require(path.join(root, "data", "sample.js"));

/* ------------------------------------------------------------------ CSV */

const header = [
  "id", "domain_key", "domain", "question",
  "level_0_initial", "level_1_developing", "level_2_defined", "level_3_managed", "level_4_optimised",
  "next_step_from_0", "next_step_from_1", "next_step_from_2", "next_step_from_3"
];
const domainName = Object.fromEntries(data.domains.map((d) => [d.key, d.name]));
const domainShort = Object.fromEntries(data.domains.map((d) => [d.key, d.short]));

function cell(value) {
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s;
}

const lines = [header.join(",")];
for (const q of data.questions) {
  lines.push([q.id, q.domain, domainName[q.domain], q.text, ...q.levels, ...q.next].map(cell).join(","));
}
const csvPath = path.join(root, "data", "questions.csv");
fs.writeFileSync(csvPath, lines.join("\n") + "\n", { encoding: "utf8" });
console.log(`wrote data/questions.csv (${data.questions.length} rows)`);

/* ------------------------------------------------------------------ sample export (same shape as the app's Export JSON) */

const byId = Object.fromEntries(data.questions.map((q) => [q.id, q]));
const levelName = (v) => data.levels[Math.max(0, Math.min(4, Math.round(v)))].name;
const round2 = (v) => Math.round(v * 100) / 100;

const domains = {};
for (const d of data.domains) {
  const qs = data.questions.filter((q) => q.domain === d.key);
  const answered = qs.filter((q) => typeof sample.answers[q.id] === "number");
  const score = answered.length ? answered.reduce((a, q) => a + sample.answers[q.id], 0) / answered.length : null;
  domains[d.key] = { name: d.name, answered: answered.length, total: qs.length, score: score === null ? null : round2(score) };
}
const scored = Object.values(domains).filter((d) => d.score !== null).map((d) => d.score);
const overall = scored.length ? scored.reduce((a, b) => a + b, 0) / scored.length : null;

const domainOrder = Object.fromEntries(data.domains.map((d, i) => [d.key, i]));
const topGaps = data.questions
  .filter((q) => typeof sample.answers[q.id] === "number")
  .sort((a, b) => (sample.answers[a.id] - sample.answers[b.id]) || (domainOrder[a.domain] - domainOrder[b.domain]) || (a.id < b.id ? -1 : 1))
  .slice(0, 10)
  .map((q) => ({ id: q.id, level: sample.answers[q.id], next_step: sample.answers[q.id] >= 4 ? null : q.next[sample.answers[q.id]] }));

const exportDoc = {
  schema: "soc-maturity-assessment/1.0",
  question_bank_version: data.version,
  exported_at: "2026-10-15T09:30:00.000Z",
  organisation: sample.organisation,
  assessor: sample.assessor,
  assessment_date: sample.assessment_date,
  overall_score: overall === null ? null : round2(overall),
  overall_level: overall === null ? null : levelName(overall),
  answered: Object.keys(sample.answers).filter((id) => byId[id]).length,
  total: data.questions.length,
  domains,
  answers: sample.answers,
  notes: sample.notes,
  top_gaps: topGaps
};

const examplesDir = path.join(root, "examples");
fs.mkdirSync(examplesDir, { recursive: true });
const samplePath = path.join(examplesDir, "northwind-sample.json");
fs.writeFileSync(samplePath, JSON.stringify(exportDoc, null, 2) + "\n", { encoding: "utf8" });
console.log(`wrote examples/northwind-sample.json (overall ${exportDoc.overall_score} ${exportDoc.overall_level}; ` +
  data.domains.map((d) => `${domainShort[d.key]} ${domains[d.key].score}`).join(", ") + ")");
