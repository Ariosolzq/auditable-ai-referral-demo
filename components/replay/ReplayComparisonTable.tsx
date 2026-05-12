"use client";

import type { ReactNode } from "react";
import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparisons: ReplayCaseComparison[];
  selectedIdx: number;
  onSelectRow: (idx: number) => void;
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

function regressionTone(flag: boolean): string {
  return flag
    ? "bg-rose-50 text-rose-800 border-rose-200"
    : "bg-slate-100 text-slate-700 border-slate-200";
}

function ChangedPair({
  before,
  after,
  changed,
}: {
  before: string;
  after: string;
  changed: boolean;
}) {
  if (!changed) return <Badge className={decisionTone(before)}>{before}</Badge>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <Badge className={decisionTone(before)}>{before}</Badge>
      <span className="text-slate-400">→</span>
      <Badge className={decisionTone(after)}>{after}</Badge>
    </span>
  );
}

function BoolPair({
  before,
  after,
  changed,
}: {
  before: boolean;
  after: boolean;
  changed: boolean;
}) {
  const bs = before ? "true" : "false";
  const as = after ? "true" : "false";
  if (!changed)
    return (
      <Badge className="border-slate-200 bg-slate-100 text-slate-700">
        {bs}
      </Badge>
    );
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <Badge className="border-slate-200 bg-slate-100 text-slate-700">
        {bs}
      </Badge>
      <span className="text-slate-400">→</span>
      <Badge className="border-slate-200 bg-slate-100 text-slate-700">
        {as}
      </Badge>
    </span>
  );
}

function riskFlagsText(flags: string[]): string {
  return flags.length === 0 ? "—" : flags.join(", ");
}

export default function ReplayComparisonTable({
  comparisons,
  selectedIdx,
  onSelectRow,
}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Comparison Table
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Case</th>
              <th className="py-2 pr-3">Historical</th>
              <th className="py-2 pr-3">Rule</th>
              <th className="py-2 pr-3">Routing</th>
              <th className="py-2 pr-3">Review required</th>
              <th className="py-2 pr-3">Risk flags</th>
              <th className="py-2 pr-3">Regression</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c, idx) => {
              const isSelected = idx === selectedIdx;
              const rowTone = isSelected
                ? "bg-sky-50 ring-1 ring-sky-200"
                : "hover:bg-slate-50/50";
              return (
                <tr
                  key={c.caseId}
                  className={`border-t border-slate-100 align-top ${rowTone}`}
                >
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onSelectRow(idx)}
                      className="text-left text-sm font-medium text-slate-900 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                    >
                      {c.caseTitle}
                    </button>
                  </td>
                  <td className="py-2 pr-3">
                    <Badge
                      className={decisionTone(c.historicalFinalDecision)}
                    >
                      {c.historicalFinalDecision}
                    </Badge>
                  </td>
                  <td className="py-2 pr-3">
                    <ChangedPair
                      before={c.baseline.ruleDecision}
                      after={c.candidate.ruleDecision}
                      changed={c.diff.ruleDecisionChanged}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <ChangedPair
                      before={c.baseline.routingDecision}
                      after={c.candidate.routingDecision}
                      changed={c.diff.routingChanged}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <BoolPair
                      before={c.baseline.requiresHumanReview}
                      after={c.candidate.requiresHumanReview}
                      changed={c.diff.humanReviewRequirementChanged}
                    />
                  </td>
                  <td className="py-2 pr-3 text-xs text-slate-700">
                    <span>{riskFlagsText(c.baseline.riskFlags)}</span>
                    {c.diff.riskFlagsChanged && (
                      <>
                        <span className="text-slate-400"> → </span>
                        <span>{riskFlagsText(c.candidate.riskFlags)}</span>
                      </>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    <Badge
                      className={regressionTone(c.diff.potentialRegression)}
                    >
                      {c.diff.potentialRegression
                        ? "Potential regression"
                        : "No regression"}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
