# Auditable AI-Assisted Referral Review Demo

A frontend-only interactive demo of a governed referral intake workflow. The demo simulates how deterministic rules, evidence-bound LLM advisory output, human review, audit trails, and replay comparison can work together when an AI-assisted decision needs to be auditable, replayable, and human-governed.

> **Mock demo boundaries**
>
> - This is a frontend-only mock demo.
> - It does not process real PHI.
> - It does not call real LLM APIs.
> - It does not connect to production systems.
> - It does not make real business decisions.

## Overview

Built with Next.js 15 App Router, TypeScript (strict), Tailwind CSS, and Vitest. Interactive state for the case workspace is managed by a local `useReducer`. All "data" is static TypeScript mock data; there is no backend, database, or external API call at runtime.

The demo demonstrates a workflow where the LLM is **advisory only**: the deterministic rule engine produces the preliminary decision, the workflow policy chooses routing, the LLM may attach evidence-bound observations, and a human reviewer's confirm or override is the final authority. Every important event lands in an audit timeline with explicit causation. A separate replay page compares baseline vs candidate policy/prompt versions against the same mock cases.

## What This Demo Shows

- A case selector listing three mock referral cases.
- A case workspace per case with referral summary, normalized fields, evidence package, rule evaluation, LLM advisory, human review panel, audit timeline, and payload preview.
- Click any rule reason code, missing field, conflict flag, routing reason, LLM evidence summary, missing-field analysis, or risk flag chip to highlight its supporting evidence in the evidence package.
- Click any audit row to load that event's payload in the payload preview panel.
- Submit a confirm review — two audit events appended (`HumanReviewSubmitted`, `FinalDecisionRecorded`), final decision recorded, status updated.
- Submit an override review — three audit events appended (`HumanReviewSubmitted`, `HumanOverrideSubmitted`, `FinalDecisionRecorded`), `overrideFlag: true`, override reason recorded.
- Reset Case — restores the case to its initial mock state and clears selection state; the workspace can be submitted again.
- Replay comparison page — side-by-side baseline vs candidate outputs with rule, routing, review-requirement, and risk-flag deltas, plus a potential regression flag and verbatim version change notes.

## What This Demo Is Not

- Not a backend service. No API server, no message queue, no background worker.
- Not connected to a database. All data is static TypeScript modules.
- Not calling a real LLM. The LLM "advisory" output is hand-authored mock data.
- Not HIPAA-compliant and not handling real PHI. Mock data uses only whitelisted identifier formats.
- Not implementing `request_more_info` in the live review submit flow. The MVP supports only `confirm` and `override` reviewer actions. (`needs_more_evidence` appears only as a candidate routing result in replay output.)
- Not implementing authentication, RBAC, multi-reviewer assignment, SLA tracking, or concurrent reviewer conflict handling.
- Not a real replay execution engine. The replay page consumes pre-authored mock outputs that demonstrate the policy/prompt version notes; it does not re-run rules or prompts.
- Not deployed to any healthcare client and not integrated with any EHR or payer system.

## Core Design Principles

1. **Rule-first, LLM-advisory.** The deterministic rule engine produces the preliminary decision. The LLM provides advisory output bound to evidence and never sets the final decision.
2. **Evidence-bound AI outputs.** Every LLM summary, missing-field analysis, and risk flag carries `supportingEvidenceIds` referencing the case's evidence package. Free-form summaries without evidence references are disallowed at the type level.
3. **Human review as governance boundary.** Reviewers confirm or override the rule decision. The human action is the final authority and is recorded in the audit trail with explicit reviewer action and override reason.
4. **Replay before policy/prompt promotion.** Policy and prompt version changes are compared against historical cases before promotion, surfacing rule, routing, review-requirement, and risk-flag deltas plus a potential regression flag.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Case study landing page |
| `/demo` | Case selector |
| `/cases/case-a` | Clear-accept workflow (low-risk auto-accept) |
| `/cases/case-b` | Missing-evidence / needs-review workflow |
| `/cases/case-c` | Rule-reject / human-override workflow |
| `/replay` | Replay and evaluation comparison |

