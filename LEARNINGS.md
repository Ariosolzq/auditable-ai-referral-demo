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
- Status: not started

## Phase 2 — Mock cases + validator
- Status: not started

## Phase 3 — Case Selector
- Status: not started

## Phase 4 — Case Detail static UI
- Status: not started

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
