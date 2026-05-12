import type { ReactNode } from "react";
import type { AuditEvent } from "@/types/referral";

type Props = {
  auditEvents: AuditEvent[];
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

export default function AuditTimeline({ auditEvents }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Audit Timeline
      </h2>
      <ol className="space-y-2">
        {auditEvents.map((e) => (
          <li
            key={e.id}
            className="rounded-md border border-slate-100 bg-slate-50/50 p-3 text-sm"
          >
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-slate-900">{e.eventType}</span>
              <Badge className="border-slate-200 bg-slate-100 text-slate-700">
                {e.actor}
              </Badge>
            </div>
            <div className="text-xs text-slate-500">{e.timestamp}</div>
            <div className="text-xs text-slate-500">
              id: <code>{e.id}</code>
            </div>
            <div className="text-xs text-slate-500">
              schema: <code>{e.schemaVersion}</code>
            </div>
            {e.causationEventId && (
              <div className="text-xs text-slate-500">
                caused by: <code>{e.causationEventId}</code>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
