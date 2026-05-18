"use client";

import type { AuditEvent } from "@/types/referral";

type Props = {
  auditEvents: AuditEvent[];
  selectedAuditEventId?: string | null;
  onSelectAuditEvent?: (eventId: string) => void;
};

function eventSubtitle(eventType: string): string {
  switch (eventType) {
    case "ReferralCreated":
      return "intake";
    case "WorkflowStarted":
      return "workflow start";
    case "FieldsNormalized":
      return "normalization";
    case "EvidencePackageBuilt":
      return "evidence assembly";
    case "RuleDecisionGenerated":
      return "rule decision";
    case "LLMReviewRequested":
      return "advisory requested";
    case "LLMReviewCompleted":
      return "advisory output";
    case "LLMReviewSkipped":
      return "advisory skipped";
    case "HumanReviewRequested":
      return "review requested";
    case "HumanReviewSubmitted":
      return "review submitted";
    case "HumanOverrideSubmitted":
      return "override submitted";
    case "FinalDecisionRecorded":
      return "final decision";
    default:
      return "workflow transition";
  }
}

export default function AuditTimeline({
  auditEvents,
  selectedAuditEventId,
  onSelectAuditEvent,
}: Props) {
  if (auditEvents.length === 0) {
    return (
      <div className="p-4">
        <p className="font-mono text-[11px] text-slate-500">
          No audit events recorded yet.
        </p>
      </div>
    );
  }
  return (
    <ol
      aria-label="Audit timeline"
      className="relative p-3"
    >
      {/* Continuous vertical rail behind the dots */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[19px] top-[26px] bottom-[26px] w-px bg-slate-200"
      />
      {auditEvents.map((e) => {
        const isSelected = e.id === selectedAuditEventId;
        const rowClass = isSelected
          ? "bg-amber-50/60"
          : "hover:bg-slate-50/80";
        const dotClass = isSelected
          ? "border-amber-500 bg-amber-500 ring-2 ring-amber-100"
          : "border-slate-300 bg-white";
        const typeClass = isSelected
          ? "text-amber-900"
          : "text-slate-900";
        return (
          <li key={e.id} className="relative">
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={
                onSelectAuditEvent
                  ? () => onSelectAuditEvent(e.id)
                  : undefined
              }
              className={`relative block w-full rounded-md py-2 pl-9 pr-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500 ${rowClass}`}
            >
              <span
                aria-hidden="true"
                className={`absolute left-[12px] top-3 inline-block h-3 w-3 rounded-full border-2 ${dotClass}`}
              />
              <span className="block font-mono text-[10px] text-slate-500">
                {e.timestamp}
              </span>
              <span
                className={`mt-0.5 block text-sm font-semibold leading-tight ${typeClass}`}
              >
                {e.eventType}
              </span>
              <span className="mt-0.5 block font-mono text-[10px] text-slate-500">
                {e.actor} &middot; {eventSubtitle(e.eventType)}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
