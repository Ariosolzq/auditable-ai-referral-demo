"use client";

import type { ReactNode } from "react";
import type { AuditEvent } from "@/types/referral";

type Props = {
  auditEvents: AuditEvent[];
  selectedAuditEventId?: string | null;
  onSelectAuditEvent?: (eventId: string) => void;
};

function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

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
  const eventCount = auditEvents.length;
  return (
    <div className="p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Audit Timeline
        </h3>
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
          {eventCount} event{eventCount === 1 ? "" : "s"}
        </span>
      </div>
      <ol className="space-y-1.5">
        {auditEvents.map((e, idx) => {
          const isSelected = e.id === selectedAuditEventId;
          const step = idx + 1;
          const rowTone = isSelected
            ? "border-amber-300 border-l-4 border-l-amber-500 bg-amber-50 ring-1 ring-amber-200 shadow-sm"
            : "border-slate-100 border-l-4 border-l-transparent bg-slate-50/50 hover:border-slate-200 hover:bg-slate-100/60";
          const markerTone = isSelected
            ? "bg-amber-500 text-white ring-2 ring-amber-200"
            : "bg-slate-200 text-slate-600";
          return (
            <li key={e.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={
                  onSelectAuditEvent
                    ? () => onSelectAuditEvent(e.id)
                    : undefined
                }
                className={`block w-full rounded-md border p-2.5 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${rowTone}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums ${markerTone}`}
                  >
                    {step}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900">
                          {e.eventType}
                        </div>
                        <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                          {eventSubtitle(e.eventType)}
                        </div>
                      </div>
                      <Badge className="border-slate-200 bg-white text-slate-700">
                        {e.actor}
                      </Badge>
                    </div>
                    {isSelected && (
                      <div className="mt-2 space-y-0.5 border-t border-amber-200 pt-2 text-xs text-slate-600">
                        <div>{e.timestamp}</div>
                        <div>
                          id:{" "}
                          <code className="font-mono text-slate-700">
                            {e.id}
                          </code>
                        </div>
                        <div>
                          schema:{" "}
                          <code className="font-mono text-slate-700">
                            {e.schemaVersion}
                          </code>
                        </div>
                        {e.causationEventId && (
                          <div>
                            caused by:{" "}
                            <code className="font-mono text-slate-700">
                              {e.causationEventId}
                            </code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
