# The maturity model

This page defines the five levels, what each level means in every domain, and the evidence an assessor
should expect before awarding a level. Use it to calibrate answers across teams and to prepare for an
internal audit of the assessment.

## The five levels

| Level | Name | One-line test | Typical evidence |
|-------|------|---------------|------------------|
| 0 | **Initial** | The capability depends on individuals and memory. If the key person left, it would stop. | None, or chat history and personal notes. |
| 1 | **Developing** | Something is written down or partly in place, but it is incomplete, unapproved or applied inconsistently. | Draft documents, partial deployments, undated lists. |
| 2 | **Defined** | The capability is documented, approved and followed most of the time. Exceptions are not tracked. | Approved procedure, owner named, used in real cases. |
| 3 | **Managed** | The capability is measured and reviewed. Deviations are visible and acted on. | Metrics with targets, review minutes, action logs, test records. |
| 4 | **Optimised** | The capability improves continuously from evidence, is automated where that makes sense, and adapts to change. | Trend data showing improvement, automation with audit trails, documented adjustments after incidents or threat changes. |

Two rules keep scores honest:

* **Award the level you can prove, not the level you are working toward.** A roadmap item is not a control.
* **A level requires the levels below it.** You cannot be "Managed" on a process that is not written down.

Scores are averaged per domain (sum of question levels divided by answered questions) and the overall
score is the mean of the six domain averages, so every domain weighs the same regardless of its number
of questions. Round to one decimal for reporting; use the full value for comparisons over time.

## Level definitions per domain

### 1. Governance & strategy

| Level | What it looks like | Evidence that supports it |
|-------|--------------------|---------------------------|
| 0 | No charter, no plan, no metrics. The SOC exists because alerts exist. | — |
| 1 | A draft charter or a wish list of projects; occasional numbers shown to management. | Draft documents, ad hoc slides. |
| 2 | Approved charter, service catalogue, 12-month roadmap, monthly metric set, yearly budget. | Signed charter, catalogue with targets, roadmap with owners, monthly report, budget line. |
| 3 | Metrics have targets and trends; roadmap and budget are tracked quarterly; obligations are mapped; providers are reviewed against SLAs. | Quarterly review minutes, variance reports, control-to-obligation mapping, provider scorecards. |
| 4 | Investment and priorities are driven by measured gaps and the threat profile; the charter and roadmap are re-baselined after major change. | Decision records citing metrics, benefit-realisation reviews, dated threat-profile revisions. |

### 2. People & skills

| Level | What it looks like | Evidence that supports it |
|-------|--------------------|---------------------------|
| 0 | Coverage depends on who is around; no roles, no training plan, knowledge in heads. | — |
| 1 | A rota exists with gaps; job titles without responsibilities; training on request; scattered documents. | Rota, job adverts, training receipts, shared folders. |
| 2 | Staffing sized to coverage hours; role descriptions; yearly training plan per role; onboarding plan; single knowledge base; scheduled rotation; two exercises a year; skills matrix. | Role descriptions, training plan and budget, onboarding checklist, knowledge base with owners, exercise reports, skills matrix. |
| 3 | Capacity, workload, time to independence and training outcomes are measured; exercise findings become actions; the matrix drives hiring. | Capacity dashboards, overtime data, onboarding metrics, action trackers, matrix updates every six months. |
| 4 | Staffing is forecast from volume and automation; wellbeing and retention data feed decisions; single points of failure are removed on purpose. | Forecast models, retention and satisfaction trends, cross-training records showing two people per critical capability. |

### 3. Processes

| Level | What it looks like | Evidence that supports it |
|-------|--------------------|---------------------------|
| 0 | Triage by instinct, escalation by acquaintance, work tracked in email, no handover, no playbooks, no review. | — |
| 1 | Short guidelines and contact lists; inconsistent ticketing; verbal handover; a few vendor playbooks; occasional spot checks. | Guideline documents, contact list, partial tickets. |
| 2 | Documented triage procedure and classification; escalation matrix incl. out of hours; every alert is a case with mandatory fields; written handover; playbooks for top scenarios; weekly QA sample; change log; monthly sync with vulnerability management; improvement backlog. | Procedures with owners, case tool configuration, handover notes, playbooks with review dates, QA log, change records, backlog. |
| 3 | Time to triage, case completeness, escalation tests, dropped handover items, QA findings per analyst and change failures are measured; emergency-change path exists. | Metric reports with targets, drill results, QA trend charts, incident-caused-by-change records. |
| 4 | Procedures are embedded in tooling; handover and escalation are generated automatically; playbooks are linked to detections and partly automated; recurrence rates fall. | Tool configuration, automation logs, recurrence metrics, dated playbook improvements after incidents. |

### 4. Detection engineering

