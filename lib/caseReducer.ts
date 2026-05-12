import {
  createFinalDecisionRecordedEvent,
  createHumanOverrideSubmittedEvent,
  createHumanReviewSubmittedEvent,
  nowIsoTimestamp,
} from "@/lib/eventFactory";
import { finalDecisionToStatus } from "@/lib/statusMapping";
import type {
  AuditEvent,
  FinalDecision,
  FinalDecisionValue,
  HumanReview,
  ReferralCase,
  ReviewerAction,
} from "@/types/referral";

export type CaseDetailState = {
  caseData: ReferralCase;
  selectedEvidenceIds: string[];
  selectedAuditEventId: string | null;
};

export type CaseDetailAction =
  | { type: "SELECT_EVIDENCE"; evidenceIds: string[] }
  | { type: "SELECT_AUDIT_EVENT"; eventId: string }
  | { type: "CLEAR_EVIDENCE_SELECTION" }
  | { type: "RESET_CASE"; initialCase: ReferralCase }
  | {
      type: "SUBMIT_REVIEW";
      reviewerAction: ReviewerAction;
      finalDecision: FinalDecisionValue;
      reviewerNote: string;
      overrideReason?: string;
    };

export function cloneCase(c: ReferralCase): ReferralCase {
  return structuredClone(c);
}

export function buildInitialState(caseData: ReferralCase): CaseDetailState {
  const initialCase = cloneCase(caseData);
  return {
    caseData: initialCase,
    selectedEvidenceIds: [],
    selectedAuditEventId: initialCase.auditEvents[0]?.id ?? null,
  };
}

function findLastHumanReviewRequested(
  auditEvents: AuditEvent[],
): AuditEvent | undefined {
  for (let i = auditEvents.length - 1; i >= 0; i--) {
    if (auditEvents[i].eventType === "HumanReviewRequested") {
      return auditEvents[i];
    }
  }
  return undefined;
}

export function caseReducer(
  state: CaseDetailState,
  action: CaseDetailAction,
): CaseDetailState {
  switch (action.type) {
    case "SELECT_EVIDENCE":
      return { ...state, selectedEvidenceIds: action.evidenceIds };

    case "CLEAR_EVIDENCE_SELECTION":
      return { ...state, selectedEvidenceIds: [] };

    case "SELECT_AUDIT_EVENT":
      return { ...state, selectedAuditEventId: action.eventId };

    case "RESET_CASE":
      return {
        caseData: cloneCase(action.initialCase),
        selectedEvidenceIds: [],
        selectedAuditEventId: action.initialCase.auditEvents[0]?.id ?? null,
      };

    case "SUBMIT_REVIEW": {
      const { caseData } = state;
      const review = caseData.humanReview;
      const { reviewerAction, finalDecision } = action;
      const reviewerNote = action.reviewerNote.trim();
      const trimmedOverrideReason = action.overrideReason?.trim() ?? "";

      // No-op guards (spec §9.3)
      if (review.status === "not_required") return state;
      if (review.status === "submitted") return state;
      if (
        reviewerAction === "override" &&
        trimmedOverrideReason.length === 0
      ) {
        return state;
      }

      const humanReviewRequested = findLastHumanReviewRequested(
        caseData.auditEvents,
      );
      if (!humanReviewRequested) return state;

      const submittedAt = nowIsoTimestamp();
      const overrideFlag = reviewerAction === "override";

      const hrSubmitted = createHumanReviewSubmittedEvent(
        caseData.auditEvents,
        {
          causationEventId: humanReviewRequested.id,
          submittedAt,
          reviewerAction,
          finalDecision,
          overrideFlag,
          reviewerNote: reviewerNote.length > 0 ? reviewerNote : undefined,
        },
      );

      let auditEvents = [...caseData.auditEvents, hrSubmitted];
      let finalCausationId = hrSubmitted.id;

      if (overrideFlag) {
        const hrOverride = createHumanOverrideSubmittedEvent(auditEvents, {
          causationEventId: hrSubmitted.id,
          submittedAt,
          oldRuleDecision: caseData.ruleEvaluation.decision,
          newFinalDecision: finalDecision,
          overrideReason: trimmedOverrideReason,
          reviewerNote: reviewerNote.length > 0 ? reviewerNote : undefined,
        });
        auditEvents = [...auditEvents, hrOverride];
        finalCausationId = hrOverride.id;
      }

      const finalRecorded = createFinalDecisionRecordedEvent(auditEvents, {
        causationEventId: finalCausationId,
        submittedAt,
        finalDecision,
        overrideFlag,
        source: "human_review",
      });
      auditEvents = [...auditEvents, finalRecorded];

      const newHumanReview: HumanReview = {
        status: "submitted",
        reviewType: review.reviewType,
        startedAt: review.startedAt,
        submittedAt,
        reviewerAction,
        finalDecision,
        overrideFlag,
        overrideReason: overrideFlag ? trimmedOverrideReason : undefined,
        reviewerNote,
      };

      const newFinalDecision: FinalDecision = {
        decision: finalDecision,
        decidedBy: "reviewer",
        decidedAt: submittedAt,
        overrideFlag,
      };

      return {
        ...state,
        caseData: {
          ...caseData,
          currentStatus: finalDecisionToStatus(finalDecision),
          currentStage: "completed",
          humanReview: newHumanReview,
          finalDecision: newFinalDecision,
          auditEvents,
        },
      };
    }

    default:
      return state;
  }
}