Case detail routes are prerendered as static HTML via `generateStaticParams`. The other routes are statically generated at build time.

## Architecture Overview

```
app/
  page.tsx                    case study landing page (server)
  demo/page.tsx               case selector (server)
  cases/[caseId]/page.tsx     case workspace shell (server)
  replay/page.tsx             replay page (server)
  layout.tsx                  shared shell + nav

components/
  case-study/                 landing page sections
  demo/                       case selector grid + card
  workflow/
    CaseWorkspaceClient.tsx   client island; owns the reducer + header
    ReferralSummaryCard.tsx
    NormalizedFieldsCard.tsx
    EvidencePanel.tsx         client; selection highlight + clear control
    RuleEvaluationCard.tsx    client; evidence chip buttons
    LLMAdvisoryCard.tsx       client; evidence chip buttons
    HumanReviewPanel.tsx      client; confirm/override form
    AuditTimeline.tsx         client; row click handlers
    AuditEventPayloadPanel.tsx  pure renderer of the selected event
  replay/
    ReplayClient.tsx          client island; owns selected row
    ReplayComparisonTable.tsx client; row buttons
    ReplayPromotionGate.tsx   selected-case explanation + regression flag
    VersionChangeNotes.tsx
    ReplaySummaryCards.tsx
    ReplayDiffPanel.tsx       collapsed raw baseline/candidate JSON
  layout/Nav.tsx              top navigation

lib/
  caseReducer.ts              CaseDetailState + 5 actions
  eventFactory.ts             appended audit event constructors
  statusMapping.ts            ACCEPT/REJECT to status mapping

data/
  cases.ts                    three mock cases (A, B, C)
  replayRuns.ts               one mock replay run with three comparisons

types/
  referral.ts                 authoritative type contract for cases
  replay.ts                   authoritative type contract for replay

scripts/
  validate-mock-data.ts       mock data + replay validator

tests/
  caseReducer.test.ts         9 reducer unit tests
```

The case workspace mounts a single client component (`CaseWorkspaceClient`) that owns all interactive state via `useReducer(caseReducer, initialCase, buildInitialState)`. The page itself stays server-rendered with `notFound()` plus `generateStaticParams`.

The reducer handles five actions:

- `SELECT_EVIDENCE` and `CLEAR_EVIDENCE_SELECTION` — UI selection only.
- `SELECT_AUDIT_EVENT` — UI selection only.
- `SUBMIT_REVIEW` — appends 2 (confirm) or 3 (override) audit events, updates `humanReview`, sets `finalDecision`, updates `currentStatus` and `currentStage`.
- `RESET_CASE` — deep-clones the initial case and clears selections back to the first-event default.

Audit events appended at submit time carry a `causationEventId` that points strictly backward to an earlier event in the same case.

## Implemented Interactions

