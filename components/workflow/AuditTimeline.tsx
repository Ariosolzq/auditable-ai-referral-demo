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
      <ol className="space-y-2">
        {auditEvents.map((e) => {
          const isSelected = e.id === selectedAuditEventId;
          const tone = isSelected
            ? "border-amber-300 border-l-4 border-l-amber-500 bg-amber-50 ring-1 ring-amber-200 shadow-sm"
            : "border-slate-100 border-l-4 border-l-transparent bg-slate-50/50 hover:border-slate-200 hover:bg-slate-100/60";
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
                className={`block w-full rounded-md border p-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${tone}`}
              >
                <span className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">
                    {e.eventType}
                  </span>
                  <Badge className="border-slate-200 bg-white text-slate-700">
                    {e.actor}
                  </Badge>
                </span>
                <span className="block text-xs text-slate-500">
                  {e.timestamp}
                </span>
                <span className="block text-xs text-slate-500">
                  id: <code>{e.id}</code>
                </span>
                <span className="block text-xs text-slate-500">
                  schema: <code>{e.schemaVersion}</code>
                </span>
                {e.causationEventId && (
                  <span className="block text-xs text-slate-500">
                    caused by: <code>{e.causationEventId}</code>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
