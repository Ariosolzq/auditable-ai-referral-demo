import type { ReactNode } from "react";
import type {
  ConflictFlag,
  MissingField,
  ReasonCode,
  RuleEvaluation,
} from "@/types/referral";

type Props = {
  ruleEvaluation: RuleEvaluation;
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

function decisionTone(v: string): string {
  if (v === "ACCEPT" || v === "auto_accept")
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (v === "REJECT" || v === "auto_reject" || v === "failed")
    return "bg-rose-50 text-rose-800 border-rose-200";
  if (
    v === "NEEDS_REVIEW" ||
    v === "UNCERTAIN" ||
    v === "human_review_required" ||
    v === "needs_more_evidence"
  ) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function severityTone(s: string): string {
  if (s === "blocking" || s === "high")
    return "bg-rose-50 text-rose-800 border-rose-200";
  if (s === "medium") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function SupportingEvidence({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <div className="mt-1 text-xs text-slate-500">
      Supporting evidence:{" "}
      {ids.map((id, i) => (
        <span key={id}>
          <code>{id}</code>
          {i < ids.length - 1 ? ", " : ""}
        </span>
      ))}
    </div>
  );
}

function ReasonRow({ item }: { item: ReasonCode }) {
  return (
    <li className="rounded-md border border-slate-100 bg-slate-50/50 p-3 text-sm">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <code className="text-xs text-slate-700">{item.code}</code>
        <Badge className={severityTone(item.severity)}>{item.severity}</Badge>
      </div>
      <div className="font-medium text-slate-900">{item.label}</div>
      <p className="text-slate-700">{item.description}</p>
      <SupportingEvidence ids={item.supportingEvidenceIds} />
    </li>
  );
}

function MissingFieldRow({ item }: { item: MissingField }) {
  return (
    <li className="rounded-md border border-slate-100 bg-slate-50/50 p-3 text-sm">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <code className="text-xs text-slate-700">{item.field}</code>
        <Badge className={severityTone(item.severity)}>{item.severity}</Badge>
      </div>
      <div className="font-medium text-slate-900">{item.label}</div>
      {item.reasonCode && (
        <div className="text-xs text-slate-500">
          reason code: <code>{item.reasonCode}</code>
        </div>
      )}
      <SupportingEvidence ids={item.supportingEvidenceIds} />
    </li>
  );
}

function ConflictRow({ item }: { item: ConflictFlag }) {
  return (
    <li className="rounded-md border border-slate-100 bg-slate-50/50 p-3 text-sm">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <code className="text-xs text-slate-700">{item.code}</code>
        <Badge className={severityTone(item.severity)}>{item.severity}</Badge>
      </div>
      <p className="text-slate-700">{item.description}</p>
      <SupportingEvidence ids={item.supportingEvidenceIds} />
    </li>
  );
}

export default function RuleEvaluationCard({ ruleEvaluation }: Props) {
  const re = ruleEvaluation;
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Deterministic Rule Evaluation
      </h2>

      <div className="mb-3 space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Rule decision</span>
          <Badge className={decisionTone(re.decision)}>{re.decision}</Badge>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Routing decision</span>
          <Badge className={decisionTone(re.routingDecision)}>
            {re.routingDecision}
          </Badge>
        </div>
      </div>

      <div className="mb-3">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Reason codes
        </h3>
        {re.reasonCodes.length === 0 ? (
          <p className="text-sm text-slate-500">None</p>
        ) : (
          <ul className="space-y-2">
            {re.reasonCodes.map((r) => (
              <ReasonRow key={r.code} item={r} />
            ))}
          </ul>
        )}
      </div>

      {re.missingFields.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Missing fields
          </h3>
          <ul className="space-y-2">
            {re.missingFields.map((m) => (
              <MissingFieldRow key={m.field} item={m} />
            ))}
          </ul>
        </div>
      )}

      {re.conflictFlags.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Conflict flags
          </h3>
          <ul className="space-y-2">
            {re.conflictFlags.map((cf) => (
              <ConflictRow key={cf.code} item={cf} />
            ))}
          </ul>
        </div>
      )}

      <div className="mb-3">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Routing reason codes
        </h3>
        {re.routingReasonCodes.length === 0 ? (
          <p className="text-sm text-slate-500">None</p>
        ) : (
          <ul className="space-y-2">
            {re.routingReasonCodes.map((r) => (
              <ReasonRow key={r.code} item={r} />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div>
          Rule set version: <code>{re.ruleSetVersion}</code>
        </div>
        <div>
          Policy bundle version: <code>{re.policyBundleVersion}</code>
        </div>
        <div>
          Input hash: <code className="break-all">{re.inputHash}</code>
        </div>
        <div>
          Output hash: <code className="break-all">{re.outputHash}</code>
        </div>
      </div>
    </section>
  );
}
