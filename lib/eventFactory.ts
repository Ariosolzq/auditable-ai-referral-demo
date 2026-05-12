import type {
  AuditEvent,
  FinalDecisionValue,
  ReviewerAction,
  RuleDecision,
} from "@/types/referral";

export function nextEventId(auditEvents: AuditEvent[]): string {
  if (auditEvents.length === 0) return crypto.randomUUID();
  const last = auditEvents[auditEvents.length - 1].id;
  const match = last.match(/^(.*?)(\d+)$/);
  if (match) {
    const [, prefix, numStr] = match;
    const next = String(Number(numStr) + 1).padStart(numStr.length, "0");
    return `${prefix}${next}`;
  }
  return crypto.randomUUID();
}

export function nowIsoTimestamp(): string {
  return new Date().toISOString();
}

function contextFromEvents(auditEvents: AuditEvent[]): {
  correlationId: string;
  workflowInstanceId: string;
} {
  if (auditEvents.length === 0) {
    throw new Error("eventFactory: cannot derive context from empty auditEvents");
  }
  const last = auditEvents[auditEvents.length - 1];
  return {
    correlationId: last.correlationId,
    workflowInstanceId: last.workflowInstanceId,
  };
}

export function createHumanReviewSubmittedEvent(
  auditEvents: AuditEvent[],
  args: {
    causationEventId: string;
    submittedAt: string;
    reviewerAction: ReviewerAction;
    finalDecision: FinalDecisionValue;
    overrideFlag: boolean;
    reviewerNote?: string;
  },
): AuditEvent {
  const { correlationId, workflowInstanceId } = contextFromEvents(auditEvents);
  const payload: Record<string, unknown> = {
    reviewerAction: args.reviewerAction,
    finalDecision: args.finalDecision,
    overrideFlag: args.overrideFlag,
  };
  if (args.reviewerNote && args.reviewerNote.length > 0) {
    payload.reviewerNote = args.reviewerNote;
  }
  return {
    id: nextEventId(auditEvents),
    schemaVersion: "1.0",
    eventType: "HumanReviewSubmitted",
    actor: "reviewer",
    timestamp: args.submittedAt,
    correlationId,
    workflowInstanceId,
    causationEventId: args.causationEventId,
    payload,
  };
}

export function createHumanOverrideSubmittedEvent(
  auditEvents: AuditEvent[],
  args: {
    causationEventId: string;
    submittedAt: string;
    oldRuleDecision: RuleDecision;
    newFinalDecision: FinalDecisionValue;
    overrideReason: string;
    reviewerNote?: string;
  },
): AuditEvent {
  const { correlationId, workflowInstanceId } = contextFromEvents(auditEvents);
  const payload: Record<string, unknown> = {
    oldRuleDecision: args.oldRuleDecision,
    newFinalDecision: args.newFinalDecision,
    overrideReason: args.overrideReason,
  };
  if (args.reviewerNote && args.reviewerNote.length > 0) {
    payload.reviewerNote = args.reviewerNote;
  }
  return {
    id: nextEventId(auditEvents),
    schemaVersion: "1.0",
    eventType: "HumanOverrideSubmitted",
    actor: "reviewer",
    timestamp: args.submittedAt,
    correlationId,
    workflowInstanceId,
    causationEventId: args.causationEventId,
    payload,
  };
}

export function createFinalDecisionRecordedEvent(
  auditEvents: AuditEvent[],
  args: {
    causationEventId: string;
    submittedAt: string;
    finalDecision: FinalDecisionValue;
    overrideFlag: boolean;
    source: "human_review" | "auto_finalization";
  },
): AuditEvent {
  const { correlationId, workflowInstanceId } = contextFromEvents(auditEvents);
  return {
    id: nextEventId(auditEvents),
    schemaVersion: "1.0",
    eventType: "FinalDecisionRecorded",
    actor: "workflow-engine",
    timestamp: args.submittedAt,
    correlationId,
    workflowInstanceId,
    causationEventId: args.causationEventId,
    payload: {
      finalDecision: args.finalDecision,
      decidedBy: "reviewer",
      overrideFlag: args.overrideFlag,
      source: args.source,
    },
  };
}
