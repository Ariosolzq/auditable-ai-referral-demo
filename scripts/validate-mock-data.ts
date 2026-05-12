import { cases } from "../data/cases";
import type { ReferralCase } from "../types/referral";

type ValidationError = {
  caseId: string;
  check: string;
  message: string;
};

const errors: ValidationError[] = [];

function fail(caseId: string, check: string, message: string): void {
  errors.push({ caseId, check, message });
}

// ---------------------------------------------------------------------------
// Check 1: case id uniqueness
// ---------------------------------------------------------------------------
function checkCaseIdUniqueness(cs: ReferralCase[]): void {
  const seen = new Set<string>();
  for (const c of cs) {
    if (seen.has(c.id)) {
      fail(c.id, "case_id_uniqueness", `Duplicate case id: ${c.id}`);
    }
    seen.add(c.id);
  }
}

// ---------------------------------------------------------------------------
// Check 2: evidence id uniqueness within each case
// ---------------------------------------------------------------------------
function checkEvidenceIdUniqueness(c: ReferralCase): void {
  const seen = new Set<string>();
  for (const e of c.evidenceRecords) {
    if (seen.has(e.id)) {
      fail(
        c.id,
        "evidence_id_uniqueness",
        `Duplicate evidence id within case: ${e.id}`,
      );
    }
    seen.add(e.id);
  }
}

// ---------------------------------------------------------------------------
// Check 3: all supportingEvidenceIds reference an existing evidence id in the
// same case
// ---------------------------------------------------------------------------
function checkSupportingEvidenceReferences(c: ReferralCase): void {
  const evidenceIds = new Set(c.evidenceRecords.map((e) => e.id));

  const verify = (path: string, ids: string[]): void => {
    for (const id of ids) {
      if (!evidenceIds.has(id)) {
        fail(
          c.id,
          "supporting_evidence_references",
          `${path}: supportingEvidenceId "${id}" does not exist in case ${c.id}`,
        );
      }
    }
  };

  c.ruleEvaluation.reasonCodes.forEach((r, i) =>
    verify(`ruleEvaluation.reasonCodes[${i}]`, r.supportingEvidenceIds),
  );
  c.ruleEvaluation.routingReasonCodes.forEach((r, i) =>
    verify(`ruleEvaluation.routingReasonCodes[${i}]`, r.supportingEvidenceIds),
  );
  c.ruleEvaluation.missingFields.forEach((m, i) =>
    verify(`ruleEvaluation.missingFields[${i}]`, m.supportingEvidenceIds),
  );
  c.ruleEvaluation.conflictFlags.forEach((cf, i) =>
    verify(`ruleEvaluation.conflictFlags[${i}]`, cf.supportingEvidenceIds),
  );

  if (c.llmAdvisory.status === "generated") {
    c.llmAdvisory.evidenceSummary.forEach((s, i) =>
      verify(`llmAdvisory.evidenceSummary[${i}]`, s.supportingEvidenceIds),
    );
    c.llmAdvisory.missingFieldAnalysis.forEach((m, i) =>
      verify(
        `llmAdvisory.missingFieldAnalysis[${i}]`,
        m.supportingEvidenceIds,
      ),
    );
    c.llmAdvisory.riskFlags.forEach((r, i) =>
      verify(`llmAdvisory.riskFlags[${i}]`, r.supportingEvidenceIds),
    );
  }
}

