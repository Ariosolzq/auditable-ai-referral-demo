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
- Status: completed
- Started: 2026-05-12
- Completed: 2026-05-12
- Scope:
  - added evidence-binding interactions to the case detail workspace
  - added CaseWorkspaceClient as the minimal client boundary
  - wired rule reason codes, missing fields, conflict flags, routing
    reason codes, LLM evidence summaries, LLM missing field analysis,
    and LLM risk flags to EvidencePanel highlighting
  - added Clear selection
- Decisions:
  - kept app/cases/[caseId]/page.tsx as a server component
  - used useState only for selectedEvidenceIds
  - did not create reducer, eventFactory, or evidenceSelectors
  - selected evidence replaces previous selection instead of accumulating
  - evidence records are highlight targets, not clickable triggers
  - only supporting evidence chips are clickable, not entire rows
  - kept audit timeline static; audit event selection deferred to Phase 6
  - kept human review static; submit/override/reset deferred to Phase 7a
- Commands run:
  - npm run typecheck
  - npm run validate:mock
  - npm run build
- Stuck points:
  - client boundary needed to be controlled so the page remained
    server-rendered
- What I'd do differently:
  - keep client boundaries small when adding interaction to mostly
    server-rendered pages

## Phase 6 — Audit event interaction
- Status: completed
- Started: 2026-05-12
- Completed: 2026-05-12
- Scope:
  - added audit event selection to the case detail workspace
  - made AuditTimeline rows selectable
  - wired selected audit event to AuditEventPayloadPanel
  - kept evidence selection independent from audit selection
- Decisions:
  - kept CaseWorkspaceClient as the client boundary and state owner
  - used useState for selectedAuditEventId
  - initialized selectedAuditEventId to the first audit event id
  - added aria-pressed to audit event row buttons
  - did not introduce reducer, eventFactory, statusMapping, or
    evidenceSelectors
  - did not mutate auditEvents or append events
  - kept human review state transitions deferred to Phase 7a
- Verification:
  - npm run typecheck passed
  - npm run validate:mock passed
  - npm run build passed
  - manual browser interaction check passed
  - audit event selection updates Payload Preview
  - audit selection does not clear evidence selection
  - evidence selection does not change selected audit event
- Stuck points:
  - initial audit selection behavior was resolved by defaulting to the
    first audit event instead of an empty placeholder
- What I'd do differently:
  - keep audit selection as UI state until workflow mutation requires a
    reducer

## Phase 7a — Reducer implementation
- Status: completed
- Started: 2026-05-12
- Completed: 2026-05-12
- Scope:
  - added local reducer for case detail workspace state
  - added caseReducer, eventFactory, and statusMapping
  - added SUBMIT_REVIEW and RESET_CASE behavior
  - moved live top header into CaseWorkspaceClient
  - added HumanReviewPanel submit form for confirm / override
  - added scratch/manual-submit.ts for manual reducer verification
- Decisions:
  - used reducer only for local demo state; no backend, server action,
    or persistence
  - kept request_more_info excluded from runtime behavior
  - confirm appends HumanReviewSubmitted and FinalDecisionRecorded
  - override appends HumanReviewSubmitted, HumanOverrideSubmitted, and
    FinalDecisionRecorded
  - FinalDecisionRecorded actor is workflow-engine
  - currentStatus derives from finalDecision
  - currentStage becomes completed after submit
  - RESET_CASE restores cloned initial case, clears evidence selection,
    and resets selectedAuditEventId to the first audit event
  - buildInitialState clones caseData to avoid direct references to
    imported mock data
  - HumanReviewPanel uses a key based on case id, review status, and
    audit event length to reset local form state after submit/reset
- Manual verification:
  - npx tsx scratch/manual-submit.ts verified Case C override
  - Case C auditEvents length changed from 8 to 11
  - appended events were HumanReviewSubmitted, HumanOverrideSubmitted,
    FinalDecisionRecorded
  - currentStatus became accepted
  - currentStage became completed
  - finalDecision.decision became ACCEPT
  - causation chain was HumanReviewRequested → HumanReviewSubmitted →
    HumanOverrideSubmitted → FinalDecisionRecorded
- Commands run:
  - npm run typecheck
  - npm run validate:mock
  - npm run build
  - npx tsx scratch/manual-submit.ts
- Stuck points:
  - initial reducer state needed to clone caseData instead of storing
    the imported mock object directly
  - HumanReviewPanel local form state needed a remount key after
    submit/reset
