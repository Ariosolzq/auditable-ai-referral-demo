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
- Status: completed
- Started: 2026-05-12
- Completed: 2026-05-12
- Scope:
  - replaced README.md stub with full project documentation
  - documented demo boundaries, routes, architecture, implemented
    interactions, mock data safety, replay evaluation, local development,
    validation commands, Vercel Hobby deployment, and interview framing
  - kept homepage polish out of scope for this phase
- Decisions:
  - kept Phase 10 as documentation and deployment readiness only
  - did not modify app behavior, reducer, mock data, replay data,
    validator, tests, or config
  - kept no-PHI / no-real-LLM / frontend-only / no-production-system
    boundaries explicit
  - used Pre-deploy Checklist rather than permanent all-checked claims
  - avoided production/autonomous AI claims, HIPAA compliance claims,
    and real healthcare integration claims
  - did not add screenshots, license section, GitHub URL placeholder,
    vercel.json, CI workflow, or Claude Code attribution
- Commands run:
  - npm run typecheck
  - npm run validate:mock
  - npm run test
  - npm run build
- Results:
  - typecheck passed
  - validate:mock passed for 3 cases and 1 replay run
  - reducer tests passed 9/9
  - build passed with case routes SSG and other routes static
- Stuck points:
  - none
- What I'd do differently:
  - keep README documentation bounded and engineering-focused so the
    demo is understandable without overstating production readiness

## Post-Phase 10 — Visual polish pass
- Status: completed
- Scope:
  - performed visual polish after Phase 10
  - reduced homepage text density
  - made mock-demo boundaries more compact while preserving all five
    boundary statements
  - converted System Approach into compact step cards
  - tightened demo walkthrough copy while preserving case semantics
  - improved replay presentation by defaulting to Case C, emphasizing
    potential regression, and moving interpretation before raw JSON
- Decisions:
  - treated this as visual polish only, not a new functional phase
  - did not modify data, reducer, validator, tests, README, or workflow
    behavior
  - kept no-PHI / no-real-LLM / no-production-system boundary text intact
  - kept Replay data semantics unchanged
- Commands run:
  - npm run typecheck
  - npm run validate:mock
  - npm run test
  - npm run build
- Results:
  - typecheck passed
  - validate:mock passed for 3 cases and 1 replay run
  - reducer tests passed 9/9
  - build passed
- Stuck points:
  - none
- What I'd do differently:
  - separate functional completion from visual polish so UI refinement
    does not risk changing validated workflow behavior

## Round A — Landing redesigned as workflow-first demo
- Status: completed
- Scope:
  - rebuilt the landing page so the main visual object is a workflow
    swimlane diagram, not a README-style explanation
  - replaced four old explanatory sections (old SystemApproachSection,
    DesignPrinciplesSection, DemoWalkthroughSection, and the inline
    "What This Demo Shows" block) with a workflow-first composition
- What changed:
  - app/page.tsx now renders Hero → Problem → BoundaryStrip →
    WorkflowSwimlane → CaseRail
  - components/case-study/HeroSection.tsx — recruiter-focused hero with
    Case C as the primary CTA
  - components/case-study/ProblemSection.tsx — single-line sky-toned
    callout, no card chrome
  - components/case-study/BoundaryStrip.tsx (new) — compact mock-demo
    boundary chips: frontend-only / no real PHI / no real LLM API /
    no production systems / no real business decisions
  - components/case-study/WorkflowSwimlane.tsx (new) — System / LLM /
    Human lanes across 8 steps with explicit rule decision and
    governance boundaries; desktop swimlane and mobile vertical stack
  - components/case-study/CaseRail.tsx (new) — Case C featured as the
    recommended walkthrough; Cases A and B kept visible; compact
    Rule / LLM / Final decision triples per case
- Key design decisions:
  - the swimlane is the dominant visual; the landing should not read
    like a README
  - System / LLM / Human lanes communicate the rule-first /
    LLM-advisory / human-governed boundary visually
  - rule decision and governance boundaries are explicit dashed
    overlays around the relevant steps
  - LLM stays described as advisory only; final decision is recorded
    after human review
  - audit and replay are framed as engineering reliability mechanisms
  - Case C is positioned as the recommended walkthrough across hero
    CTA, walkthrough rail, and decision triples
  - Case C decision-triple wording avoids asserting that a final
    decision has been recorded before user action: "pending →
    override ACCEPT"
- Swimlane bug and root cause:
  - the first Round A swimlane mixed CSS Grid auto-placement for
    header cells, lane labels, and node cells with explicit
    gridColumn/gridRow on the rule and governance overlay items
  - because the overlay items claimed explicit grid areas, the auto-
    placement cursor skipped over those cells when placing the
    subsequent header cells and lane cells, which shifted every step
    after step 2 one column right and visually misaligned the nodes
