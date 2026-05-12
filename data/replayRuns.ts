import type { ReplayRun } from "@/types/replay";

// Version change notes are copied verbatim from PROJECT_SPEC.md §5.8
// "Required version change notes". Do not paraphrase.
const run: ReplayRun = {
  id: "replay_v1_to_v2",
  title: "Policy v1 / Prompt v1 → Policy v2 / Prompt v2",
  baselineLabel: "policy_v1 + prompt_v1",
  candidateLabel: "policy_v2 + prompt_v2",
  versionChangeNotes: {
    policyV1: [
      "Low-risk accept cases can auto_accept when all required evidence is present.",
      "Missing physician order is blocking and routes directly to human_review_required.",
      "High-risk reject cases require human confirmation before finalization.",
    ],
    policyV2: [
      "Low-risk accept behavior remains unchanged.",
      "Missing physician order remains blocking, but policy introduces needs_more_evidence when the missing document may be recoverable through document re-fetch.",
      "Eligibility conflict or stale evidence cases route to needs_more_evidence before human review.",
      "High-risk reject cases still require human confirmation.",
    ],
    promptV1: [
      "Produces general reviewer notes and high-level risk explanations.",
      "Evidence references may be present but are less granular.",
    ],
    promptV2: [
      "Requires every advisory claim to cite supporting evidence IDs.",
      "Splits evidence summary, missing field analysis, risk flags, and unsupported claims.",
      "Produces shorter, more scannable reviewer-facing output.",
    ],
  },
  comparisons: [
    // ---------------------------------------------------------------
    // Case A: Low-risk Accept
    // Source: PROJECT_SPEC.md §5.8 policy_v2 bullet 1 —
    //   "Low-risk accept behavior remains unchanged."
    // No routing, rule, review, or risk-flag change between baseline
    // and candidate. potentialRegression = false.
    // ---------------------------------------------------------------
    {
      caseId: "case-a",
      caseTitle: "Case A: Low-risk Accept",
      historicalFinalDecision: "ACCEPT",
      baseline: {
        policyVersion: "policy_v1",
        promptVersion: "prompt_v1",
        ruleDecision: "ACCEPT",
        routingDecision: "auto_accept",
        requiresHumanReview: false,
        reasonCodes: [
          "ELIGIBILITY_ACTIVE",
          "AUTHORIZATION_NOT_REQUIRED",
          "PHYSICIAN_ORDER_PRESENT",
          "IDENTITY_VERIFIED",
        ],
        riskFlags: [],
        llmSummary: [],
      },
      candidate: {
        policyVersion: "policy_v2",
        promptVersion: "prompt_v2",
        ruleDecision: "ACCEPT",
        routingDecision: "auto_accept",
        requiresHumanReview: false,
        reasonCodes: [
          "ELIGIBILITY_ACTIVE",
          "AUTHORIZATION_NOT_REQUIRED",
          "PHYSICIAN_ORDER_PRESENT",
          "IDENTITY_VERIFIED",
        ],
        riskFlags: [],
        llmSummary: [],
      },
      diff: {
        ruleDecisionChanged: false,
        routingChanged: false,
        humanReviewRequirementChanged: false,
        riskFlagsChanged: false,
        potentialRegression: false,
        summary:
          "Low-risk accept behavior remains unchanged under policy_v2.",
      },
    },

    // ---------------------------------------------------------------
    // Case B: Missing Evidence → Needs Review
    // Source consideration: PROJECT_SPEC.md §5.8 policy_v2 bullet 2 —
    //   "Missing physician order remains blocking, but policy introduces
    //    needs_more_evidence when the missing document MAY be recoverable
    //    through document re-fetch."
    // The trigger is conditional on a recoverability signal. Case B's
    // mock data does not carry an explicit recoverability signal for
    // the missing physician order, so per Phase 8 user rule 7 the
    // candidate routing stays at human_review_required. No diff.
    // ---------------------------------------------------------------
    {
      caseId: "case-b",
      caseTitle: "Case B: Missing Evidence → Needs Review",
      historicalFinalDecision: "ACCEPT",
      baseline: {
        policyVersion: "policy_v1",
        promptVersion: "prompt_v1",
        ruleDecision: "NEEDS_REVIEW",
        routingDecision: "human_review_required",
        requiresHumanReview: true,
        reasonCodes: [
          "MISSING_PHYSICIAN_ORDER",
          "ELIGIBILITY_ACTIVE",
          "AUTHORIZATION_REQUIRED",
          "IDENTITY_VERIFIED",
        ],
        riskFlags: ["UNVERIFIED_PHYSICIAN_ORDER"],
        llmSummary: [
          {
            id: "sum_b_001",
            summary:
              "Eligibility appears active based on the eligibility portal record.",
            supportingEvidenceIds: ["ev_b_eligibility_active"],
            confidence: "high",
          },
          {
            id: "sum_b_002",
            summary:
              "Physician order is not present in extracted document evidence; submission is incomplete.",
            supportingEvidenceIds: ["ev_b_physician_order_missing"],
            confidence: "high",
          },
        ],
      },
      candidate: {
        policyVersion: "policy_v2",
        promptVersion: "prompt_v2",
        ruleDecision: "NEEDS_REVIEW",
        routingDecision: "human_review_required",
        requiresHumanReview: true,
        reasonCodes: [
          "MISSING_PHYSICIAN_ORDER",
          "ELIGIBILITY_ACTIVE",
          "AUTHORIZATION_REQUIRED",
          "IDENTITY_VERIFIED",
        ],
        riskFlags: ["UNVERIFIED_PHYSICIAN_ORDER"],
        llmSummary: [
          {
            id: "sum_b_001",
            summary:
              "Eligibility appears active based on the eligibility portal record.",
            supportingEvidenceIds: ["ev_b_eligibility_active"],
            confidence: "high",
          },
          {
            id: "sum_b_002",
            summary:
              "Physician order is not present in extracted document evidence; submission is incomplete.",
            supportingEvidenceIds: ["ev_b_physician_order_missing"],
            confidence: "high",
          },
        ],
      },
      diff: {
        ruleDecisionChanged: false,
        routingChanged: false,
        humanReviewRequirementChanged: false,
        riskFlagsChanged: false,
        potentialRegression: false,
        summary:
          "Missing physician order remains blocking; case-b has no explicit recoverability signal, so candidate routing stays at human_review_required under policy_v2.",
      },
    },

    // ---------------------------------------------------------------
    // Case C: Rule Reject → Human Override
    // Source: PROJECT_SPEC.md §5.8 policy_v2 bullet 3 —
    //   "Eligibility conflict or stale evidence cases route to
    //    needs_more_evidence before human review."
    // Case C's baseline carries the STALE_ELIGIBILITY_EVIDENCE risk
    // flag and a medium-confidence lapsed-eligibility summary, so the
    // candidate (policy_v2) routes to needs_more_evidence with
    // requiresHumanReview=false (immediate next action is document
    // re-fetch, not human review).
    // §4.3 explicitly authorizes needs_more_evidence as a candidate
    // routing result in replay comparison output.
    // The diff.summary text is the verbatim example interpretation
    // from PROJECT_SPEC.md §5.8 "Diff panel".
    // ---------------------------------------------------------------
    {
      caseId: "case-c",
      caseTitle: "Case C: Rule Reject → Human Override",
      historicalFinalDecision: "ACCEPT",
      baseline: {
        policyVersion: "policy_v1",
        promptVersion: "prompt_v1",
        ruleDecision: "REJECT",
        routingDecision: "human_review_required",
        requiresHumanReview: true,
        reasonCodes: [
          "ELIGIBILITY_LAPSED",
          "PHYSICIAN_ORDER_PRESENT",
          "IDENTITY_VERIFIED",
          "AUTHORIZATION_REQUIRED",
        ],
        riskFlags: ["STALE_ELIGIBILITY_EVIDENCE"],
        llmSummary: [
          {
            id: "sum_c_001",
            summary:
              "Eligibility portal indicates lapsed coverage at the time of intake.",
            supportingEvidenceIds: ["ev_c_eligibility_lapsed"],
            confidence: "medium",
          },
          {
            id: "sum_c_002",
            summary:
              "A signed physician order is present in extracted document evidence.",
            supportingEvidenceIds: ["ev_c_physician_order_present"],
            confidence: "high",
          },
        ],
      },
      candidate: {
        policyVersion: "policy_v2",
        promptVersion: "prompt_v2",
        ruleDecision: "REJECT",
        routingDecision: "needs_more_evidence",
        requiresHumanReview: false,
        reasonCodes: [
          "ELIGIBILITY_LAPSED",
          "PHYSICIAN_ORDER_PRESENT",
          "IDENTITY_VERIFIED",
          "AUTHORIZATION_REQUIRED",
        ],
        riskFlags: ["STALE_ELIGIBILITY_EVIDENCE"],
        llmSummary: [
          {
            id: "sum_c_001",
            summary:
              "Eligibility evidence indicates lapsed coverage at intake.",
            supportingEvidenceIds: ["ev_c_eligibility_lapsed"],
            confidence: "medium",
          },
          {
            id: "sum_c_002",
            summary: "Physician order present in extracted document evidence.",
            supportingEvidenceIds: ["ev_c_physician_order_present"],
            confidence: "high",
          },
        ],
      },
      diff: {
        ruleDecisionChanged: false,
        routingChanged: true,
        humanReviewRequirementChanged: true,
        riskFlagsChanged: false,
        potentialRegression: true,
        summary:
          "Policy v2 changed routing from human_review_required to needs_more_evidence because this reject decision depends on potentially stale eligibility evidence.",
      },
    },
  ],
};

export const replayRuns: ReplayRun[] = [run];
