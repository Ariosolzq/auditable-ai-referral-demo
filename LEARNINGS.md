# Project Learnings Log

This file tracks what went well, what didn't, and how AI-assisted 
development decisions were made on each phase. Not for the README — 
this is for me to reference during interviews when asked about 
working with AI coding tools.

## Phase 0 — Initialization
- Status: completed
- Started: 2026-05-12
- Completed: 2026-05-12
- Scope: finish the partial Next.js scaffold; add Nav; create placeholder
  routes for /, /demo, /cases/[caseId], /replay; wire up typecheck and
  test scripts; install deps; verify typecheck and build.
- Decisions:
  - Followed LEARNINGS.md phase numbering (Phase 0 = init, Phase 1 = types,
    Phase 2 = mock cases + validator), not spec §13 numbering.
  - Kept the existing Next 15 / React 19 / Tailwind scaffold; did not
    re-run create-next-app.
  - Vitest installed with node environment (reducer tests will be pure
    functions). tsx deferred to Phase 2 when the validator is built.
  - Skipped ESLint setup; typecheck + build are the Phase 0 gates.
  - Used Next 15 async `params` API in `app/cases/[caseId]/page.tsx`
    (params is a Promise in App Router 15).
- Stuck points: none.
- How resolved: n/a.
- What I'd do differently: nothing for this phase.

## Phase 1 — Type system
- Status: completed
- Started: 2026-05-12
- Completed: 2026-05-12
- Scope: created types/referral.ts and types/replay.ts only.
- Decisions:
  - Kept Phase 1 declarations-only.
  - No type guards, helper functions, runtime validators, or zod schemas.
  - Preserved reserved/transient members from spec verbatim
    (ReferralStatus "needs_more_information"; WorkflowStage
    "llm_review_skipped" and "final_decision_recorded").
  - Kept request_more_info out of MVP types: ReviewerAction is
    "confirm" | "override" only; FinalDecisionValue is "ACCEPT" | "REJECT"
    only. needs_more_evidence remains in RoutingDecision because replay
    under policy_v2 produces it.
  - Kept AuditEvent.payload as Record<string, unknown>; per-eventType
    payload discrimination is deferred to the event factory in Phase 7a.
  - ReplayOutput.reasonCodes and riskFlags are string[] by design — replay
    compares version-level deltas, not full evidence binding.
- Stuck points: none.
- How resolved: n/a.
- What I'd do differently: nothing for this phase.

## Phase 2 — Mock cases + validator
- Status: completed
- Started: 2026-05-12
- Completed: 2026-05-12
- Scope:
  - created data/cases.ts with Case A, Case B, and Case C
  - created scripts/validate-mock-data.ts
  - added validate:mock script and tsx devDependency
- Decisions:
  - Phase 2 creates cases only; data/replayRuns.ts is deferred to Phase 8.
  - Validator is cases-only for now; replay validation is deferred to Phase 8.
  - Case A demonstrates low-risk auto-accept with LLMReviewSkipped.
  - Case B demonstrates missing physician order leading to human review.
  - Case B explicitly includes ELIGIBILITY_ACTIVE as rule evidence; the case
    routes to review because physician_order is missing, not because
    eligibility is unknown.
  - Case C demonstrates rule REJECT → human_review_required → later human
    override.
  - Validator checks evidence reference integrity, audit timeline shape,
    causationEventId ordering, PHI-like text, and usedBy consistency.
- Stuck points:
  - Replay validation scope was ambiguous; resolved by deferring
    replayRuns.ts and replay-specific validation to Phase 8.
  - Case B initially had eligibility evidence used only by LLM; resolved
    by adding ELIGIBILITY_ACTIVE to rule reason codes and updating usedBy.
- Commands run:
  - npm run typecheck
  - npm run validate:mock
  - npm run build
- What I'd do differently:
  - Keep Phase 2 scoped to cases and validator; avoid introducing replay
    fixtures too early.

## Phase 3 — Case Selector
- Status: completed
- Started: 2026-05-12
- Completed: 2026-05-12
- Scope:
  - created components/demo/CaseCard.tsx
  - created components/demo/CaseSelectorGrid.tsx
  - replaced the /demo placeholder with a read-only Case Selector page
  - performed structural verification using npm run dev and rendered HTML
    inspection
- Decisions:
  - kept Phase 3 server-component only; no useState/useReducer
  - kept badge styling inline inside CaseCard instead of creating shared
    StatusBadge
  - rendered technical state values verbatim rather than humanizing them
  - always rendered the Final field, using "—" when finalDecision is absent
  - displayed top rule reason codes by severity and routing reason chips
    for high/blocking routing reasons
  - kept Case Detail, evidence highlighting, audit interaction, reducer,
    and replay out of scope
- Verification:
  - npm run typecheck passed
  - npm run validate:mock passed
  - npm run build passed
  - npm run dev structural verification passed
  - /cases/case-a, /cases/case-b, /cases/case-c returned 200
- Stuck points:
  - no code blockers
  - true pixel-level visual QA still requires manual browser review
- What I'd do differently:
  - shared badge primitives can be considered in Phase 4 if multiple pages
    need them

## Phase 4 — Case Detail static UI
- Status: completed
- Started: 2026-05-12
- Completed: 2026-05-12
- Scope:
  - replaced /cases/[caseId] placeholder with a static case detail workflow
    workspace
  - added workflow display components:
    - ReferralSummaryCard
    - NormalizedFieldsCard
    - EvidencePanel
    - RuleEvaluationCard
    - LLMAdvisoryCard
    - HumanReviewPanel
    - AuditTimeline
    - AuditEventPayloadPanel
  - added generateStaticParams for case-a, case-b, and case-c
- Decisions:
  - kept the page read-only and server-rendered
  - did not create shared StatusBadge, SectionCard, or PageHeader primitives
  - did not refactor Phase 3 CaseCard
  - did not add framer-motion, shadcn, dialogs, tabs, accordions, or
    animations
  - did not add useState/useReducer, reducer, eventFactory, or
    evidenceSelectors
  - did not render disabled fake review controls or Reset Case button
  - rendered HumanReviewPanel as a read-only summary
  - rendered AuditTimeline as static list rows
  - rendered AuditEventPayloadPanel as a first-event payload preview
  - deferred evidence highlighting to Phase 5
  - deferred audit event selection to Phase 6
  - deferred review state transitions to Phase 7a
- Fixes during review:
  - added schemaVersion and causationEventId display to AuditTimeline rows
- Commands run:
  - npm run typecheck
  - npm run validate:mock
  - npm run build
- Stuck points:
  - over-engineering risk around shared UI primitives, disabled forms, and
    disabled Reset Case was avoided by keeping Phase 4 static and read-only
- What I'd do differently:
  - consider extracting shared badge/card primitives only later if
    duplication becomes difficult to maintain

## Phase 5 — Evidence binding interaction
- Status: not started

## Phase 6 — Audit event interaction
- Status: not started

## Phase 7a — Reducer implementation
- Status: not started

## Phase 7b — Reducer tests
- Status: not started

## Phase 8 — Replay & Evaluation
- Status: not started

## Phase 9 — Case Study Landing Page
- Status: not started

## Phase 10 — Polish / README / Deploy
- Status: not started