- Corrected approach:
  - made every major grid item explicit: header cells, lane labels,
    lane bands, workflow nodes, and the two boundary overlays each
    declare their own gridColumn and gridRow
  - lane bands paint behind nodes; nodes paint above the band; boundary
    overlays paint above nodes with transparent centers and dashed
    borders
  - mobile retains a simple vertical stack with inline boundary
    markers, sidestepping the grid issue entirely
- Deliberately not changed:
  - data/cases.ts, data/replayRuns.ts
  - types/, lib/, scripts/, tests/
  - components/workflow/, components/replay/, components/demo/
  - app/cases/[caseId], app/demo, app/replay
  - package.json, vitest.config.ts, tsconfig.json, other config
  - README.md, .claude/PROJECT_SPEC.md, CLAUDE.md
  - no new dependencies, no route changes, no reducer or replay
    semantics changes
- Validation passed:
  - npm run typecheck
  - npm run validate:mock
  - npm run test (9/9 reducer tests still green)
  - npm run build (all routes still SSG/static)
  - browser QA confirmed the corrected swimlane no longer misaligns
    and step nodes sit in the intended lanes
- Process note:
  - Claude Design was more effective for visual information architecture,
    while Claude Code was kept responsible for file merging, type/build
    validation, and scope control.
- Follow-up:
  - next design target is the Case Detail visual prototype: the
    workflow workspace at /cases/[caseId] should receive the same
    workflow-first redesign treatment, with the swimlane vocabulary
    extended into the live workspace rather than the current dense
    three-column grid

## Round 2e — Case Detail card density compression
- Status: completed
- Scope:
  - compressed the internal layout of RuleEvaluationCard and
    LLMAdvisoryCard after browser QA on the earlier Case Detail
    redesign rounds passed
  - changed files: components/workflow/RuleEvaluationCard.tsx and
    components/workflow/LLMAdvisoryCard.tsx
- What changed:
  - RuleEvaluationCard:
    - compressed the local Rule / Routing summary into one compact
      inline row inside the card
    - compressed reason codes, missing fields, conflict flags, and
      routing reason codes into denser item rows with a single dense
      header line (severity badge + code + label flowing horizontally)
      and a second-line description
    - preserved severity, code/field, label, description, and
      supportingEvidenceIds on every item
    - preserved the evidence-bound cue and click-to-highlight behavior
    - compressed footer metadata into a chip row: rule set version,
      policy bundle version, input hash, output hash
    - preserved full hash values via break-all rendering and title
      attribute on the visible code element
  - LLMAdvisoryCard:
    - kept the "Advisory only — this output does not change the final
      decision." banner prominent and visually separate from the
      Status row
    - compressed prompt / model / policy / requires-human-review
      metadata into a chip row inside the generated branch
    - compressed evidence summary, missing-field analysis, and risk
      flag rows using the same dense header + secondary line pattern
    - preserved reviewer notes as a readable paragraph
    - preserved unsupported claims with the "None" placeholder when
      empty
    - preserved skipped / generated / failed branch semantics
    - preserved evidence-bound cues and click-to-highlight behavior
- Key design decision: compress layout without deleting information
  - every existing field, severity, code, label, description, summary,
    evidence id, hash, version, and branch-specific field is still
    rendered after the compression
  - density was reduced by flattening multi-line headers into single
    flex-wrap rows and by converting stacked metadata into chip rows,
    not by removing data
- Why Rule / Routing summary was kept inside RuleEvaluationCard:
  - the page-header decision triple from Round 2a already surfaces
    Rule / Routing / Final at the top of the workspace, but the Rule
    card must still make local sense when viewed independently
  - keeping Rule and Routing inline inside the card preserves the
    rule-first reading order and lets the card stand alone as the
    deterministic decision artifact
  - Final decision is deliberately not duplicated inside
    RuleEvaluationCard, because Final is governed by human review and
    belongs to the page-level decision triple, not to the rule card
- Why the LLM advisory-only banner and Status row stayed separate:
  - the advisory-only banner is a governance boundary statement: the
    LLM never makes or records the final decision
  - the Status row is execution state: skipped / generated / failed
  - merging them would conflate a governance invariant with a runtime
    state value and weaken the visual boundary that makes the demo
    credible
- Deliberately not changed:
  - data/cases.ts, data/replayRuns.ts
  - types/referral.ts, types/replay.ts
  - lib/caseReducer.ts, lib/eventFactory.ts, lib/statusMapping.ts
  - scripts/validate-mock-data.ts
  - tests/caseReducer.test.ts
  - event semantics, submit/reset behavior
  - selectedEvidenceIds behavior, selectedAuditEventId behavior
  - prop signatures on either card
  - no request_more_info, no pending audit ghost rows
  - no new dependencies
  - README.md, .claude/PROJECT_SPEC.md, CLAUDE.md
