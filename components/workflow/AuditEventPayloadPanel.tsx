import type { AuditEvent } from "@/types/referral";

type Props = {
  auditEvents: AuditEvent[];
  selectedAuditEventId?: string | null;
};

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
        <div className="space-y-2 text-sm">
          <div className="space-y-1 text-xs text-slate-500">
            <div>
              Event ID: <code>{event.id}</code>
            </div>
            <div>
              Event type:{" "}
              <span className="text-slate-700">{event.eventType}</span>
            </div>
            <div>
              Actor: <span className="text-slate-700">{event.actor}</span>
            </div>
            <div>
              Timestamp:{" "}
              <span className="text-slate-700">{event.timestamp}</span>
            </div>
            <div>
              Correlation ID: <code>{event.correlationId}</code>
            </div>
            <div>
              Workflow instance: <code>{event.workflowInstanceId}</code>
            </div>
            <div>
              Schema version: <code>{event.schemaVersion}</code>
            </div>
            {event.causationEventId && (
              <div>
                Causation event: <code>{event.causationEventId}</code>
              </div>
            )}
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
