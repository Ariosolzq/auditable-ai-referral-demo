# PROJECT_SPEC.md

# Auditable AI Referral Review Demo

## 0. Purpose of This Specification

This file is the implementation specification for Claude Code.

Build a **frontend-only interactive system-design demo** that simulates an auditable AI-assisted referral review workflow. The project is meant for portfolio and interview demonstration. It must be deployable on Vercel and understandable to a technical interviewer without any backend, real database, real LLM API, authentication, or production healthcare data.

The demo must show that a governed AI workflow is not just “call an LLM and accept the answer.” It must demonstrate a controlled workflow where deterministic rules, workflow routing, evidence-bound LLM advisory output, human review, audit events, and replay comparison work together.

Core system message:

```text
Rule-first + LLM-advisory + Human-governed + Auditable + Replayable workflow.
```

Primary workflow narrative:

```text
Referral enters workflow
→ Evidence package is constructed
→ Deterministic rules generate preliminary decision
→ Workflow policy determines routing
→ LLM provides evidence-bound advisory output when required
→ Human reviewer confirms or overrides when required
→ Audit trail records every important event
→ Replay comparison shows policy / prompt version impact
```

## 1. Hard Boundaries

This is a frontend mock demo only.

The implementation MUST NOT:

```text
- connect to a real backend
- connect to a real database
- call a real LLM API
- process real PHI / PII
- include real patient names, DOB, phone, email, addresses, SSN, MRN, NPI, real facility names, real payer IDs, or real screenshots
- imply that an LLM makes final referral decisions
- imply that replay updates production state
- implement authentication, RBAC, real uploads, or real audit storage
```

The README and landing page MUST clearly state:

```text
This is a frontend-only mock demo.
It does not process real PHI.
It does not call real LLM APIs.
It does not connect to production systems.
It does not make real business decisions.
```

## 2. Tech Stack

Use the following stack:

```text
Framework: Next.js App Router
Language: TypeScript
Styling: Tailwind CSS
Deployment target: Vercel Hobby
Data source: local TypeScript mock data
State: React useReducer / useState
Tests: Vitest for reducer tests
Mock validation: tsx script
Backend: none
Database: none
LLM API: none
Auth: none
```

Do not introduce a backend service, Prisma, database, authentication library, server actions, or external API integration. Static local TypeScript data is sufficient.

## 3. Required Routes

Implement exactly these primary routes:

```text
/
  Case Study Landing Page

/demo
  Case Selector

/cases/[caseId]
  Case Detail / Workflow Workspace

/replay
  Replay & Evaluation Comparison
```

Unknown case IDs should show a simple not-found state or redirect to `/demo`.

## 4. Core Design Principles to Enforce Everywhere

### 4.1 Rule-first, LLM-advisory

The main path is:

```text
Evidence Package
→ Deterministic Rule Evaluation
→ Workflow Routing
→ Optional LLM Advisory
→ Human Review / Finalization
```

It is NOT:

```text
Raw Referral → LLM → Final Decision
```

The LLM must never directly:

```text
- accept a referral
- reject a referral
- modify currentStatus
- create finalDecision
- trigger downstream action
```

The LLM only provides advisory material such as evidence summaries, missing field analysis, risk flags, reviewer notes, and unsupported claim detection.

### 4.2 Rule Decision, Routing Decision, and Final Decision are different

These concepts must be separately represented in the type system, UI, mock data, and replay comparison.

```text
Rule Decision:
  The deterministic rule engine's preliminary decision.
  Allowed values: ACCEPT, REJECT, UNCERTAIN, NEEDS_REVIEW.

Routing Decision:
  The workflow policy's next-step decision based on rule result, risk level, missing fields, conflict flags, and policy.
  Allowed values: auto_accept, auto_reject, human_review_required, needs_more_evidence, failed.

Final Decision:
  The final business outcome recorded by system auto-finalization or human reviewer submission.
  Allowed values in MVP: ACCEPT, REJECT.
```

Example to preserve:

```text
Case C:
  rule decision = REJECT
  routing decision = human_review_required
  final decision = ACCEPT after human override
```

This is not contradictory. It demonstrates that policy can require human confirmation before finalizing a reject decision.

### 4.3 Do not implement request_more_info in MVP

MVP supports only:

```text
- Confirm Rule Decision
- Override Decision
```

Do not implement:

```text
- request_more_info workflow
- request_more_info submit action
- EvidenceRequested event
- EvidenceReceived event
- document re-fetch task
- waiting_for_more_evidence state transition in the interactive human review submit flow
```

`needs_more_evidence` may appear in replay comparison as a candidate routing result under `policy_v2`, but the live case review form must not support request_more_info.

### 4.4 Evidence-bound LLM output

LLM advisory output must be bound to evidence IDs. Do not use free-form summaries with no evidence references.

Wrong:

```json
{
  "evidenceSummary": "Eligibility appears active, but physician order is missing."
}
```

Correct:

```json
{
  "evidenceSummary": [
    {
      "id": "sum_001",
      "summary": "Eligibility appears active based on the eligibility portal record.",
      "supportingEvidenceIds": ["ev_eligibility_active"],
      "confidence": "high"
    },
    {
      "id": "sum_002",
      "summary": "The physician order is missing from extracted document evidence.",
      "supportingEvidenceIds": ["ev_physician_order_missing"],
      "confidence": "high"
    }
  ]
}
```

All LLM evidence summaries, missing field analyses, and risk flags must include `supportingEvidenceIds`.

### 4.5 Event is historical fact; status is current state

Audit events represent historical facts and must not be mutated.

Current status and current stage represent the current displayed state and may change after user interaction.

Invalid state:

```text
currentStatus = needs_review
but auditEvents already contains FinalDecisionRecorded
```

### 4.6 currentStage is not the whole timeline

`currentStage` represents the current displayed stage, not every step the case has passed through.

Transient stages such as `llm_review_skipped` and `final_decision_recorded` may appear in event history but completed cases should display:

```text
currentStage = completed
```

After review submission, the UI should directly display:

```text
currentStage = completed
```