// ---------------------------------------------------------------------------
// Check 4: schemaVersion === "1.0" for every audit event
// ---------------------------------------------------------------------------
function checkAuditSchemaVersion(c: ReferralCase): void {
  c.auditEvents.forEach((e, i) => {
    if (e.schemaVersion !== "1.0") {
      fail(
        c.id,
        "audit_schema_version",
        `auditEvents[${i}] (${e.eventType}): schemaVersion is "${e.schemaVersion}", expected "1.0"`,
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Check 5: correlationId and workflowInstanceId present on every audit event
// ---------------------------------------------------------------------------
function checkAuditIdentifiers(c: ReferralCase): void {
  c.auditEvents.forEach((e, i) => {
    if (!e.correlationId || e.correlationId.trim() === "") {
      fail(
        c.id,
        "audit_correlation_id",
        `auditEvents[${i}] (${e.eventType}): correlationId is missing or empty`,
      );
    }
    if (!e.workflowInstanceId || e.workflowInstanceId.trim() === "") {
      fail(
        c.id,
        "audit_workflow_instance_id",
        `auditEvents[${i}] (${e.eventType}): workflowInstanceId is missing or empty`,
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Check 6: causationEventId, if present, references an earlier event in same
// case
// ---------------------------------------------------------------------------
function checkCausationOrdering(c: ReferralCase): void {
  c.auditEvents.forEach((e, i) => {
    if (!e.causationEventId) return;
    const causeIdx = c.auditEvents.findIndex(
      (p) => p.id === e.causationEventId,
    );
    if (causeIdx === -1) {
      fail(
        c.id,
        "causation_event_reference",
        `auditEvents[${i}] (${e.eventType}): causationEventId "${e.causationEventId}" does not exist in case`,
      );
    } else if (causeIdx >= i) {
      fail(
        c.id,
        "causation_event_order",
        `auditEvents[${i}] (${e.eventType}): causationEventId "${e.causationEventId}" is at index ${causeIdx}, must be strictly earlier`,
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Check 7 & 8: case-specific timeline shape
// ---------------------------------------------------------------------------
const CASE_A_TIMELINE: ReadonlyArray<string> = [
  "ReferralCreated",
  "WorkflowStarted",
  "FieldsNormalized",
  "EvidencePackageBuilt",
  "RuleDecisionGenerated",
  "LLMReviewSkipped",
  "FinalDecisionRecorded",
];

const CASE_BC_TIMELINE: ReadonlyArray<string> = [
  "ReferralCreated",
  "WorkflowStarted",
  "FieldsNormalized",
  "EvidencePackageBuilt",
  "RuleDecisionGenerated",
  "LLMReviewRequested",
  "LLMReviewCompleted",
  "HumanReviewRequested",
];

function checkTimelineShape(c: ReferralCase): void {
  const actual = c.auditEvents.map((e) => e.eventType);
  let expected: ReadonlyArray<string> | null = null;
  if (c.id === "case-a") expected = CASE_A_TIMELINE;
  else if (c.id === "case-b" || c.id === "case-c") expected = CASE_BC_TIMELINE;
  if (!expected) return;

  if (actual.length !== expected.length) {
    fail(
      c.id,
      "timeline_shape_length",
      `auditEvents length is ${actual.length}, expected ${expected.length}`,
    );
  }
  const compareLen = Math.min(actual.length, expected.length);
  for (let i = 0; i < compareLen; i++) {
    if (actual[i] !== expected[i]) {
      fail(
        c.id,
        "timeline_shape_order",
        `auditEvents[${i}] is "${actual[i]}", expected "${expected[i]}"`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Check 9: Case B and Case C must not initially include
// HumanReviewSubmitted, HumanOverrideSubmitted, FinalDecisionRecorded
// ---------------------------------------------------------------------------
const FORBIDDEN_BC_INITIAL_EVENTS = new Set([
  "HumanReviewSubmitted",
  "HumanOverrideSubmitted",
  "FinalDecisionRecorded",
]);

function checkCaseBCInitialEvents(c: ReferralCase): void {
  if (c.id !== "case-b" && c.id !== "case-c") return;
  for (const e of c.auditEvents) {
    if (FORBIDDEN_BC_INITIAL_EVENTS.has(e.eventType)) {
      fail(
        c.id,
        "case_bc_initial_events",
        `Initial auditEvents must not include "${e.eventType}"`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Check 10: Case C must include routingReasonCode
// POLICY_REQUIRES_HUMAN_CONFIRMATION_ON_REJECT
// ---------------------------------------------------------------------------
function checkCaseCRoutingReason(c: ReferralCase): void {
  if (c.id !== "case-c") return;
  const codes = c.ruleEvaluation.routingReasonCodes.map((r) => r.code);
  if (!codes.includes("POLICY_REQUIRES_HUMAN_CONFIRMATION_ON_REJECT")) {
    fail(
      c.id,
      "case_c_routing_reason",
      `Case C must include routingReasonCode POLICY_REQUIRES_HUMAN_CONFIRMATION_ON_REJECT`,
    );
  }
}

// ---------------------------------------------------------------------------
// Check 11: LLMReviewCompleted must be preceded by LLMReviewRequested
// ---------------------------------------------------------------------------
function checkLLMReviewOrdering(c: ReferralCase): void {
  for (let i = 0; i < c.auditEvents.length; i++) {
    if (c.auditEvents[i].eventType !== "LLMReviewCompleted") continue;
    const precedes = c.auditEvents
      .slice(0, i)
      .some((p) => p.eventType === "LLMReviewRequested");
    if (!precedes) {
      fail(
        c.id,
        "llm_review_ordering",
        `LLMReviewCompleted at index ${i} is not preceded by LLMReviewRequested`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Check 12: LLMReviewSkipped only when llmAdvisory.status === "skipped"
// ---------------------------------------------------------------------------
function checkLLMSkippedConsistency(c: ReferralCase): void {
  const hasSkippedEvent = c.auditEvents.some(
    (e) => e.eventType === "LLMReviewSkipped",
  );
  if (hasSkippedEvent && c.llmAdvisory.status !== "skipped") {
    fail(
      c.id,
      "llm_skipped_consistency",
      `LLMReviewSkipped audit event present but llmAdvisory.status is "${c.llmAdvisory.status}"`,
    );
  }
  if (!hasSkippedEvent && c.llmAdvisory.status === "skipped") {
    fail(
      c.id,
      "llm_skipped_consistency",
      `llmAdvisory.status is "skipped" but no LLMReviewSkipped audit event is present`,
    );
  }
}

// ---------------------------------------------------------------------------
// Check 13: humanReview.not_required → finalDecision must exist
// ---------------------------------------------------------------------------
function checkNotRequiredReviewFinalDecision(c: ReferralCase): void {
  if (c.humanReview.status === "not_required" && !c.finalDecision) {
    fail(
      c.id,
      "not_required_requires_final_decision",
      `humanReview.status is "not_required" but finalDecision is missing`,
    );
  }
}

// ---------------------------------------------------------------------------
// Check 14: finalDecision present → currentStatus + currentStage consistent
// ---------------------------------------------------------------------------
function checkFinalDecisionConsistency(c: ReferralCase): void {
  if (!c.finalDecision) return;
  if (c.currentStage !== "completed") {
    fail(
      c.id,
      "final_decision_stage_consistency",
      `finalDecision present but currentStage is "${c.currentStage}" (expected "completed")`,
    );
  }
  const expectedStatus =
    c.finalDecision.decision === "ACCEPT" ? "accepted" : "rejected";
  if (c.currentStatus !== expectedStatus) {
    fail(
      c.id,
      "final_decision_status_consistency",
      `finalDecision.decision is "${c.finalDecision.decision}" but currentStatus is "${c.currentStatus}" (expected "${expectedStatus}")`,
    );
  }
}

// ---------------------------------------------------------------------------
// Check 15: llmAdvisory.generated must have evidence-bound arrays
// ---------------------------------------------------------------------------
function checkGeneratedLLMEvidenceBinding(c: ReferralCase): void {
  if (c.llmAdvisory.status !== "generated") return;
  const evidenceIds = new Set(c.evidenceRecords.map((e) => e.id));

  const requireBound = (path: string, ids: string[]): void => {
    if (ids.length === 0) {
      fail(
        c.id,
        "llm_evidence_binding_empty",
        `${path}: supportingEvidenceIds is empty (every generated LLM item must cite evidence)`,
      );
      return;
    }
    for (const id of ids) {
      if (!evidenceIds.has(id)) {
        fail(
          c.id,
          "llm_evidence_binding_invalid",
          `${path}: supportingEvidenceId "${id}" not present in evidenceRecords`,
        );
      }
    }
  };

  c.llmAdvisory.evidenceSummary.forEach((s, i) =>
    requireBound(`llmAdvisory.evidenceSummary[${i}]`, s.supportingEvidenceIds),
  );
  c.llmAdvisory.missingFieldAnalysis.forEach((m, i) =>
    requireBound(
      `llmAdvisory.missingFieldAnalysis[${i}]`,
      m.supportingEvidenceIds,
    ),
  );
  c.llmAdvisory.riskFlags.forEach((r, i) =>
    requireBound(`llmAdvisory.riskFlags[${i}]`, r.supportingEvidenceIds),
  );
}

// ---------------------------------------------------------------------------
// Check 16: evidence.usedBy must match actual references (bidirectional)
// ---------------------------------------------------------------------------
function checkUsedByConsistency(c: ReferralCase): void {
  const ruleUsed = new Set<string>();
  const llmUsed = new Set<string>();

  for (const r of c.ruleEvaluation.reasonCodes) {
    r.supportingEvidenceIds.forEach((id) => ruleUsed.add(id));
  }
  for (const r of c.ruleEvaluation.routingReasonCodes) {
    r.supportingEvidenceIds.forEach((id) => ruleUsed.add(id));
  }
  for (const m of c.ruleEvaluation.missingFields) {
    m.supportingEvidenceIds.forEach((id) => ruleUsed.add(id));
  }
  for (const cf of c.ruleEvaluation.conflictFlags) {
    cf.supportingEvidenceIds.forEach((id) => ruleUsed.add(id));
  }

  if (c.llmAdvisory.status === "generated") {
    for (const s of c.llmAdvisory.evidenceSummary) {
      s.supportingEvidenceIds.forEach((id) => llmUsed.add(id));
    }
    for (const m of c.llmAdvisory.missingFieldAnalysis) {
      m.supportingEvidenceIds.forEach((id) => llmUsed.add(id));
    }
    for (const r of c.llmAdvisory.riskFlags) {
      r.supportingEvidenceIds.forEach((id) => llmUsed.add(id));
    }
  }

  for (const ev of c.evidenceRecords) {
    const declaresRule = ev.usedBy.includes("rule");
    const declaresLLM = ev.usedBy.includes("llm");
    const actualRule = ruleUsed.has(ev.id);
    const actualLLM = llmUsed.has(ev.id);

    if (declaresRule !== actualRule) {
      fail(
        c.id,
        "used_by_consistency_rule",
        `evidence "${ev.id}": usedBy includes "rule"=${declaresRule}, but actual rule reference=${actualRule}`,
      );
    }
    if (declaresLLM !== actualLLM) {
      fail(
        c.id,
        "used_by_consistency_llm",
        `evidence "${ev.id}": usedBy includes "llm"=${declaresLLM}, but actual llm reference=${actualLLM}`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Check 17: PHI/PII scan across the JSON-serialized cases array
// ---------------------------------------------------------------------------
const PHI_PATTERNS: { name: string; pattern: RegExp }[] = [
  {
    name: "email",
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  },
  { name: "phone_dashed", pattern: /\b\d{3}-\d{3}-\d{4}\b/g },
  { name: "phone_paren", pattern: /\(\d{3}\)\s*\d{3}-\d{4}/g },
  { name: "ssn", pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
  { name: "dob_slash", pattern: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g },
];

const NAME_STOPLIST: ReadonlyArray<string> = [
  "John",
  "Jane",
  "Mary",
  "Robert",
  "Michael",
  "Jennifer",
  "Jessica",
  "David",
  "Sarah",
  "James",
  "William",
  "Patricia",
  "Linda",
  "Barbara",
  "Elizabeth",
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
];

const FACILITY_PAYER_STOPLIST: ReadonlyArray<string> = [
  "Kaiser",
  "Aetna",
  "Humana",
  "UnitedHealth",
  "Anthem",
  "Cigna",
  "Blue Cross",
  "BlueCross",
  "BlueShield",
  "Centene",
  "Molina",
  "Optum",
  "Cleveland Clinic",
  "Mayo Clinic",
  "Johns Hopkins",
  "Mount Sinai",
  "Premier Health",
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function contextAt(text: string, idx: number, len: number): string {
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + len + 40);
  return text.substring(start, end);
}

function checkPHIPII(cs: ReferralCase[]): void {
  const serialized = JSON.stringify(cs);

  for (const { name, pattern } of PHI_PATTERNS) {
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(serialized)) !== null) {
      const ctx = contextAt(serialized, m.index, m[0].length);
      fail(
        "(global)",
        `phi_pattern_${name}`,
        `pattern="${name}" match="${m[0]}" context="...${ctx}..."`,
      );
    }
  }

  for (const stop of NAME_STOPLIST) {
    const re = new RegExp(`\\b${escapeRegex(stop)}\\b`, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(serialized)) !== null) {
      const ctx = contextAt(serialized, m.index, m[0].length);
      fail(
        "(global)",
        "phi_name_stoplist",
        `pattern="name_stoplist" match="${stop}" context="...${ctx}..."`,
      );
    }
  }

  for (const stop of FACILITY_PAYER_STOPLIST) {
    const re = new RegExp(`\\b${escapeRegex(stop)}\\b`, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(serialized)) !== null) {
      const ctx = contextAt(serialized, m.index, m[0].length);
      fail(
        "(global)",
        "phi_facility_payer_stoplist",
        `pattern="facility_payer_stoplist" match="${stop}" context="...${ctx}..."`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
function main(): void {
  checkCaseIdUniqueness(cases);
  for (const c of cases) {
    checkEvidenceIdUniqueness(c);
    checkSupportingEvidenceReferences(c);
    checkAuditSchemaVersion(c);
    checkAuditIdentifiers(c);
    checkCausationOrdering(c);
    checkTimelineShape(c);
    checkCaseBCInitialEvents(c);
    checkCaseCRoutingReason(c);
    checkLLMReviewOrdering(c);
    checkLLMSkippedConsistency(c);
    checkNotRequiredReviewFinalDecision(c);
    checkFinalDecisionConsistency(c);
    checkGeneratedLLMEvidenceBinding(c);
    checkUsedByConsistency(c);
  }
  checkPHIPII(cases);

  const caseIds = cases.map((c) => c.id).join(", ");
  if (errors.length === 0) {
    console.log(`Mock data validation PASSED for ${cases.length} cases: ${caseIds}`);
    return;
  }

  console.error(
    `Mock data validation FAILED with ${errors.length} error(s) across ${cases.length} cases (${caseIds}):\n`,
  );
  const grouped = new Map<string, ValidationError[]>();
  for (const e of errors) {
    const bucket = grouped.get(e.caseId) ?? [];
    bucket.push(e);
    grouped.set(e.caseId, bucket);
  }
  for (const [caseId, list] of grouped) {
    console.error(`  [${caseId}] (${list.length})`);
    for (const e of list) {
      console.error(`    - ${e.check}: ${e.message}`);
    }
  }
  process.exit(1);
}

main();
