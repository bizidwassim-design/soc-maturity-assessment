# Using the results: from gap list to 12-month roadmap

The assessment gives you three things: a score per domain, an overall score, and the ten weakest
questions with a concrete next step each. This page turns them into a roadmap that a SOC manager can
defend in front of leadership and a team can actually deliver.

## Step 1 — Read the shape before the number

Look at the radar first. Three shapes are common:

| Shape | Meaning | Usual first move |
|-------|---------|------------------|
| **Technology high, everything else low** | Tools were bought before the operating model existed. Alerts exist, decisions do not. | Processes and governance: triage procedure, escalation matrix, charter. Cheap, fast, high impact. |
| **Processes and response decent, detection low** | The team handles what it sees but sees too little. | Detection engineering: coverage map, lifecycle, testing. Needs telemetry coverage first (check TEC-01). |
| **Flat and low (everything 0–1)** | Early-stage SOC or a team that has been reacting for years. | Do not try to fix six domains at once. Pick governance (mandate, catalogue) and one operational domain. |

The overall score is for trend reporting. Decisions come from the domain scores and the gap list.

## Step 2 — Qualify the ten gaps

Export the JSON and open the `top_gaps` list, or read the gap table in the tool. For each gap, add three fields:

| Field | Question to ask | Scale |
|-------|-----------------|-------|
| **Risk relief** | If this stays at its current level for a year, what is the realistic bad outcome? | High / Medium / Low |
| **Effort** | Can the team do the next step with current people and tools? | Days / Weeks / Quarter |
| **Dependency** | Does another gap have to close first? (for example DET-02 coverage mapping needs TEC-01 log coverage) | Gap id or none |

Then sort: high relief and days-to-weeks effort first. Those are your first quarter. Anything that depends
on an unclosed gap moves later, however attractive it looks.

**A next step moves one level, not four.** The recommendation shown in the tool is the step from the
current level to the next one. When you plan a year, you will often schedule two consecutive steps for the
same question (for example level 0 to 1 in Q1, level 1 to 2 in Q3). That is normal; do not plan 0 to 4 in a year.

## Step 3 — Build the 12-month roadmap

A workable pattern for a team of three to eight people:

| Quarter | Theme | Typical content | Target |
|---------|-------|-----------------|--------|
| **Q1 — Foundations** | Write down what you already do | Charter (GOV-01), service catalogue (GOV-03), triage procedure (PRC-01), escalation matrix (PRC-02), case tool mandatory fields (PRC-03), five metrics (GOV-04) | Governance and Processes reach 2.0 on the questions touched |
| **Q2 — Visibility** | See what matters | Log-source inventory and biggest coverage gaps (TEC-01), EDR coverage measured (TEC-04), identity telemetry (TEC-05), rule inventory with owners (DET-01), ATT&CK tags on every rule (DET-02) | Technology ≥ 2.0; Detection ≥ 1.5 |
| **Q3 — Readiness** | Prove you can respond | IR plan approved (IR-01), pre-approved containment (IR-02), playbooks for top five alert types (PRC-05), first tabletop with IT and management (IR-07, PPL-07), post-incident review template (IR-05) | Response ≥ 2.0 |
| **Q4 — Measure and tune** | Make it stick | Weekly QA sample (PRC-06), tuning requests with expiry (DET-05), rules in version control (DET-03), skills matrix and training plan (PPL-08, PPL-03), rotation to protect the team (PPL-06), re-run the assessment | Overall ≥ 2.0; every domain ≥ 1.5 |

Adjust the content to your own gap list; keep the shape: foundations, visibility, readiness, measurement.

Each roadmap line needs an **owner**, a **done definition** (the level-definition text from
[maturity-model.md](maturity-model.md) is a good one) and the **evidence** that will prove it.

## Step 4 — Report to leadership

Leadership does not need fifty questions. Give them:

1. The radar (today) and, from the second assessment onward, the previous radar as a dotted outline.
2. The three gaps that carry the most risk, in business language ("we cannot isolate a compromised
   laptop outside office hours without finding an administrator" rather than "IR-02 is level 0").
3. The roadmap table with quarters, owners and what each quarter needs from them (a decision, a budget line, an hour of their time in an exercise).
4. One number to track: the overall score, with the target for the next assessment.

## Step 5 — Re-assess and keep the record

* Re-run the assessment every **6 months** while you are below 2.0, yearly afterwards.
* Keep every export (`soc-maturity-<org>-<date>.json`) in the SOC's document store. The files are small, human-readable and diffable.
* Use the same assessors and the same evidence rule ("show me the artefact") every time, otherwise the trend measures optimism rather than progress.
* When a question moves **down**, treat it as a finding: something was lost (a person left, a tool was replaced, a procedure stopped being used).

## Common mistakes

* **Planning by domain score.** A domain at 1.9 can hide a zero that matters more than a domain at 1.4. Plan from the gap list.
* **Buying a tool for a process gap.** Most level 0 to 2 moves are documents, decisions and habits.
* **Skipping governance because it is "paperwork".** A charter and a service catalogue are what let the SOC say no, ask for budget and contain without asking.
* **Letting the roadmap replace the operations.** Protect time for the queue; a roadmap that burns the team out moves PPL-06 to zero.

## Mapping to other frameworks

The six domains line up loosely with other models you may already report against; use this table when
someone asks "how does this compare":

| This tool | Related material (reference by name, not reproduced here) |
|-----------|-----------------------------------------------------------|
| Governance & strategy | ISO/IEC 27001:2022 clauses 5, 6 and 9; NIST CSF 2.0 *Govern* function |
| People & skills | ISO/IEC 27001:2022 clause 7.2; NIST CSF 2.0 PR.AT |
| Processes | ISO/IEC 27001:2022 Annex A 5.24–5.28 (incident management); NIST CSF 2.0 DE.AE, RS.MA |
| Detection engineering | NIST CSF 2.0 DE.CM, DE.AE; MITRE ATT&CK for coverage mapping |
| Incident response | ISO/IEC 27001:2022 Annex A 5.24–5.28; NIST CSF 2.0 *Respond* and *Recover* functions |
| Technology & telemetry | ISO/IEC 27001:2022 Annex A 8.15, 8.16; CIS Controls v8 controls 8 and 13; NIST CSF 2.0 DE.CM |

The question bank is original work and does not reproduce any standard's text.
