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

export default function AuditEventPayloadPanel({
  auditEvents,
  selectedAuditEventId,
}: Props) {
  const selected = selectedAuditEventId
    ? auditEvents.find((e) => e.id === selectedAuditEventId)
    : undefined;
  const event = selected ?? auditEvents[0];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Payload Preview
      </h2>
      {event ? (
        <div className="space-y-3 text-sm">
          <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip label="event" value={event.eventType} />
              <Chip label="actor" value={event.actor} />
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
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-600">
              <span>
                id:{" "}
                <code className="font-mono text-slate-700">{event.id}</code>
              </span>
              <span>{event.timestamp}</span>
              <span>
                corr:{" "}
                <code className="font-mono text-slate-700">
                  {event.correlationId}
                </code>
              </span>
              <span>
                wf:{" "}
                <code className="font-mono text-slate-700">
                  {event.workflowInstanceId}
                </code>
              </span>
              <span>
                schema:{" "}
                <code className="font-mono text-slate-700">
                  {event.schemaVersion}
                </code>
              </span>
            </div>
          </div>
          <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Select an audit event to view its payload.
        </p>
      )}
      <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Click an audit event to inspect its payload.
      </p>
    </section>
  );
}
