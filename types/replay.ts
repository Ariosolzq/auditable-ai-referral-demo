// Source of truth: .claude/PROJECT_SPEC.md §6.2. Do not weaken without updating the spec.

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