- Validation passed:
  - npm run typecheck
  - npm run validate:mock (3 cases, 1 replay run)
  - npm run test (9/9 reducer tests still green)
  - npm run build (all routes still SSG/static)
  - browser QA passed for /cases/case-c
  - quick branch checks passed for /cases/case-a and /cases/case-b
- Follow-up:
  - pause major Case Detail redesign work and run a full QA pass over
    the workspace before any further visual polish, so cumulative
    Round 2a–2e changes can be reviewed together against the spec
    before introducing more changes

## Round 3 — Replay page redesign
- Status: completed across three sub-rounds (R3-1, R3-2, R3-3)
- Scope:
  - rebuilt /replay so the page reads as a promotion-gate evaluation
    surface, not a metrics dashboard
  - kept ReplaySummaryCards, ReplayComparisonTable, ReplayDiffPanel,
    VersionChangeNotes, ReplayClient as the structural baseline and
    refined them in place, plus added two new presentational components
- What changed:
  - R3-1: page framing + ReplayDeltaHero + ReplayPromotionGate
    - rewrote the /replay header as a compact promotion-gate framing:
      title + one-line description + run/baseline/candidate metadata
      + a 5-chip boundary row (`mock replay`,
      `no production status update`, `no final-decision update`,
      `no review queue update`, `pre-authored mock outputs`)
    - added components/replay/ReplayDeltaHero.tsx — pure presentational,
      receives one ReplayCaseComparison, renders baseline vs candidate
      for ruleDecision / routingDecision / requiresHumanReview /
      riskFlags, highlights changed fields via existing diff flags,
      renders a "Potential regression" or "No regression" pill, and
      shows comparison.diff.summary verbatim in the footer
    - added components/replay/ReplayPromotionGate.tsx — pure
      presentational, read-only, zero buttons, zero inputs, renders
      four compact questions (What changed? / Why? / Potential
      regression? / Promotion check) derived from existing comparisons
      and diff flags; uses safe wording only (`Requires human review
      before promotion`, `Replay does not auto-promote.`, `Potential
      regression`)
    - moved VersionChangeNotes to the bottom of the page so it reads
      as reference material rather than required pre-reading
    - R3-1 follow-up cleanup: renamed the fourth gate question from
      `Promote?` to `Promotion check`; removed `auto_reject` from the
      ReplayDeltaHero decisionTone helper (the type union, validator,
      and other defensive helpers still reference it — see follow-up)
  - R3-2: scoreboard compression + comparison table refinement +
    structured field-deltas + JSON demotion
    - ReplaySummaryCards: replaced the 5-card grid with a single
      horizontal scoreboard strip; same five metrics, identical
      derivation logic, unchanged prop signature; tones — Total cases
      neutral, Rule/Routing/Review amber when > 0, Potential
      regressions rose when > 0; wraps safely on small screens
    - ReplayComparisonTable: kept all columns and prop signature
      (`comparisons`, `selectedIdx`, `onSelectRow`); kept aria-pressed;
      reframed as reference table with smaller kerned header and a
      `reference · click a row to inspect` subtitle; kept regression
      rows visually prominent (rose row tint + rose left-edge accent);
      quieted non-regression case-title text from slate-900 to
      slate-700; replaced the heavy slate "No regression" badge with
      a muted em-dash plus aria-label="No regression"
    - ReplayDiffPanel: kept interpretation block first with
      comparison.diff.summary verbatim; added a structured
      "Changed fields" block between interpretation and JSON, derived
      only from existing diff flags and baseline/candidate values; each
      delta renders field code + label + short meaning + before → after
      badges; for Case C the routingDecision row shows
      `human_review_required → needs_more_evidence` and the
      requiresHumanReview row shows `true → false` plus a rose
      `review gate changed` pill (only when true → false)
    - JSON demotion: kept both
      `JSON.stringify(comparison.baseline, null, 2)` and
      `JSON.stringify(comparison.candidate, null, 2)` rendered inline
      and never hidden behind an accordion; visually demoted inside a
      slate-tinted container with a `Supporting detail · raw replay
      output` kicker and a `read after the changed-fields summary
      above` italic hint
  - R3-3: hero/table/diff selection sync + VersionChangeNotes reskin
    - moved ReplayDeltaHero rendering from app/replay/page.tsx into
      ReplayClient so hero, table, and diff panel share the same
      `selectedIdx`
    - default selectedIdx kept at `Math.max(0, Math.min(2,
      comparisons.length - 1))`; with the three mock cases Case C
      remains the default selection
    - hero label is `Primary narrative · Case C` only when the
      selected row is the default index and the selected comparison is
      actually case-c; otherwise `Selected comparison` — this prevents
      misleading labels if comparison ordering ever changes
    - clicking Case A / Case B / Case C in the comparison table now
      updates hero, selected row tint, and diff panel together
    - app/replay/page.tsx no longer computes heroComparison; the page
      passes a static `primaryCaseId="case-c"` to ReplayPromotionGate
      so the gate's "Why?" answer still highlights the Case C narrative
      independently of the user's current table selection
    - VersionChangeNotes reskinned as bottom reference appendix:
      paper-tinted slate background (bg-slate-50/60), no shadow,
      kerned slate-500 `Reference · version change notes` heading
      plus an italic `Read after the behavioral delta` caption;
      added an inline `policy_v1 → policy_v2` / `prompt_v1 → prompt_v2`
      mono-coded pair on each group; smaller bullet text; **all bullet
      copy still rendered verbatim from props** — the component
      contributes only structural copy, no paraphrasing