The `FinalDecisionRecorded` audit event represents the intermediate historical fact.

## 5. Required Pages

## 5.1 Page 1: Case Study Landing Page

Route:

```text
/
```

Purpose: allow a recruiter, hiring manager, or interviewer to understand the demo within 30–60 seconds.

Required sections:

### Hero

Title:

```text
Auditable AI-Assisted Referral Review Workflow
```

Subtitle:

```text
An interactive demo showing how deterministic rules, evidence-bound LLM advisory outputs, human review, audit trails, and replay comparison can work together in a governed intake workflow.
```

Buttons:

```text
View Demo → /demo
View Replay Comparison → /replay
```

### Problem

Explain:

```text
Referral intake often requires reviewing scattered evidence across documents, eligibility records, payer fields, and external sources. Manual review can be slow, inconsistent, and difficult to audit.
```

Also state:

```text
The problem is not simply lack of AI. The real problem is scattered evidence, inconsistent judgment, weak traceability, and limited replay capability.
```

### System Approach

Show this flow:

```text
Referral Metadata
→ Evidence Package
→ Deterministic Rule Evaluation
→ Workflow Routing
→ Conditional LLM Advisory
→ Human Review
→ Final Decision
→ Audit Trail + Replay Comparison
```

### Design Principles

Show these principles:

```text
1. Rule-first, LLM-advisory
2. Evidence-bound AI outputs
3. Human review as governance boundary
4. Replay before policy/prompt promotion
```

### What This Demo Shows

List:

```text
- Select mock referral cases
- Inspect normalized fields and evidence records
- Click rule reason codes to highlight supporting evidence
- Click LLM summaries and risk flags to inspect evidence references
- Expand audit events and event payloads
- Submit mock human review decisions
- Compare policy/prompt replay outputs
```

## 5.2 Page 2: Case Selector

Route:

```text
/demo
```

Purpose: show three mock cases and let user open a case detail page.

Required case cards:

### Case A: Low-risk Accept

Initial data:

```text
currentStatus = accepted
currentStage = completed
riskLevel = low
rule decision = ACCEPT
routing decision = auto_accept
LLM advisory = skipped
human review = not_required
final decision = ACCEPT by system
```

Demonstrates:

```text
- low-risk case can be auto-finalized by deterministic rule + policy
- LLM is skipped by policy
- LLMReviewSkipped still appears in audit trail
```

### Case B: Missing Evidence → Needs Review

Initial data:

```text
currentStatus = needs_review
currentStage = waiting_for_human_review
riskLevel = high
rule decision = NEEDS_REVIEW
routing decision = human_review_required
reason code = MISSING_PHYSICIAN_ORDER
missing field = physician_order with blocking severity
LLM advisory = generated
human review = in_progress
finalDecision = undefined
```

Demonstrates:

```text
- blocking missing evidence triggers human review
- LLM provides evidence-bound advisory output
- user can submit review and generate final decision
```

### Case C: Rule Reject → Human Override

Initial data:

```text
currentStatus = needs_review
currentStage = waiting_for_human_review
riskLevel = high
rule decision = REJECT
routing decision = human_review_required
routing reason = POLICY_REQUIRES_HUMAN_CONFIRMATION_ON_REJECT
LLM advisory = generated
human review = in_progress
finalDecision = undefined initially
```

After override submission:

```text
reviewerAction = override
final decision = ACCEPT
override reason required
audit trail appends HumanReviewSubmitted, HumanOverrideSubmitted, FinalDecisionRecorded
```

Demonstrates:

```text
- rule decision is not final decision
- policy can require human confirmation on reject cases
- human override must be recorded with reason and audit trail
```

Each case card must display:

```text
- case title
- short description
- current status
- current stage
- risk level
- rule decision
- routing decision
- LLM status
- human review status
- final decision if present
- key reason codes
```

Clicking a card routes to:

```text
/cases/[caseId]
```

## 5.3 Page 3: Case Detail / Workflow Workspace

Route:

```text
/cases/[caseId]
```

Purpose: show one referral case’s full system state.

Required layout on desktop:

```text
Top Header:
  Case title, currentStatus, currentStage, riskLevel, policyVersion, promptVersion, Reset Case button

Left Column:
  Referral Summary
  Normalized Fields
  Evidence Package

Center Column:
  Deterministic Rule Evaluation
  Mock LLM Advisory
  Human Review Panel

Right Column:
  Audit Timeline
  Expanded Event Payload
```