- **Evidence-binding clicks.** Rule reason codes, missing fields, conflict flags, routing reason codes, LLM evidence summaries, LLM missing-field analyses, and LLM risk flags each carry `supportingEvidenceIds`. Clicking any chip dispatches `SELECT_EVIDENCE` with the item's array; the evidence panel highlights matching records and shows a `Clear selection (N)` control.
- **Audit row selection.** Audit timeline rows are buttons with `aria-pressed`. Clicking dispatches `SELECT_AUDIT_EVENT`; the payload preview panel renders the selected event's metadata and pretty-printed JSON payload.
- **Confirm submission.** Reviewer chooses `confirm`, a final decision (`ACCEPT` or `REJECT`), and an optional reviewer note. The reducer appends `HumanReviewSubmitted` then `FinalDecisionRecorded`. `currentStatus` becomes `accepted` or `rejected`; `currentStage` becomes `completed`.
- **Override submission.** Reviewer chooses `override`, a final decision, and a required override reason. The reducer appends `HumanReviewSubmitted`, `HumanOverrideSubmitted`, then `FinalDecisionRecorded`. `overrideFlag` is set to `true`.
- **No-op guards.** Submitting on a `not_required` case is a no-op. Submitting an already-submitted review is a no-op. Submitting an override with a blank reason is a no-op (the form's Submit button is also disabled in that state).
- **Reset Case.** Restores the initial case clone and resets selections. The case can be submitted again after reset.
- **Replay row selection.** `ReplayClient` owns a `useState` for the selected row. Clicking Case A, B, or C in the comparison table updates the promotion-gate explanation above the table (rule, routing, review-requirement, risk-flag deltas and the potential-regression flag for the selected case). The raw baseline/candidate JSON sits below in a collapsed `<details>` panel as supporting detail.

## Mock Data and Safety

The three mock cases live in `data/cases.ts` and use only whitelisted identifier formats:

- `referralId`: `ref_case_a_001`, `ref_case_b_001`, `ref_case_c_001`
- `patientReferenceId`: `patient_ref_001` ... `patient_ref_003`
- `sourceSystem`: `External Intake Portal`, `Internal Referral System`
- `serviceType`: `home_health`, `outpatient_therapy`, `skilled_nursing`
- `state`: `MD`, `VA`, `DC`
- `payerType`: `MEDICAID`, `MEDICARE`, `PRIVATE`, `TRICARE`
- `sourceName`: `Eligibility Portal Record`, `Extracted Document Evidence`, `Internal System Record`

The validator in `scripts/validate-mock-data.ts` enforces, for each case:

- Unique case ids; unique evidence ids per case.
- Every `supportingEvidenceIds` reference resolves within the same case.
- Every audit event carries `schemaVersion: "1.0"`, `correlationId`, `workflowInstanceId`, and a backward `causationEventId` if present.
- Case A's timeline ends at `FinalDecisionRecorded`; Cases B and C end at `HumanReviewRequested` and contain no `HumanReviewSubmitted` / `HumanOverrideSubmitted` / `FinalDecisionRecorded` initially.
- Case C carries `POLICY_REQUIRES_HUMAN_CONFIRMATION_ON_REJECT` as a routing reason.
- `LLMReviewCompleted` is preceded by `LLMReviewRequested`; `LLMReviewSkipped` appears only when `llmAdvisory.status === "skipped"`.
- Any case with a `finalDecision` has consistent `currentStatus` and `currentStage: "completed"`.
- `evidence.usedBy` matches actual rule/LLM references bidirectionally.
- Generated LLM output has fully evidence-bound summaries, missing-field analyses, and risk flags.

A PHI/PII pattern scan rejects email-, phone-, SSN-, and slash-date-shaped strings; a stoplist for common given/surnames; and a stoplist for real US payer/facility names.

The validator also runs three minimal checks on `data/replayRuns.ts`: `reasonCodes` and `riskFlags` are string arrays, `requiresHumanReview` is consistent with `routingDecision`, and the literal `request_more_info` does not appear.

## Replay and Evaluation

`data/replayRuns.ts` contains one replay run comparing `policy_v1 + prompt_v1` (baseline) against `policy_v2 + prompt_v2` (candidate) over the three mock cases. Each comparison's diff is grounded in a specific spec policy/prompt version note (the inline comment cites the source):

- **Case A** — baseline equals candidate. Policy v2 explicitly states low-risk accept behavior is unchanged.
- **Case B** — baseline equals candidate. Policy v2's `needs_more_evidence` routing is introduced for missing physician orders that *may be* recoverable through document re-fetch. Case B's mock data carries no explicit recoverability signal, so routing stays at `human_review_required`.
- **Case C** — candidate routing changes from `human_review_required` to `needs_more_evidence`. Policy v2: "Eligibility conflict or stale evidence cases route to needs_more_evidence before human review." `requiresHumanReview` flips to `false`. This comparison is flagged as a potential regression because the immediate routing changes before human attention.

The replay page does not execute rules or call an LLM. It reads the pre-authored comparison data and renders the diff.

## Local Development

Requires Node 20 (pinned via `.nvmrc`).

```bash
npm install
npm run dev
```

The dev server starts on `http://localhost:3000`.

## Validation and Tests

| Command | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript compile check (`tsc --noEmit`) |
| `npm run validate:mock` | Runs the case + replay validator |
| `npm run test` | Runs Vitest reducer tests in `tests/caseReducer.test.ts` |
| `npm run build` | Production build via `next build` |
| `npm run dev` | Local dev server |
| `npm run start` | Serve the built production output |

## Vercel Hobby Deployment

This project deploys to Vercel Hobby with zero configuration:

1. Push the repository to GitHub.
2. In the Vercel dashboard, import the repository.
3. Vercel auto-detects Next.js — accept the **Next.js** framework preset.
4. Build command: `npm run build`. Output directory: default.
5. **No environment variables are required.** No backend services, secrets, or API keys are consumed at build or runtime.
6. Deploy.

All routes prerender at build time. The case detail routes are SSG via `generateStaticParams`. The deployed site has no server-side runtime requirements beyond the Next.js static handler.

## Pre-deploy Checklist

Run these commands locally before pushing:

```bash
npm run typecheck
npm run validate:mock
npm run test
npm run build
```

Expected outcomes:

- [ ] `typecheck` finishes with no errors.
- [ ] `validate:mock` prints `Mock data validation PASSED for 3 cases (case-a, case-b, case-c) and 1 replay run(s)`.
- [ ] `test` reports 9/9 reducer tests passed.
- [ ] `build` finishes with the case routes marked SSG (`●`) and the other routes marked static (`○`).

Spot-check the deployed site or local dev server:

- [ ] `/` renders the landing page with the mock-demo boundary block visible.
- [ ] `/demo` renders three case cards linking to `/cases/case-a|b|c`.
- [ ] `/cases/case-a` renders status `accepted`, stage `completed`, and the human review panel shows the "not required" banner with no form.
- [ ] `/cases/case-b` renders status `needs_review`, an evidence-bound LLM advisory, and a review form. Confirm or override submission updates the audit timeline and the header badges.
- [ ] `/cases/case-c` renders rule decision `REJECT`, routing `human_review_required`, and the `POLICY_REQUIRES_HUMAN_CONFIRMATION_ON_REJECT` routing reason. Overriding to `ACCEPT` appends three audit events and updates the final-decision badge.
- [ ] `/replay` renders the promotion gate, summary cards, comparison table, version change notes, and the collapsed raw-output panel. Case C is selected by default and its promotion gate shows the regression interpretation; selecting Case A or B updates the gate and the raw output to that case.

## Interview Framing

The demo is designed to be discussed as a small but coherent system-design exercise focused on the boundary between deterministic logic, AI advisory output, and human governance.

- **Rule-first workflow automation.** A deterministic rule engine produces the preliminary decision (`RuleDecision`). A separate workflow policy chooses routing (`RoutingDecision`). These are independent types and independent layers; conflating them is a common failure mode the demo deliberately disallows at the type level.
- **LLM advisory boundary.** `LLMAdvisory` is a discriminated union (`skipped` / `generated` / `failed`); only the `generated` branch carries evidence-bound output. The LLM never sets `currentStatus`, `currentStage`, or `finalDecision`. The discriminator is enforced by TypeScript and by the validator's evidence-binding checks.
- **Evidence binding.** Every advisory item and every rule code references `supportingEvidenceIds`. The UI lifts those references into clickable chips; clicking surfaces the records that ground the claim. The UI affordance is a window onto the same invariant the type system encodes.
- **Human-in-the-loop review.** `HumanReview` is a discriminated union; the `not_required` variant carries only a reason, and the post-submit `submitted` variant carries the reviewer action, final decision, override flag, and notes. The reducer enforces transitions; the form prevents invalid override submissions.
- **Auditability and causation chains.** Every appended audit event carries `causationEventId` pointing at an earlier event in the same case. The validator enforces this for initial timelines; the reducer enforces it for appended events by passing the prior event list through the event factory.
- **Replay and evaluation before policy or prompt promotion.** The replay page exists because policy and prompt version changes need to be reviewed *before* they hit production. The diff surfaces rule, routing, review-requirement, and risk-flag deltas plus a potential regression flag — explicitly not a benchmark score. Comparison diffs are grounded in specific spec version-change notes.

Each implementation phase is logged in `LEARNINGS.md` with scope, decisions, stuck points, and what would be done differently.