| Level | What it looks like | Evidence that supports it |
|-------|--------------------|---------------------------|
| 0 | Rules are whatever the vendor shipped; nothing is mapped, tested, documented or retired. | — |
| 1 | Some rules carry ATT&CK tags; exports to a shared folder; eyeball checks on historical data; untracked exceptions; uncurated indicator feeds. | Tagged rules, folder exports, feed configuration. |
| 2 | Documented lifecycle with owners; coverage map with gap list; rules in version control with peer review; tests before deployment; tracked tuning requests; curated indicators with expiry; prioritised use-case backlog; documentation template applied; scheduled hunts with hypotheses. | Rule inventory, Navigator layer or equivalent, repository history, test evidence per rule, tuning tickets, indicator metadata, backlog, hunt reports. |
| 3 | Rule performance, false-positive rates, coverage gaps, intelligence relevance and hunt outcomes are measured; stale rules retired; exceptions expire; deployment automated with validation. | Quarterly rule reviews, precision trends, pipeline logs, expired-exception reports, hunt outcome tracker. |
| 4 | Automated emulation validates coverage; tuning uses case data automatically; intelligence, detections and hunts form a loop; documentation generated from metadata. | Emulation pass rates, automated tuning records, feedback to intelligence sources, generated rule docs with test history. |

### 5. Incident response

| Level | What it looks like | Evidence that supports it |
|-------|--------------------|---------------------------|
| 0 | No plan; containment needs an administrator and an approval each time; evidence is lost; communication is improvised; no reviews. | — |
| 1 | A generic plan nobody has exercised; some containment possible but slow; ad hoc collection; contact list; reviews for major incidents without actions. | Plan document, contact list, incident emails. |
| 2 | Approved plan with severity matrix, roles and decision rights; pre-approved containment actions with tooling access; acquisition procedures and chain of custody; communication templates, spokespeople and a secure channel; review template with actions; automated enrichment; yearly exercise with IT and management; notification triggers documented. | Signed plan, containment authority matrix, custody forms, templates, review records, enrichment automation, exercise report, notification procedure. |
| 3 | Time to contain is measured; containment actions are logged and reviewed; acquisitions practised; communications logged; action completion tracked; automated playbooks with approval points; exercises test plan sections; notification clock tracked in incidents. | MTTC reports, action audit trails, exercise findings with resulting changes, notification logs. |
| 4 | Plan integrates with business continuity and crisis management; safe containment is automated with guardrails; evidence handling withstands legal scrutiny; readiness measured over time; repeat incidents decrease. | Integrated plans, automation guardrail configuration, legal review of evidence process, readiness trend, recurrence metric. |

### 6. Technology & telemetry

| Level | What it looks like | Evidence that supports it |
|-------|--------------------|---------------------------|
| 0 | Default SIEM sources only; raw logs; platform problems found when alerts stop; antivirus only; identity, cloud and SaaS not collected; manual lookups; default retention. | — |
| 1 | Major sources collected but coverage unmeasured; vendor parsers as is; unowned ingestion dashboards; EDR on some systems; sign-in logs only; cloud logs enabled but not centralised; inventory not connected; retention set by cost. | Source list, dashboards, EDR console counts. |
| 2 | Log-source inventory with required sources per asset group; common data model with visible parsing failures; owned health alerts; EDR on all supported endpoints with health checks; identity audit, MFA and privilege events; cloud control-plane logs centralised; asset and identity context in alerts; retention per source from needs. | Inventory, data-model mapping, health alert configuration, EDR coverage report, identity source list, cloud forwarding configuration, lookup tables, retention policy. |
| 3 | Coverage, field completeness, parsing errors, availability, EDR gaps and tampering, identity and cloud coverage, context quality and search performance are measured with targets; archive restoration tested yearly. | Monthly coverage metrics, SLA reports, remediation tickets with targets, restore test records. |
| 4 | Coverage validated continuously against the asset inventory and tied to use cases; schema drift detected automatically; policy-enforced logging in cloud; context drives severity and routing; tiered storage with legal review. | Automated reconciliation reports, drift alerts, policy-as-code, routing rules, retention review minutes. |

## Calibration tips

* **Assess in a group.** The SOC manager, a senior analyst and someone outside the SOC (IT operations or
  risk) will disagree in useful ways. Record the agreed level and the reason in the notes field.
* **Ask for the artefact.** If the answer is "we do that", ask to see it. No artefact, no level 2.
* **Beware the "managed" trap.** Measuring something once for an audit is not level 3. Level 3 means a
  cadence exists and the last three reviews happened.
* **Do not average away a zero.** A domain at 2.0 with one question at 0 may hide a bigger risk than a domain at 1.5.
  The gap table in the tool exists for this reason.
* **Re-assess with the same people and the same evidence rules** every 6 or 12 months so that the trend is real.