Use a responsive layout similar to:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_0.9fr] gap-4">
```

On mobile, stack vertically:

```text
1. Referral / Evidence
2. Rule / LLM / Review
3. Audit
```

### Top Header

Show:

```text
- case title
- current status
- current workflow stage
- risk level
- policy bundle version
- prompt version / LLM status
- Reset Case button
```

Case B initial display:

```text
Status: Needs Review
Stage: Waiting for Human Review
```

After submit:

```text
Status: Accepted or Rejected
Stage: Completed
```

### Reset Case Button

Must appear on the case detail page.

Behavior:

```text
- restore current case to initial mock data
- clear selectedEvidenceIds
- clear selectedAuditEventId
- allow user to submit again after reset
```

Reducer action:

```ts
{ type: "RESET_CASE"; initialCase: ReferralCase }
```

Must deep clone initial case to avoid mutating mock data.

### Referral Summary Card

Show:

```text
referralId
patientReferenceId
sourceSystem
receivedAt
serviceType
state
payerType
```

No real PHI / PII.

### Normalized Fields Card

Show normalized fields such as:

```text
payer_type
eligibility_status
authorization_required
physician_order_present
patient_identity_match_status
service_type
state
```

### Evidence Package Panel

Each evidence record must show:

```text
evidence id
field
label
value
source type
source name
confidence
used by rule / LLM
```

Highlighted records must be visually distinct when selected.

Required evidence interactions:

```text
1. Click rule reason code → highlight supporting evidence
2. Click rule missing field → highlight supporting evidence
3. Click conflict flag → highlight supporting evidence
4. Click LLM evidence summary item → highlight supporting evidence
5. Click LLM risk flag → highlight supporting evidence
6. Click Clear Selection → clear highlighted evidence
```

Use reducer state:

```ts
selectedEvidenceIds: string[]
```

Do not mutate case data for selection state.

## 5.4 Deterministic Rule Evaluation Card

Show structured rule output:

```text
Rule Decision
Routing Decision
Reason Codes
Missing Fields
Conflict Flags
Routing Reason Codes
Rule Set Version
Policy Bundle Version
Input Hash
Output Hash
```

Reason codes, missing fields, conflict flags, and routing reason codes with supporting evidence must be clickable.

Case C must show:

```text
Rule Decision: REJECT
Routing Decision: Human Review Required
Routing Reason: POLICY_REQUIRES_HUMAN_CONFIRMATION_ON_REJECT
```

Add explanation:

```text
Policy requires human confirmation before finalizing reject decisions for this case category.
```

## 5.5 Mock LLM Advisory Card

Purpose: show LLM as advisory layer only.

Top banner must say:

```text
Advisory only — this output does not change the final decision.
```

### Generated LLM status

Show:

```text
Prompt Version
Model Version
Policy Bundle Version
Evidence Summary
Missing Field Analysis
Risk Flags
Reviewer Notes
Requires Human Review
Unsupported Claims
```

`evidenceSummary` must be an array of `EvidenceBoundSummary`. Each summary item must be clickable and highlight its `supportingEvidenceIds`.

Risk flags must show:

```text
code
severity
explanation
supportingEvidenceIds
```

Clicking a risk flag highlights its evidence.

Unsupported claims must show either:

```text
Unsupported Claims: None
```

or actual unsupported claims with reason.

### Skipped LLM status

For Case A:

```text
status = skipped
reason = deterministic_rule_low_risk_accept
```

UI copy:

```text
LLM Review Skipped
Reason: Deterministic rule produced a low-risk accept and policy did not require advisory review.
```

Audit trail must include:

```text
LLMReviewSkipped
```

### Failed LLM status

Types should support failed LLM state, though no initial MVP case must use it.

Failed state should show:

```text
errorCode
errorMessage
nextAction
```

## 5.6 Human Review Panel

Purpose: show human governance boundary.

### If humanReview.status === "not_required"

Render a read-only banner:

```text
Human review not required for this case.
Reason: Low-risk rule accept was auto-finalized under policy_v1.
```

Do not render the review form.

Reducer `SUBMIT_REVIEW` must be a no-op for this state.

### Supported review operations

MVP supports:

```text
- Confirm Rule Decision
- Override Decision
- Add Reviewer Note
- Submit Review
```

MVP does not support:

```text
- Request More Info
- Request LLM Rerun
- reviewer assignment
- SLA
- permissions
- concurrent reviewer conflict handling
```

### Confirm flow

```text
reviewerAction = confirm
finalDecision = selected final decision
overrideFlag = false
reviewerNote optional
```

### Override flow

Required fields:

```text
new final decision
override reason
reviewer note optional
```

If override reason is empty, disable submit or show a validation error. The reducer should either return unchanged state or throw a validation error. Prefer returning unchanged state and handling validation in UI.

### Submit review must update all of these

```text
humanReview.status = submitted
humanReview.submittedAt
humanReview.reviewerAction
humanReview.finalDecision
humanReview.overrideFlag
humanReview.overrideReason
humanReview.reviewerNote
finalDecision object
currentStatus
currentStage
auditEvents
```

### Events appended after submit

Confirm appends:

```text
HumanReviewSubmitted
FinalDecisionRecorded
```

Override appends:

```text
HumanReviewSubmitted
HumanOverrideSubmitted
FinalDecisionRecorded
```

## 5.7 Audit Timeline and Event Payload Panel

Each event must include:

```text
id
schemaVersion
eventType
actor
timestamp
correlationId
workflowInstanceId
causationEventId
payload
```

Supported event types:

```text
ReferralCreated
WorkflowStarted
FieldsNormalized
EvidencePackageBuilt
RuleDecisionGenerated
LLMReviewRequested
LLMReviewCompleted
LLMReviewSkipped
LLMReviewFailed
HumanReviewRequested
HumanReviewSubmitted
HumanOverrideSubmitted
FinalDecisionRecorded
```

Clicking an event must:

```text
- set selectedAuditEventId
- show full event payload in AuditEventPayloadPanel
- display eventType, actor, timestamp, correlationId, workflowInstanceId, causationEventId, schemaVersion, and JSON payload
```

Payload is read-only.

### Required causation rules

```text
WorkflowStarted.causationEventId = ReferralCreated.id
FieldsNormalized.causationEventId = WorkflowStarted.id
EvidencePackageBuilt.causationEventId = FieldsNormalized.id
RuleDecisionGenerated.causationEventId = EvidencePackageBuilt.id

LLMReviewRequested.causationEventId = RuleDecisionGenerated.id
LLMReviewCompleted.causationEventId = LLMReviewRequested.id
LLMReviewSkipped.causationEventId = RuleDecisionGenerated.id

HumanReviewRequested.causationEventId =
  LLMReviewCompleted.id if LLM was generated
  RuleDecisionGenerated.id if LLM was skipped

HumanReviewSubmitted.causationEventId = HumanReviewRequested.id
HumanOverrideSubmitted.causationEventId = HumanReviewSubmitted.id

FinalDecisionRecorded.causationEventId =
  HumanOverrideSubmitted.id if override
  HumanReviewSubmitted.id if human review without override
  LLMReviewSkipped.id or RuleDecisionGenerated.id if auto-finalized
