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
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Audit Timeline
      </h2>
      <ol className="space-y-2">
        {auditEvents.map((e) => {
          const isSelected = e.id === selectedAuditEventId;
          const tone = isSelected
            ? "border-sky-300 bg-sky-50 ring-1 ring-sky-200"
            : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-100/60";
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
                className={`block w-full rounded-md border p-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${tone}`}
              >
                <span className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">
                    {e.eventType}
                  </span>
                  <Badge className="border-slate-200 bg-slate-100 text-slate-700">
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
    </section>
  );
}
