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
  selectedEvidenceIds?: string[];
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

function rowClass(related: boolean): string {
  return related
    ? "rounded-md border border-amber-200 border-l-2 border-l-amber-400 bg-amber-50/50 p-2.5 text-sm"
    : "rounded-md border border-slate-100 border-l-2 border-l-slate-200 bg-slate-50/50 p-2.5 text-sm";
}

function CiteList({
  ids,
  onSelectEvidence,
}: {
  ids: string[];
  onSelectEvidence?: (ids: string[]) => void;
}) {
  if (ids.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-amber-700">
        cites
      </span>
      {ids.map((id) =>
        onSelectEvidence ? (
          <button
            key={id}
            type="button"
            onClick={() => onSelectEvidence(ids)}
            className="inline-flex items-center rounded border border-amber-200 bg-amber-50/70 px-1.5 py-0.5 font-mono text-[11px] text-amber-900 hover:border-amber-300 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500"
          >
            {id}
          </button>
        ) : (
          <code
            key={id}
            className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-700"
          >
            {id}
          </code>
        ),
      )}
    </div>
  );
}

function ReasonRow({
  item,
  onSelectEvidence,
  related,
}: {
  item: ReasonCode;
  onSelectEvidence?: (ids: string[]) => void;
  related: boolean;
}) {
  return (
    <li className={rowClass(related)}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Badge className={severityTone(item.severity)}>{item.severity}</Badge>
        <code className="font-mono text-xs text-slate-700">{item.code}</code>
        <span className="font-medium text-slate-900">{item.label}</span>
      </div>
      <p className="mt-1 text-xs leading-snug text-slate-600">
        {item.description}
      </p>
      <CiteList
        ids={item.supportingEvidenceIds}
        onSelectEvidence={onSelectEvidence}
      />
    </li>
  );
}

function MissingFieldRow({
  item,
  onSelectEvidence,
  related,
}: {
  item: MissingField;
  onSelectEvidence?: (ids: string[]) => void;
  related: boolean;
}) {
  return (
    <li className={rowClass(related)}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Badge className={severityTone(item.severity)}>{item.severity}</Badge>
        <code className="font-mono text-xs text-slate-700">{item.field}</code>
        <span className="font-medium text-slate-900">{item.label}</span>
        {item.reasonCode && (
          <span className="text-xs text-slate-500">
            reason code: <code className="font-mono">{item.reasonCode}</code>
          </span>
        )}
      </div>
      <CiteList
        ids={item.supportingEvidenceIds}
        onSelectEvidence={onSelectEvidence}
      />
    </li>
  );
}

function ConflictRow({
  item,
  onSelectEvidence,
  related,
}: {
  item: ConflictFlag;
  onSelectEvidence?: (ids: string[]) => void;
  related: boolean;
}) {
  return (
    <li className={rowClass(related)}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Badge className={severityTone(item.severity)}>{item.severity}</Badge>
        <code className="font-mono text-xs text-slate-700">{item.code}</code>
      </div>
      <p className="mt-1 text-xs leading-snug text-slate-600">
        {item.description}
      </p>
      <CiteList
        ids={item.supportingEvidenceIds}
        onSelectEvidence={onSelectEvidence}
      />
    </li>
  );
}

function countRelated(
  rows: Array<{ supportingEvidenceIds: string[] }>,
  selected: Set<string>,
): number {
  if (selected.size === 0) return 0;
  return rows.filter((r) =>
    r.supportingEvidenceIds.some((id) => selected.has(id)),
  ).length;
}

export default function RuleEvaluationCard({
  ruleEvaluation,
  onSelectEvidence,
  selectedEvidenceIds,
}: Props) {
  const re = ruleEvaluation;
  const selectedSet = new Set(selectedEvidenceIds ?? []);
  const isRelated = (ids: string[]): boolean =>
    selectedSet.size > 0 && ids.some((id) => selectedSet.has(id));
  const citeCount =
    countRelated(re.reasonCodes, selectedSet) +
    countRelated(re.missingFields, selectedSet) +
    countRelated(re.conflictFlags, selectedSet) +
    countRelated(re.routingReasonCodes, selectedSet);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-baseline gap-2">
          <span
            aria-hidden="true"
            className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amber-500 font-mono text-[10px] font-bold text-white"
          >
            02
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
            Decision &middot; Deterministic rule
          </span>
        </h2>
        {citeCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-800">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
            />
            {citeCount} cite selection
          </span>
        )}
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Rule
        </span>
        <Badge className={decisionTone(re.decision)}>{re.decision}</Badge>
        <span aria-hidden="true" className="text-slate-300">
          &rarr;
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Routing
        </span>
        <Badge className={decisionTone(re.routingDecision)}>
          {re.routingDecision}
        </Badge>
      </div>

      <div className="mb-2.5">
        <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
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
                related={isRelated(r.supportingEvidenceIds)}
              />
            ))}
          </ul>
        )}
      </div>

      {re.missingFields.length > 0 && (
        <div className="mb-2.5">
          <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Missing fields
          </h3>
          <ul className="space-y-1.5">
            {re.missingFields.map((m) => (
              <MissingFieldRow
                key={m.field}
                item={m}
                onSelectEvidence={onSelectEvidence}
                related={isRelated(m.supportingEvidenceIds)}
              />
            ))}
          </ul>
        </div>
      )}

      {re.conflictFlags.length > 0 && (
        <div className="mb-2.5">
          <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Conflict flags
          </h3>
          <ul className="space-y-1.5">
            {re.conflictFlags.map((cf) => (
              <ConflictRow
                key={cf.code}
                item={cf}
                onSelectEvidence={onSelectEvidence}
                related={isRelated(cf.supportingEvidenceIds)}
              />
            ))}
          </ul>
        </div>
      )}

      <div className="mb-2.5">
        <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
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
                related={isRelated(r.supportingEvidenceIds)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 font-mono text-[10px] text-slate-500">
        <span>
          <span className="font-semibold text-slate-600">rule set</span>{" "}
          {re.ruleSetVersion}
        </span>
        <span className="text-slate-300">&middot;</span>
        <span>
          <span className="font-semibold text-slate-600">policy</span>{" "}
          {re.policyBundleVersion}
        </span>
        <span className="text-slate-300">&middot;</span>
        <span title={re.inputHash} className="truncate">
          <span className="font-semibold text-slate-600">in</span>{" "}
          {re.inputHash}
        </span>
        <span className="text-slate-300">&middot;</span>
        <span title={re.outputHash} className="truncate">
          <span className="font-semibold text-slate-600">out</span>{" "}
          {re.outputHash}
        </span>
      </div>
    </section>
  );
}