```

### Initial events by case

Case A initial events:

```text
ReferralCreated
WorkflowStarted
FieldsNormalized
EvidencePackageBuilt
RuleDecisionGenerated
LLMReviewSkipped
FinalDecisionRecorded
```

Case B initial events:

```text
ReferralCreated
WorkflowStarted
FieldsNormalized
EvidencePackageBuilt
RuleDecisionGenerated
LLMReviewRequested
LLMReviewCompleted
HumanReviewRequested
```

Case B must NOT initially include:

```text
HumanReviewSubmitted
FinalDecisionRecorded
```

Case C initial events:

```text
ReferralCreated
WorkflowStarted
FieldsNormalized
EvidencePackageBuilt
RuleDecisionGenerated
LLMReviewRequested
LLMReviewCompleted
HumanReviewRequested
```

Case C must include `LLMReviewRequested`.

## 5.8 Page 4: Replay & Evaluation

Route:

```text
/replay
```

Purpose: show how policy / prompt versions affect rule output, routing, LLM advisory output, and human review requirement.

The page must state:

```text
Replay does not update production status, final decisions, or real review queues.
```

Required sections:

```text
Header: Replay & Evaluation
Version Change Notes: policy_v1 vs policy_v2, prompt_v1 vs prompt_v2
Summary Cards: Total cases, Rule decision changes, Routing changes, Human review requirement changes, Potential regressions
Comparison Table: case-level comparison
Diff Panel: Baseline output vs Candidate output
```

### Required version change notes

policy_v1:

```text
- Low-risk accept cases can auto_accept when all required evidence is present.
- Missing physician order is blocking and routes directly to human_review_required.
- High-risk reject cases require human confirmation before finalization.
```

policy_v2:

```text
- Low-risk accept behavior remains unchanged.
- Missing physician order remains blocking, but policy introduces needs_more_evidence when the missing document may be recoverable through document re-fetch.
- Eligibility conflict or stale evidence cases route to needs_more_evidence before human review.
- High-risk reject cases still require human confirmation.
```

prompt_v1:

```text
- Produces general reviewer notes and high-level risk explanations.
- Evidence references may be present but are less granular.
```

prompt_v2:

```text
- Requires every advisory claim to cite supporting evidence IDs.
- Splits evidence summary, missing field analysis, risk flags, and unsupported claims.
- Produces shorter, more scannable reviewer-facing output.
```

### Replay table columns

Must separate these concepts:

```text
Case
Historical Final Outcome
Rule Decision: Baseline → Candidate
Routing Decision: Baseline → Candidate
Human Review Required: Baseline → Candidate
Risk Flags: Baseline → Candidate
Regression Risk
```

Do not merge rule decision with routing decision.

### Diff panel

Clicking a table row shows:

```text
Baseline Output JSON
Candidate Output JSON
Changed Fields
Interpretation
```

Example interpretation:

```text
Policy v2 changed routing from human_review_required to needs_more_evidence because this reject decision depends on potentially stale eligibility evidence.
```

## 6. TypeScript Types

Create:

```text
types/referral.ts
types/replay.ts
```

## 6.1 types/referral.ts

Use this type contract. You may add helper types, but do not weaken these semantics.

```ts
export type ReferralStatus =
  | "created"
  | "processing"
  | "needs_review"
  | "accepted"
  | "rejected"
  | "needs_more_information" // reserved for future extension; not used in MVP submit flow
  | "completed";

export type WorkflowStage =
  | "created"
  | "workflow_started"
  | "fields_normalized"
  | "evidence_package_built"
  | "rule_decision_generated"
  | "llm_review_requested"
  | "llm_review_completed"
  | "llm_review_skipped"      // transient; appears in timeline, not terminal display state
  | "waiting_for_human_review"
  | "final_decision_recorded" // transient; UI usually moves directly to completed
  | "completed";

export type RuleDecision =
  | "ACCEPT"
  | "REJECT"
  | "UNCERTAIN"
  | "NEEDS_REVIEW";

export type RoutingDecision =
  | "auto_accept"
  | "auto_reject"
  | "human_review_required"
  | "needs_more_evidence"
  | "failed";

export type ReasonCode = {
  code: string;
  label: string;
  description: string;
  severity: "low" | "medium" | "high" | "blocking";
  supportingEvidenceIds: string[];
};

export type EvidenceRecord = {
  id: string;
  field: string;
  label: string;
  value: string | boolean;
  sourceType: "portal" | "document" | "manual" | "system";
  sourceName: string;
  confidence: "low" | "medium" | "high";
  usedBy: Array<"rule" | "llm">;
};

export type MissingField = {
  field: string;
  label: string;
  severity: "low" | "medium" | "high" | "blocking";
  reasonCode?: string;
  supportingEvidenceIds: string[];
};

export type ConflictFlag = {
  code: string;
  severity: "low" | "medium" | "high" | "blocking";
  description: string;
  supportingEvidenceIds: string[];
};

export type RuleEvaluation = {
  decision: RuleDecision;
  reasonCodes: ReasonCode[];
  missingFields: MissingField[];
  conflictFlags: ConflictFlag[];
  routingDecision: RoutingDecision;
  routingReasonCodes: ReasonCode[];
  ruleSetVersion: string;
  policyBundleVersion: string;
  inputHash: string;
  outputHash: string;
};

export type EvidenceBoundSummary = {
  id: string;
  summary: string;
  supportingEvidenceIds: string[];
  confidence: "low" | "medium" | "high";
};

export type LLMAdvisory =
  | {
      status: "skipped";
      reason: string;
      policyBundleVersion: string;
    }
  | {
      status: "generated";
      promptVersion: string;
      modelVersion: string;
      policyBundleVersion: string;
      evidenceSummary: EvidenceBoundSummary[];
      missingFieldAnalysis: Array<{
        field: string;
        severity: "low" | "medium" | "high" | "blocking";
        explanation: string;
        supportingEvidenceIds: string[];
      }>;
      riskFlags: Array<{
        code: string;
        severity: "low" | "medium" | "high";
        explanation: string;
        supportingEvidenceIds: string[];
      }>;
      reviewerNotes: string;
      requiresHumanReview: boolean;
      unsupportedClaims: Array<{
        claim: string;
        reason: string;
      }>;
    }
  | {
      status: "failed";
      promptVersion: string;
      modelVersion: string;
      policyBundleVersion: string;
      errorCode: string;
      errorMessage: string;
      nextAction: "retry_scheduled" | "human_review_without_advisory";
    };

export type ReviewType =
  | "rule_uncertain_review"
  | "policy_required_review"
  | "conflict_review"
  | "llm_risk_review";

