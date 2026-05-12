// Source of truth: .claude/PROJECT_SPEC.md §6.1. Do not weaken without updating the spec.

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
  | "llm_review_skipped" // transient; appears in timeline, not terminal display state
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