- What I'd do differently:
  - verify reducer behavior manually before writing tests, so Phase 7b
    tests can use explicit expected values instead of copying reducer
    behavior

## Phase 7b — Reducer tests
- Status: completed
- Started: 2026-05-12
- Completed: 2026-05-12
- Scope:
  - added reducer tests in tests/caseReducer.test.ts
  - added Vitest alias resolution for @ imports in vitest.config.ts
  - verified SUBMIT_REVIEW confirm, override, no-op guards, RESET_CASE,
    and UI selection actions
- Decisions:
  - tests use explicit expected assertions provided as oracle
  - tests do not use snapshots
  - tests avoid exact event id assertions
  - tests use fake timers for deterministic submittedAt and event
    timestamps
  - tests verify audit event type order and causationEventId
    relationships
  - tests verify no-op guards using reference equality
  - tests verify RESET_CASE clone independence
  - tests validate selectedAuditEventId resets to the first audit event
    id per Phase 7a decision
  - no production reducer behavior was changed during Phase 7b
- Commands run:
  - npm run typecheck
  - npm run validate:mock
  - npm run test
  - npm run build
- Results:
  - 9/9 reducer tests passed
  - no reducer bugs were exposed
  - Vitest initially failed due to @ alias resolution; resolved by
    adding resolve.alias to vitest.config.ts
- Stuck points:
  - Vitest did not automatically resolve tsconfig @/* aliases; fixed
    with explicit alias config
- What I'd do differently:
  - configure test runner path aliases before adding tests that import
    application modules

## Phase 8 — Replay & Evaluation
- Status: completed
- Started: 2026-05-12
- Completed: 2026-05-12
- Scope:
  - added static replay run data in data/replayRuns.ts
  - implemented /replay page
  - added replay components for version notes, summary cards, comparison
    table, and diff panel
  - added minimal replay validation to scripts/validate-mock-data.ts
- Decisions:
  - replay is static frontend mock data, not a replay execution engine
  - replay does not mutate production case state
  - replay does not call caseReducer or append audit events
  - ReplayOutput.reasonCodes and riskFlags remain string[] code lists
  - every comparison diff is tied to a specific PROJECT_SPEC
    version-change note
  - Case B remains human_review_required because the mock data lacks an
    explicit recoverability signal
  - Case C demonstrates the canonical replay regression risk:
    human_review_required → needs_more_evidence due to stale eligibility
    evidence
  - request_more_info remains excluded from runtime and replay data
- Validation:
  - validator now checks replay reasonCodes/riskFlags are string arrays
  - validator checks requiresHumanReview consistency with routingDecision
  - validator checks replay data does not contain request_more_info
- Commands run:
  - npm run typecheck
  - npm run validate:mock
  - npm run test
  - npm run build
- Results:
  - validate:mock passed for 3 cases and 1 replay run
  - 9/9 reducer tests still passed
  - /replay builds as a static page
- Stuck points:
  - PROJECT_SPEC section numbering differed from the Phase 8 instruction;
    actual version notes were in §5.8, while §4.3 authorized
    needs_more_evidence in replay candidates
- What I'd do differently:
  - keep replay diffs explicitly tied to version-change notes to avoid
    invented policy/prompt improvements

## Phase 9 — Case Study Landing Page
- Status: completed
- Started: 2026-05-12
- Completed: 2026-05-12
- Scope:
  - replaced homepage placeholder with a case study landing page
  - added case-study sections for hero, problem, system approach, design
    principles, and demo walkthrough
  - added direct links to /demo, /replay, and individual case workflows
  - added a visible mock-demo boundary disclaimer
- Decisions:
  - kept homepage server-rendered with no "use client"
  - did not modify workflow behavior, reducer, mock data, replay data,
    validator, or tests
  - positioned the project as a frontend-only engineering case study
  - explicitly stated mock-data, no-PHI, no-real-LLM,
    no-production-system, and no-real-business-decision boundaries
  - described LLM output as advisory only, never as the final
    decision-maker
  - avoided production/autonomous AI claims
- Commands run:
  - npm run typecheck
  - npm run validate:mock
  - npm run test
  - npm run build
- Results:
  - homepage builds as a static prerendered page
  - reducer tests still pass
  - mock/replay validator still passes
- Stuck points:
  - none
- What I'd do differently:
  - keep landing page copy precise and bounded so the demo is credible
    rather than overclaimed

## Phase 10 — Polish / README / Deploy
- Status: not started