export type ReviewerAction = "confirm" | "override";

export type FinalDecisionValue = "ACCEPT" | "REJECT";

export type HumanReview =
  | {
      status: "not_required";
      reason: string;
    }
  | {
      status: "pending" | "in_progress" | "submitted";
      reviewType: ReviewType;
      startedAt?: string;
      submittedAt?: string;
      reviewerAction?: ReviewerAction;
      finalDecision?: FinalDecisionValue;
      overrideFlag?: boolean;
      overrideReason?: string;
      reviewerNote?: string;
    };

export type AuditEvent = {
  id: string;
  schemaVersion: "1.0";
  eventType:
    | "ReferralCreated"
    | "WorkflowStarted"
    | "FieldsNormalized"
    | "EvidencePackageBuilt"
    | "RuleDecisionGenerated"
    | "LLMReviewRequested"
    | "LLMReviewCompleted"
    | "LLMReviewSkipped"
    | "LLMReviewFailed"
    | "HumanReviewRequested"
    | "HumanReviewSubmitted"
    | "HumanOverrideSubmitted"
    | "FinalDecisionRecorded";
  actor:
    | "system"
    | "workflow-engine"
    | "rule-worker"
    | "llm-worker"
    | "reviewer";
  timestamp: string;
  correlationId: string;
  workflowInstanceId: string;
  causationEventId?: string;
  payload: Record<string, unknown>;
};

export type FinalDecision = {
  decision: FinalDecisionValue;
  decidedBy: "system" | "reviewer";
  decidedAt: string;
  overrideFlag: boolean;
};

export type ReferralCase = {
  id: string;
  title: string;
  description: string;
  currentStatus: ReferralStatus;
  currentStage: WorkflowStage;
  riskLevel: "low" | "medium" | "high";

  referralSummary: {
    referralId: string;
    patientReferenceId: string;
    sourceSystem: string;
    receivedAt: string;
    serviceType: "home_health" | "outpatient_therapy" | "skilled_nursing";
    state: "MD" | "VA" | "DC";
    payerType: "MEDICAID" | "MEDICARE" | "PRIVATE" | "TRICARE";
  };

  normalizedFields: Record<string, string | boolean>;
  evidenceRecords: EvidenceRecord[];
  ruleEvaluation: RuleEvaluation;
  llmAdvisory: LLMAdvisory;
  humanReview: HumanReview;
  finalDecision?: FinalDecision;
  auditEvents: AuditEvent[];
};
```

## 6.2 types/replay.ts

```ts
import type {
  RuleDecision,
  RoutingDecision,
  EvidenceBoundSummary,
} from "./referral";

export type ReplayOutput = {
  policyVersion: string;
  promptVersion: string;
  ruleDecision: RuleDecision;
  routingDecision: RoutingDecision;
  requiresHumanReview: boolean;

  // In replay output, reasonCodes and riskFlags are reduced to code strings.
  // The replay table compares version-level output diffs and does not need full ReasonCode objects.
  reasonCodes: string[];
  riskFlags: string[];

  llmSummary: EvidenceBoundSummary[];
};

export type ReplayCaseComparison = {
  caseId: string;
  caseTitle: string;
  historicalFinalDecision: "ACCEPT" | "REJECT";

  baseline: ReplayOutput;
  candidate: ReplayOutput;

  diff: {
    ruleDecisionChanged: boolean;
    routingChanged: boolean;
    humanReviewRequirementChanged: boolean;
    riskFlagsChanged: boolean;
    potentialRegression: boolean;
    summary: string;
  };
};

export type ReplayRun = {
  id: string;
  title: string;
  baselineLabel: string;
  candidateLabel: string;
  versionChangeNotes: {
    policyV1: string[];
    policyV2: string[];
    promptV1: string[];
    promptV2: string[];
  };
  comparisons: ReplayCaseComparison[];
};
```

## 7. Mock Data Requirements

Create:

```text
data/cases.ts
data/replayRuns.ts
```

### 7.1 Safe mock data rules

Allowed mock identifiers:

```text
referralId: ref_case_a_001, ref_case_b_001, ref_case_c_001
patientReferenceId: patient_ref_001, patient_ref_002, patient_ref_003
reviewerId: user_001
sourceSystem: External Intake Portal, Internal Referral System
serviceType: home_health, outpatient_therapy, skilled_nursing
state: MD, VA, DC
payerType: MEDICAID, MEDICARE, PRIVATE, TRICARE
sourceName: Eligibility Portal Record, Extracted Document Evidence, Internal System Record
```

Forbidden data:

```text
first names
last names
DOB
addresses
phone
email
SSN
MRN
NPI
real facility names
real payer member IDs
real document images
real portal screenshots
```

### 7.2 Case data consistency rules

The mock cases must satisfy:

```text
- Case A has finalDecision and currentStatus accepted.
- Case A has humanReview.status = not_required.
- Case A has llmAdvisory.status = skipped.
- Case A audit events include LLMReviewSkipped and FinalDecisionRecorded.

- Case B has no finalDecision initially.
- Case B currentStatus = needs_review.
- Case B currentStage = waiting_for_human_review.
- Case B audit events stop at HumanReviewRequested.
- Case B rule decision = NEEDS_REVIEW.
- Case B routing decision = human_review_required.
- Case B contains MISSING_PHYSICIAN_ORDER as blocking reason/missing field.

