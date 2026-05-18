import type { ReactNode } from "react";
import type { AuditEvent } from "@/types/referral";

type Props = {
  auditEvents: AuditEvent[];
  selectedAuditEventId?: string | null;
};

function MetaChip({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  accent?: boolean;
}) {
  const valueClass = accent
    ? "font-mono text-[11px] font-semibold text-sky-800"
    : "font-mono text-[11px] text-slate-800";
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2 py-0.5">
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </span>
      <span className={valueClass}>{value}</span>
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
  const total = auditEvents.length;
  const selected = selectedAuditEventId
    ? auditEvents.find((e) => e.id === selectedAuditEventId)
    : undefined;
  const event = selected ?? auditEvents[0];

  if (!event) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-5">
        <p className="max-w-[36ch] text-center text-sm leading-snug text-slate-500">
          Select an audit event from the timeline to inspect its payload and
          causation.
        </p>
      </div>
    );
  }

  const indexNum = auditEvents.findIndex((e) => e.id === event.id) + 1;

  return (
    <div className="space-y-3 p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="flex items-baseline gap-2 text-base font-semibold tracking-tight text-slate-900">
          <span>{event.eventType}</span>
          <span className="font-mono text-[11px] font-normal text-slate-400">
            &middot; event {indexNum} of {total}
          </span>
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
          />
          read-only
        </span>
      </header>

      <p className="rounded-md border border-sky-200 bg-sky-50/60 px-3.5 py-2.5 text-sm leading-snug text-sky-900">
        <span className="font-semibold">Meaning &mdash;</span>{" "}
        {describeAuditEvent(event)}
      </p>

      <p className="font-mono text-[11px] leading-snug text-slate-600">
        {event.causationEventId ? (
          <>
            caused by{" "}
            <span className="font-semibold text-slate-800">
              {event.causationEventId}
            </span>{" "}
            <span aria-hidden="true" className="text-slate-300">
              &rarr;
            </span>{" "}
            this event{" "}
            <span className="font-semibold text-sky-800">{event.id}</span>
          </>
        ) : (
          <>
            <span className="font-semibold uppercase tracking-[0.1em] text-slate-500">
              root event
            </span>{" "}
            &middot; this event{" "}
            <span className="font-semibold text-sky-800">{event.id}</span>
          </>
        )}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <MetaChip label="actor" value={event.actor} />
        <MetaChip
          label="timestamp"
          value={<code>{event.timestamp}</code>}
        />
        <MetaChip
          label="correlation"
          value={<code>{event.correlationId}</code>}
        />
        {event.causationEventId && (
          <MetaChip
            label="caused by"
            value={<code>{event.causationEventId}</code>}
            accent
          />
        )}
        <MetaChip
          label="workflow"
          value={<code>{event.workflowInstanceId}</code>}
        />
        <MetaChip label="schema" value={event.schemaVersion} />
      </div>

      <details
        open
        className="overflow-hidden rounded-md border border-slate-200"
      >
        <summary className="flex cursor-pointer items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/70 px-3.5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 hover:bg-slate-100/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500">
          <span>Supporting detail &middot; raw payload</span>
          <span className="font-normal text-slate-400">
            JSON &middot; read-only
          </span>
        </summary>
        <pre className="max-h-[420px] overflow-auto bg-slate-900 px-4 py-3 font-mono text-[11px] leading-relaxed text-slate-200">
          {JSON.stringify(event.payload, null, 2)}
        </pre>
      </details>
    </div>
  );
}
