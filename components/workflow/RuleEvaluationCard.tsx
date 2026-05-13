"use client";

import type { ReactNode } from "react";
import type {
  ConflictFlag,
  MissingField,
  ReasonCode,
  RuleEvaluation,
} from "@/types/referral";

type Props = {
  ruleEvaluation: RuleEvaluation;
  onSelectEvidence?: (ids: string[]) => void;
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

function Chip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs">
      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <span className="font-medium text-slate-700">{value}</span>
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

function BindingCue({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
      />
      evidence-bound
      <span className="rounded bg-amber-200 px-1 font-bold text-amber-800">
        {count}
      </span>
    </span>
  );
}

function SupportingEvidence({
  ids,
  onSelectEvidence,
}: {
  ids: string[];
  onSelectEvidence?: (ids: string[]) => void;
}) {
  if (ids.length === 0) return null;
  if (!onSelectEvidence) {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <BindingCue count={ids.length} />
        {ids.map((id, i) => (
          <span key={id}>
            <code>{id}</code>
            {i < ids.length - 1 ? ", " : ""}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
      <BindingCue count={ids.length} />
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelectEvidence(ids)}
          className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500"
        >
          {id}
        </button>
      ))}
    </div>
  );
}

function ReasonRow({
  item,
  onSelectEvidence,
}: {
  item: ReasonCode;
  onSelectEvidence?: (ids: string[]) => void;
}) {
  return (
    <li className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5 text-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Badge className={severityTone(item.severity)}>{item.severity}</Badge>
        <code className="text-xs text-slate-700">{item.code}</code>
        <span className="font-medium text-slate-900">{item.label}</span>
      </div>
      <p className="mt-1 text-xs leading-snug text-slate-600">
        {item.description}
      </p>
      <SupportingEvidence
        ids={item.supportingEvidenceIds}
        onSelectEvidence={onSelectEvidence}
      />
    </li>
  );
}

function MissingFieldRow({
  item,
  onSelectEvidence,
}: {
  item: MissingField;
  onSelectEvidence?: (ids: string[]) => void;
}) {
  return (
    <li className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5 text-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Badge className={severityTone(item.severity)}>{item.severity}</Badge>
        <code className="text-xs text-slate-700">{item.field}</code>
        <span className="font-medium text-slate-900">{item.label}</span>
        {item.reasonCode && (
          <span className="text-xs text-slate-500">
            reason code: <code>{item.reasonCode}</code>
          </span>
        )}
      </div>
      <SupportingEvidence
        ids={item.supportingEvidenceIds}
        onSelectEvidence={onSelectEvidence}
      />
    </li>
  );
}

function ConflictRow({
  item,
  onSelectEvidence,
}: {
  item: ConflictFlag;
  onSelectEvidence?: (ids: string[]) => void;
}) {
  return (
    <li className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5 text-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Badge className={severityTone(item.severity)}>{item.severity}</Badge>
        <code className="text-xs text-slate-700">{item.code}</code>
      </div>
      <p className="mt-1 text-xs leading-snug text-slate-600">
        {item.description}
      </p>
      <SupportingEvidence
        ids={item.supportingEvidenceIds}
        onSelectEvidence={onSelectEvidence}
      />
    </li>
  );
}

export default function RuleEvaluationCard({
  ruleEvaluation,
  onSelectEvidence,
}: Props) {
  const re = ruleEvaluation;
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Deterministic Rule Evaluation
      </h2>

      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Rule
        </span>
        <Badge className={decisionTone(re.decision)}>{re.decision}</Badge>
        <span aria-hidden="true" className="text-slate-300">
          →
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Routing
        </span>
        <Badge className={decisionTone(re.routingDecision)}>
          {re.routingDecision}
        </Badge>
      </div>

      <div className="mb-2.5">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Reason codes
        </h3>
        {re.reasonCodes.length === 0 ? (
          <p className="text-sm text-slate-500">None</p>
        ) : (
          <ul className="space-y-1.5">
            {re.reasonCodes.map((r) => (
              <ReasonRow
                key={r.code}
                item={r}
                onSelectEvidence={onSelectEvidence}
              />
            ))}
          </ul>
        )}
      </div>

      {re.missingFields.length > 0 && (
        <div className="mb-2.5">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Missing fields
          </h3>
          <ul className="space-y-1.5">
            {re.missingFields.map((m) => (
              <MissingFieldRow
                key={m.field}
                item={m}
                onSelectEvidence={onSelectEvidence}
              />
            ))}
          </ul>
        </div>
      )}

      {re.conflictFlags.length > 0 && (
        <div className="mb-2.5">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Conflict flags
          </h3>
          <ul className="space-y-1.5">
            {re.conflictFlags.map((cf) => (
              <ConflictRow
                key={cf.code}
                item={cf}
                onSelectEvidence={onSelectEvidence}
              />
            ))}
          </ul>
        </div>
      )}

      <div className="mb-2.5">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Routing reason codes
        </h3>
        {re.routingReasonCodes.length === 0 ? (
          <p className="text-sm text-slate-500">None</p>
        ) : (
          <ul className="space-y-1.5">
            {re.routingReasonCodes.map((r) => (
              <ReasonRow
                key={r.code}
                item={r}
                onSelectEvidence={onSelectEvidence}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
        <Chip
          label="rule set"
          value={<code className="font-mono">{re.ruleSetVersion}</code>}
        />
        <Chip
          label="policy"
          value={<code className="font-mono">{re.policyBundleVersion}</code>}
        />
        <Chip
          label="input hash"
          value={
            <code
              className="break-all font-mono text-[10px]"
              title={re.inputHash}
            >
              {re.inputHash}
            </code>
          }
        />
        <Chip
          label="output hash"
          value={
            <code
              className="break-all font-mono text-[10px]"
              title={re.outputHash}
            >
              {re.outputHash}
            </code>
          }
        />
      </div>
    </section>
  );
}