- Case C has no finalDecision initially.
- Case C currentStatus = needs_review.
- Case C currentStage = waiting_for_human_review.
- Case C rule decision = REJECT.
- Case C routing decision = human_review_required.
- Case C routing reason includes POLICY_REQUIRES_HUMAN_CONFIRMATION_ON_REJECT.
- Case C audit events include LLMReviewRequested, LLMReviewCompleted, HumanReviewRequested.
```

### 7.3 Evidence reference integrity

Every `supportingEvidenceIds` value in:

```text
reasonCodes
routingReasonCodes
missingFields
conflictFlags
llmAdvisory.evidenceSummary
llmAdvisory.missingFieldAnalysis
llmAdvisory.riskFlags
replay llmSummary
```

must reference an existing evidence record ID in the same case.

Every evidence record’s `usedBy` should match actual usage:

```text
If referenced by rule reason/missing/conflict/routing → include "rule".
If referenced by LLM summary/missing analysis/risk flag → include "llm".
```

## 8. Recommended Directory Structure

```text
auditable-ai-referral-demo/
  app/
    page.tsx
    demo/
      page.tsx
    cases/
      [caseId]/
        page.tsx
    replay/
      page.tsx

  components/
    layout/
      AppShell.tsx
      PageHeader.tsx
      SectionCard.tsx
      StatusBadge.tsx

    case-study/
      HeroSection.tsx
      ProblemSection.tsx
      SystemApproachSection.tsx
      DesignPrinciplesSection.tsx

    demo/
      CaseCard.tsx
      CaseSelectorGrid.tsx

    workflow/
      ReferralSummaryCard.tsx
      NormalizedFieldsCard.tsx
      EvidencePanel.tsx
      RuleEvaluationCard.tsx
      LLMAdvisoryCard.tsx
      HumanReviewPanel.tsx
      AuditTimeline.tsx
      AuditEventPayloadPanel.tsx

    replay/
      VersionChangeNotes.tsx
      ReplaySummaryCards.tsx
      ReplayComparisonTable.tsx
      ReplayDiffPanel.tsx

  data/
    cases.ts
    replayRuns.ts

  types/
    referral.ts
    replay.ts

  lib/
    caseReducer.ts
    eventFactory.ts
    statusMapping.ts
    evidenceSelectors.ts
    replayUtils.ts

  scripts/
    validate-mock-data.ts

  tests/
    caseReducer.test.ts

  README.md
```

Do not over-engineer beyond this structure unless needed for clarity.

## 9. Reducer Specification

Create:

```text
lib/caseReducer.ts
lib/eventFactory.ts
lib/statusMapping.ts
lib/evidenceSelectors.ts
```

### 9.1 Reducer state

```ts
export type CaseDetailState = {
  caseData: ReferralCase;
  selectedEvidenceIds: string[];
  selectedAuditEventId: string | null;
};
```

### 9.2 Reducer actions

```ts
export type CaseDetailAction =
  | {
      type: "SELECT_EVIDENCE";
      evidenceIds: string[];
    }
  | {
      type: "SELECT_AUDIT_EVENT";
      eventId: string;
    }
  | {
      type: "CLEAR_EVIDENCE_SELECTION";
    }
  | {
      type: "RESET_CASE";
      initialCase: ReferralCase;
    }
  | {
      type: "SUBMIT_REVIEW";
      reviewerAction: "confirm" | "override";
      finalDecision: "ACCEPT" | "REJECT";
      reviewerNote: string;
      overrideReason?: string;
    };