- Key design decision: replay should read as a promotion-gate
  evaluation page, not a dashboard
  - the page now opens with a boundary chip row, then a single
    primary narrative (ReplayDeltaHero) showing baseline vs candidate
    for the featured case, then four read-only governance questions
    (ReplayPromotionGate), then the scoreboard and reference table
  - VersionChangeNotes moved to the bottom because the policy/prompt
    bullet lists are reference material — the user should read the
    behavioral delta first and consult the notes second
  - language is consistently "potential regression" and "requires
    human review before promotion", never "confirmed failure" or
    "policy_v2 is wrong" or "auto_reject" in user-facing copy; the
    page never offers a Promote action because replay does not
    promote anything
- Key implementation decision: move ReplayDeltaHero into ReplayClient
  so hero/table/diff share `selectedIdx`
  - in R3-1 the hero was rendered statically from app/replay/page.tsx
    with a server-derived Case C comparison; this kept ReplayClient
    untouched but meant the hero and table could drift out of sync
  - in R3-3 the hero moved into ReplayClient and reads
    `comparisons[selectedIdx]` from the same useState that drives the
    table and diff panel; no new state was introduced, no prop
    signatures on ReplayComparisonTable or ReplayDiffPanel changed,
    and the default-index logic stayed at
    `Math.max(0, Math.min(2, comparisons.length - 1))`
  - the label gate (`isDefaultSelection && isCaseC`) is defensive: it
    only claims "Primary narrative · Case C" when both the default
    index points at case-c and the selected comparison's caseId is
    `case-c`, so future data reordering cannot produce a misleading
    label
- Deliberately not changed:
  - data/cases.ts, data/replayRuns.ts — no data edits, no new fields,
    no reordering
  - types/referral.ts, types/replay.ts — no schema or union changes
  - lib/caseReducer.ts, lib/eventFactory.ts, lib/statusMapping.ts
  - scripts/validate-mock-data.ts
  - tests/caseReducer.test.ts
  - JSON output: every JSON.stringify call on baseline/candidate
    payloads is unchanged
  - no real LLM calls introduced; replay outputs remain pre-authored
    mock fixtures
  - no promotion action of any kind; the page renders zero buttons or
    inputs that could be mistaken for promotion controls
  - no production state writes, no final-decision updates from replay,
    no review-queue updates from replay
  - components/workflow/, components/case-study/, components/demo/
    not modified during Round 3
  - request_more_info still excluded from runtime; the only
    appearances are inside the validator's R3 check that asserts its
    absence from replay data
- Validation passed:
  - npm run typecheck (R3-1, R3-2, R3-3 — all green)
  - npm run validate:mock (3 cases, 1 replay run — all green)
  - npm run test (9/9 reducer tests still green)
  - npm run build (all routes still SSG/static; /replay finished at
    3.17 kB after R3-3)
  - browser QA passed end-to-end across /, /demo, /cases/case-a,
    /cases/case-b, /cases/case-c, /replay
  - final QA grep on app/ and components/ found no instances of
    `confirmed failure`, `policy_v2 is wrong`, `reject candidate`,
    `approved by LLM`, `LLM decided`, `autonomous decision`,
    `production EHR`, or `production payer`
  - "real PHI" matches were all the explicit negation "no real PHI"
    in BoundaryStrip and the /demo header; acceptable
- Follow-up:
  - optional small cleanup: normalize the remaining `auto_reject`
    references in the defensive decisionTone / statusTone helpers
    (RuleEvaluationCard, CaseWorkspaceClient, CaseCard). The token
    still exists in types/referral.ts per PROJECT_SPEC §6.2 and in
    scripts/validate-mock-data.ts as a guardrail, so the helpers are
    defensible; QA classified the inconsistency as non-blocking
  - final pre-deploy review of README.md to ensure the routes,
    interactions, and boundary language match the redesigned pages
  - confirm Vercel Hobby deploy still builds and renders the new
    /replay layout before announcing the demo
