# Project: Auditable AI Referral Review Demo

This is a frontend-only Next.js portfolio demo. The full spec is at 
`.claude/PROJECT_SPEC.md` — read it before any code generation.

## Hard constraints
- Frontend-only. No backend, no database, no real LLM API, no auth.
- Mock data must follow `.claude/PROJECT_SPEC.md` §14 safety rules — 
  no names, DOB, addresses, phone, email, SSN, MRN, NPI, real facility 
  or payer names. Use only the whitelisted identifier formats.
- Type system in `types/referral.ts` and `types/replay.ts` is authoritative.
  Do not weaken types (no `any`, no string-where-object) without explicit approval.
- `request_more_info` is explicitly NOT in MVP. Do not implement it.
- `npm run validate:mock` and `npm run test` must pass before any phase is 
  declared complete.

## When in doubt
- Prefer to ask before improvising on data shape, event ordering, or workflow semantics.
- The spec's "Rule Decision ≠ Routing Decision ≠ Final Decision" boundary 
  is the most common place AI assistants get this wrong. Re-read §3.2 if 
  touching these fields.

## Phase progress
See `LEARNINGS.md` for what's done and what's next.