```

### 9.3 SUBMIT_REVIEW behavior

`SUBMIT_REVIEW` must:

```text
1. Return unchanged if humanReview.status === "not_required".
2. Return unchanged if humanReview.status === "submitted".
3. Return unchanged if reviewerAction === "override" and overrideReason is empty or whitespace.
4. Append HumanReviewSubmitted.
5. Append HumanOverrideSubmitted if override.
6. Append FinalDecisionRecorded.
7. Update humanReview.status = "submitted".
8. Set humanReview.submittedAt.
9. Set humanReview.reviewerAction.
10. Set humanReview.finalDecision.
11. Set humanReview.overrideFlag.
12. Set humanReview.overrideReason if override.
13. Set humanReview.reviewerNote.
14. Set finalDecision object.
15. Update currentStatus based on finalDecision.
16. Set currentStage = "completed".
```

Status mapping:

```text
FinalDecision ACCEPT → currentStatus = accepted
FinalDecision REJECT → currentStatus = rejected
```

Final decision object:

```ts
{
  decision: finalDecision,
  decidedBy: "reviewer",
  decidedAt: submittedAt,
  overrideFlag: reviewerAction === "override"
}
```

### 9.4 Event creation after submit

Use `eventFactory.ts` to keep event construction consistent.

HumanReviewSubmitted payload should include:

```text
reviewerAction
finalDecision
overrideFlag
reviewerNote if present
```

HumanOverrideSubmitted payload should include:

```text
oldRuleDecision
newFinalDecision
overrideReason
reviewerNote if present
```

FinalDecisionRecorded payload should include:

```text
finalDecision
decidedBy
overrideFlag
source = human_review or auto_finalization
```

### 9.5 RESET_CASE behavior

`RESET_CASE` must:

```text
- deep clone the provided initial case
- set selectedEvidenceIds = []
- set selectedAuditEventId = null
```

## 10. Mock Data Validation Script

Create:

```text
scripts/validate-mock-data.ts
```

Add package script:

```json
{
  "scripts": {
    "validate:mock": "tsx scripts/validate-mock-data.ts"
  }
}
```

The script must validate:

```text
1. Every case ID is unique.
2. Every evidence ID is unique within a case.
3. Every supportingEvidenceIds reference exists.
4. Every audit event has schemaVersion = "1.0".
5. Every audit event has valid correlationId and workflowInstanceId.
6. Every causationEventId references a previous event in the same case.
7. Case A includes LLMReviewSkipped and FinalDecisionRecorded.
8. Case B and Case C initial audit events stop at HumanReviewRequested.
9. Case B and C do not initially include FinalDecisionRecorded.
10. Case C includes POLICY_REQUIRES_HUMAN_CONFIRMATION_ON_REJECT.
11. Case C includes LLMReviewRequested before LLMReviewCompleted.
12. Any case with finalDecision has currentStage = completed.
13. Any case with FinalDecisionRecorded has finalDecision defined.
14. LLM generated output has evidence-bound arrays and no unreferenced evidence claims.
15. Mock data contains no banned PHI/PII-like strings.
16. Replay comparisons separate rule decision and routing decision.
17. Replay `requiresHumanReview` is consistent with routingDecision.
```

For banned PHI/PII detection, use simple pattern checks for obvious problems:

```text
email pattern
phone-like pattern
SSN-like pattern
DOB-like strings
common placeholder human names such as John, Jane, Mary, Smith, Johnson
real facility names if accidentally included
```

Fail the script with non-zero exit code when validation fails.

## 11. Tests

Use Vitest.

Create:

```text
tests/caseReducer.test.ts
```

Add package script:

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

Required reducer tests:

```text
1. Case B confirm submission appends exactly HumanReviewSubmitted and FinalDecisionRecorded and updates status based on selected finalDecision.
2. Case C override submission appends HumanReviewSubmitted, HumanOverrideSubmitted, and FinalDecisionRecorded.
3. Override without reason returns unchanged state or produces expected validation no-op.
4. SUBMIT_REVIEW on Case A where humanReview.status = not_required returns unchanged state.
5. RESET_CASE restores initial state and clears selectedEvidenceIds / selectedAuditEventId.
6. After RESET_CASE on a previously submitted Case B, SUBMIT_REVIEW can succeed again and append correct events.
7. SUBMIT_REVIEW on already submitted review is no-op.
8. SELECT_EVIDENCE and CLEAR_EVIDENCE_SELECTION update only UI selection state, not caseData.
9. SELECT_AUDIT_EVENT updates only selectedAuditEventId.
```

## 12. Component Behavior Requirements

### 12.1 StatusBadge

Create a generic status badge component for statuses, decisions, severities, and risk levels.

It should support text display and visual differentiation. Do not over-optimize color semantics; keep it clean and readable.

### 12.2 SectionCard

Use a reusable card wrapper with:

```text
- title
- optional description
- children
```

### 12.3 EvidencePanel

Props should include:

```ts
evidenceRecords: EvidenceRecord[];
selectedEvidenceIds: string[];
onClearSelection: () => void;
```

Behavior:

```text
- Highlight selected evidence records.
- Show Clear Selection only when selectedEvidenceIds is non-empty.
- Display usedBy badges for rule and LLM.
```

### 12.4 RuleEvaluationCard

Props should include:

```ts
ruleEvaluation: RuleEvaluation;
onSelectEvidence: (ids: string[]) => void;
```

Behavior:

```text
- Clicking reason code calls onSelectEvidence(reasonCode.supportingEvidenceIds).
- Clicking missing field calls onSelectEvidence(missingField.supportingEvidenceIds).
- Clicking conflict flag calls onSelectEvidence(conflictFlag.supportingEvidenceIds).
- Clicking routing reason code calls onSelectEvidence(reasonCode.supportingEvidenceIds).
```

### 12.5 LLMAdvisoryCard

Props should include:

```ts
llmAdvisory: LLMAdvisory;
onSelectEvidence: (ids: string[]) => void;
```

Behavior:

```text
- If skipped: show skipped reason.
- If generated: show advisory-only banner and evidence-bound sections.
- If failed: show error and nextAction.
- Clicking summary/missing analysis/risk flag selects evidence.
```

### 12.6 HumanReviewPanel

Props should include:

```ts
caseData: ReferralCase;
onSubmitReview: (input: {
  reviewerAction: "confirm" | "override";
  finalDecision: "ACCEPT" | "REJECT";
  reviewerNote: string;
  overrideReason?: string;
}) => void;
```

Behavior:

```text
- If humanReview.status = not_required: read-only banner, no form.
- If submitted: show submitted state and final decision; do not allow resubmit.
- If pending/in_progress: render form.
- Confirm mode: allow final decision selection; override reason not required.
- Override mode: final decision + override reason required.
- Submit disabled when override reason missing.
```

### 12.7 AuditTimeline

Props:

```ts
auditEvents: AuditEvent[];
selectedAuditEventId: string | null;
onSelectEvent: (eventId: string) => void;
```

Behavior:

```text
- Display eventType, actor, timestamp.
- Highlight selected event.
- Clicking event selects it.
```

### 12.8 AuditEventPayloadPanel

Props:

```ts
event?: AuditEvent;
```

Behavior:

```text
- If no event selected, show placeholder.
- If event selected, show event metadata and pretty-printed JSON payload.
- Keep payload read-only.
```

### 12.9 Replay components

Implement:

```text
VersionChangeNotes
ReplaySummaryCards
ReplayComparisonTable
ReplayDiffPanel
```

ReplaySummaryCards should compute:

```text
total cases
rule decision changes
routing changes
human review requirement changes
potential regressions
```

ReplayComparisonTable should allow selecting a row.

ReplayDiffPanel should show baseline and candidate JSON side by side.

## 13. Implementation Phases for Claude Code

Follow this order. Do not start with UI before types and mock data.

### Phase 0: Initialization (finish Next.js scaffold)

Implement:

```text
- Next.js App Router
- TypeScript
- Tailwind
- Vitest
- tsx
- base layout
- package scripts
```

Required scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "test": "vitest run",
    "validate:mock": "tsx scripts/validate-mock-data.ts"
  }
}
```

If `next lint` is unavailable depending on the Next.js version, replace with an ESLint-compatible script or omit only if build/test/validate remain functional.

### Phase 1: Type system

Create:

```text
types/referral.ts
types/replay.ts
```

Use the contracts in this file.

### Phase 2: Mock cases + validator

This phase combines mock case data and the validator that enforces consistency.

#### Mock cases

Create:

```text
data/cases.ts
```

Add Case A, Case B, Case C with complete data and audit timelines.

#### Mock validation

Create:

```text
scripts/validate-mock-data.ts
```

Run:

```bash
npm run validate:mock
```

Fix any validation issue before building UI.

### Phase 3: Case Selector

Build:

```text
/demo
components/demo/CaseCard.tsx
components/demo/CaseSelectorGrid.tsx
```

### Phase 4: Case Detail static UI

Build `/cases/[caseId]` with static display first:

```text
ReferralSummaryCard
NormalizedFieldsCard
EvidencePanel
RuleEvaluationCard
LLMAdvisoryCard
HumanReviewPanel
AuditTimeline
AuditEventPayloadPanel
```

At this point, submit and clicks may still be non-functional.

### Phase 5: Evidence binding interaction

Implement:

