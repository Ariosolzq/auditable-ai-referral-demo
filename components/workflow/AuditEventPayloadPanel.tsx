import type { ReactNode } from "react";
import type { AuditEvent } from "@/types/referral";

type Props = {
  auditEvents: AuditEvent[];
  selectedAuditEventId?: string | null;
};

function Chip({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-amber-200 bg-white px-2 py-0.5 text-xs">
      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-700">
        {label}
      </span>
      <span className="font-medium text-slate-800">{value}</span>
    </span>
  );
}

function describeAuditEvent(event: AuditEvent): string {
  const p = (event.payload ?? {}) as Record<string, unknown>;

  switch (event.eventType) {
    case "ReferralCreated":
      return "This event records the intake of the referral into the workflow.";
    case "WorkflowStarted":
      return "This event records the workflow instance starting for this referral.";
    case "FieldsNormalized":
      return "This event records the normalized referral fields used by downstream rule and advisory steps.";
    case "EvidencePackageBuilt":
      return "This event records the evidence package assembled for rule evaluation and advisory review.";
    case "RuleDecisionGenerated": {
      const decision =
        typeof p.decision === "string" ? p.decision : null;
      const routing =
        typeof p.routingDecision === "string" ? p.routingDecision : null;
      const policy =
        typeof p.policyBundleVersion === "string"
          ? p.policyBundleVersion
          : null;
      if (decision && routing && policy) {
        return `This event records the deterministic rule output: ${decision}, routed to ${routing} under ${policy}.`;
      }
      if (decision && routing) {
        return `This event records the deterministic rule output: ${decision}, routed to ${routing}.`;
      }
      return "This event records the deterministic rule output.";
    }
    case "LLMReviewRequested":
      return "This event records that an advisory LLM review was requested. It does not set the final decision.";
    case "LLMReviewCompleted":
      return "This event records the advisory LLM output. It is evidence-bound and does not set the final decision.";
    case "LLMReviewSkipped":
      return "This event records that LLM advisory review was skipped for this case.";
    case "HumanReviewRequested":
      return "This event records that the case was routed to human review before finalization.";
    case "HumanReviewSubmitted":
      return "This event records the reviewer's submitted action.";
    case "HumanOverrideSubmitted":
      return "This event records a human override. The override is reviewer-controlled and audit-recorded.";
    case "FinalDecisionRecorded": {
      const finalDecision =
        typeof p.finalDecision === "string"
          ? p.finalDecision
          : typeof p.decision === "string"
            ? p.decision
            : null;
      if (finalDecision) {
        return `This event records the final decision: ${finalDecision}.`;
      }
      return "This event records the final decision for this case.";
    }
    default:
      return "This event records a workflow transition and its payload.";
  }
}

export default function AuditEventPayloadPanel({
  auditEvents,
  selectedAuditEventId,
}: Props) {
  const selected = selectedAuditEventId
    ? auditEvents.find((e) => e.id === selectedAuditEventId)
    : undefined;
  const event = selected ?? auditEvents[0];

  return (
    <div className="p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Selected event payload
        </h3>
        <span className="text-[10px] italic uppercase tracking-[0.14em] text-slate-500">
          read-only
        </span>
      </div>
      {event ? (
        <div className="space-y-3 text-sm">
          <div className="rounded-md border border-slate-200 bg-slate-50/60 p-3">
            <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              What this event means
            </h4>
            <p className="text-sm leading-snug text-slate-800">
              {describeAuditEvent(event)}
            </p>
          </div>
          <div className="rounded-md border border-amber-300 border-l-4 border-l-amber-500 bg-amber-50/60 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip label="event" value={event.eventType} />
              <Chip label="actor" value={event.actor} />
              <Chip
                label="timestamp"
                value={
                  <code className="font-mono text-[11px]">
                    {event.timestamp}
                  </code>
                }
              />
              <Chip
                label="correlation"
                value={
                  <code className="font-mono text-[11px]">
                    {event.correlationId}
                  </code>
                }
              />
              {event.causationEventId && (
                <Chip
                  label="caused by"
                  value={
                    <code className="font-mono text-[11px]">
                      {event.causationEventId}
                    </code>
                  }
                />
              )}
              <Chip
                label="workflow"
                value={
                  <code className="font-mono text-[11px]">
                    {event.workflowInstanceId}
                  </code>
                }
              />
              <Chip label="schema" value={event.schemaVersion} />
            </div>
            <div className="mt-2 text-[11px] text-slate-600">
              id:{" "}
              <code className="font-mono text-slate-700">{event.id}</code>
            </div>
          </div>
          <div>
            <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Supporting detail · raw payload
            </h4>
            <pre className="max-h-[420px] overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Select an audit event to view its payload.
        </p>
      )}
    </div>
  );
}
