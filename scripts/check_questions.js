#!/usr/bin/env node
/*
 * CI check for the question bank: 50 questions, 6 domains, unique ids, 5 level texts and
 * 4 next steps per question, every question in a known domain, no empty strings.
 * Exit code 1 on any failure.
 */
"use strict";

const path = require("path");
const data = require(path.join(__dirname, "..", "data", "questions.js"));

const errors = [];
const check = (cond, msg) => { if (!cond) errors.push(msg); };

check(Array.isArray(data.domains) && data.domains.length === 6, `expected 6 domains, got ${data.domains && data.domains.length}`);
check(Array.isArray(data.questions) && data.questions.length === 50, `expected 50 questions, got ${data.questions && data.questions.length}`);
check(Array.isArray(data.levels) && data.levels.length === 5, "expected 5 levels");

const domainKeys = new Set(data.domains.map((d) => d.key));
const ids = new Set();
const perDomain = {};

for (const q of data.questions) {
  check(typeof q.id === "string" && /^[A-Z]{2,3}-\d{2}$/.test(q.id), `bad id ${q.id}`);
  check(!ids.has(q.id), `duplicate id ${q.id}`);
  ids.add(q.id);
  check(domainKeys.has(q.domain), `${q.id}: unknown domain ${q.domain}`);
  perDomain[q.domain] = (perDomain[q.domain] || 0) + 1;
  check(typeof q.text === "string" && q.text.trim().length > 20, `${q.id}: question text too short`);
  check(Array.isArray(q.levels) && q.levels.length === 5, `${q.id}: expected 5 level descriptions`);
  check(Array.isArray(q.next) && q.next.length === 4, `${q.id}: expected 4 next steps`);
  for (const s of [...(q.levels || []), ...(q.next || [])]) {
    check(typeof s === "string" && s.trim().length > 5, `${q.id}: empty level/next text`);
  }
}

for (const d of data.domains) {
  check(perDomain[d.key] >= 8, `domain ${d.key} has fewer than 8 questions (${perDomain[d.key] || 0})`);
}

// Nothing that identifies a real organisation may be present: no e-mail addresses, URLs or private IPs.
const text = JSON.stringify(data);
check(!/[\w.+-]+@[\w-]+\.[\w.-]+/.test(text), "e-mail address found in question bank");
check(!/https?:\/\//i.test(text), "URL found in question bank");
check(!/\b(10|192\.168|172\.(1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/.test(text), "private IP address found in question bank");

if (errors.length) {
  console.error("FAIL");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}
console.log(`OK: ${data.questions.length} questions, ${data.domains.length} domains, ${data.levels.length} levels (v${data.version})`);
console.log("    per domain:", JSON.stringify(perDomain));