```text
- selectedEvidenceIds reducer state
- SELECT_EVIDENCE
- CLEAR_EVIDENCE_SELECTION
- click reason/missing/conflict/summary/risk flag → highlight evidence
```

### Phase 6: Audit event interaction

Implement:

```text
- selectedAuditEventId reducer state
- SELECT_AUDIT_EVENT
- clicked event displays payload panel
```

### Phase 7a: Reducer implementation

Implement:

```text
lib/caseReducer.ts
lib/eventFactory.ts
lib/statusMapping.ts
```

Support reset and submit behavior exactly as specified.

### Phase 7b: Reducer tests

Create Vitest tests.

Run:

```bash
npm run test
```

Fix failures.

### Phase 8: Replay & Evaluation

Create:

```text
data/replayRuns.ts
/replay
components/replay/*
```

Run mock validation again.

### Phase 9: Case Study Landing Page

Build `/` after demo works, so the landing page accurately describes what exists.

### Phase 10: Polish / README / Deploy

README must include:

```text
- project purpose
- frontend-only disclaimer
- key routes
- architecture narrative
- local setup
- scripts
- what the demo proves
- what is intentionally not implemented
- future production extension notes
```

Run:

```bash
npm run validate:mock
npm run test
npm run build
```

All must pass.

## 14. Final Acceptance Checklist

### 14.1 Functional acceptance

```text
[ ] / loads
[ ] /demo loads
[ ] /cases/case-a loads
[ ] /cases/case-b loads
[ ] /cases/case-c loads
[ ] /replay loads

[ ] Case A shows accepted/completed
[ ] Case A shows LLMReviewSkipped
[ ] Case A human review panel is read-only
[ ] Case B initial timeline stops at HumanReviewRequested
[ ] Case C initial timeline stops at HumanReviewRequested
[ ] Case C includes policy reason for human review after REJECT

[ ] Click reason code highlights evidence
[ ] Click missing field highlights evidence
[ ] Click conflict flag highlights evidence
[ ] Click LLM summary highlights evidence
[ ] Click risk flag highlights evidence
[ ] Click Clear Selection clears evidence highlight
[ ] Click audit event expands payload

[ ] Case B submit appends HumanReviewSubmitted + FinalDecisionRecorded
[ ] Case C override appends HumanReviewSubmitted + HumanOverrideSubmitted + FinalDecisionRecorded
[ ] Submit updates currentStatus
[ ] Submit updates currentStage to completed
[ ] Override requires reason
[ ] Reset Case works
[ ] Reset submitted Case B allows another submit

[ ] Replay table separates rule decision and routing decision
[ ] Replay page includes Version Change Notes
[ ] Replay diff panel shows baseline/candidate JSON
```

### 14.2 Semantic acceptance

```text
[ ] LLM is never described as final decision maker
[ ] rule decision and final decision are not mixed
[ ] rule decision and routing decision are not mixed
[ ] request_more_info is not implemented in MVP human review submit flow
[ ] evidenceSummary is an array with supportingEvidenceIds
[ ] reasonCodes are ReasonCode objects with supportingEvidenceIds
[ ] missingFields are structured objects
[ ] HumanReview has submittedAt after submit
[ ] Case A cannot submit review
[ ] audit events have schemaVersion
[ ] causationEventId references valid previous events
[ ] evidence.usedBy matches actual references
[ ] replay requiresHumanReview matches routingDecision
[ ] mock data contains no names, DOB, phone, email, address, SSN, MRN, NPI, real facilities, or real payer IDs
```

### 14.3 Engineering acceptance

```text
[ ] npm run build succeeds
[ ] npm run validate:mock succeeds
[ ] npm run test succeeds
[ ] No TypeScript errors
[ ] No major responsive layout break on mobile
[ ] Vercel deployment works
[ ] README is complete
```

## 15. README Resume Description

Include this optional resume-ready description in README or a docs section:

```text
Auditable AI Referral Review Workflow Demo | Next.js, TypeScript, Tailwind, Vercel
- Built a frontend-only interactive demo simulating a governed referral review workflow with deterministic rule outputs, workflow routing, evidence-bound LLM advisory results, human review actions, audit trail interactions, and replay comparison.
- Implemented evidence-binding interactions linking rule reason codes, missing fields, conflict flags, LLM summaries, and risk flags to supporting evidence records.
- Designed replay comparison views separating rule decision changes, routing changes, human review requirements, and potential regression signals across policy/prompt versions.
- Added mock data validation and reducer tests to enforce workflow consistency, evidence reference integrity, and review-state correctness.
```

## 16. Future Production Extension Notes

Do not implement these in the frontend-only MVP, but mention them as future production extensions:

### Backend / workflow layer

```text
API service for referral intake, workflow state query, review submission, and replay request.
SQL-backed workflow_instances and workflow_tasks.
Outbox publisher for reliable event publishing.
Workers for rule evaluation, LLM review, human review continuation, and recovery scanning.
```

### Data layer

```text
PostgreSQL for transactional records such as referrals, rule evaluations, human reviews, final decisions, event logs, and outbox events.
S3 for large artifacts such as evidence packages, LLM requests/responses, OCR outputs, and replay outputs.
Unique constraints and idempotency keys for replay-safe processing.
```

### LLM integration

```text
Provider integration with prompt versioning, model metadata, structured output validation, PHI minimization, cost tracking, latency monitoring, and failure handling.
```

### Security

```text
RBAC, artifact access logs, PHI/PII minimization, audit retention, environment separation, and production/evaluation isolation.
```

### Evaluation

```text
Benchmark datasets with label quality, replay runs, shadow evaluation, regression checks, and go/no-go promotion criteria.
```

### Future MVP extension

```text
Support request_more_info workflows with additional evidence request events, document re-fetch tasks, and waiting_for_more_evidence state.
```

## 17. Development Priority Rule

The quality of this demo depends more on semantic consistency than visual polish.

Prioritize:

```text
1. Type correctness
2. Mock data consistency
3. Evidence reference integrity
4. Reducer correctness
5. Audit event causation
6. Replay semantic clarity
7. UI polish
```

Do not build a nice-looking but semantically inconsistent demo.

