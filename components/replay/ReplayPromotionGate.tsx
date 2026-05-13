import type { ReactNode } from "react";
import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparisons: ReplayCaseComparison[];
  primaryCaseId?: string;
};

function diffFieldNames(diff: ReplayCaseComparison["diff"]): string[] {
  const fields: string[] = [];
  if (diff.ruleDecisionChanged) fields.push("ruleDecision");
  if (diff.routingChanged) fields.push("routingDecision");
  if (diff.humanReviewRequirementChanged) fields.push("requiresHumanReview");
  if (diff.riskFlagsChanged) fields.push("riskFlags");
  return fields;
}

function hasAnyDiff(c: ReplayCaseComparison): boolean {
  return diffFieldNames(c.diff).length > 0;
}

function shortCaseName(title: string): string {
  const [head] = title.split(":");
  return head.trim();
}

function Chip({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "amber" | "rose";
}) {
  const toneClass =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-slate-50 text-slate-700";
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium ${toneClass}`}
    >
      {children}
    </span>
  );
}

function GateRow({
  index,
  question,
  answer,
  accent,
}: {
  index: number;
  question: string;
  answer: ReactNode;
  accent: "neutral" | "amber" | "rose";
}) {
  const accentClass =
    accent === "rose"
      ? "border-l-rose-400"
      : accent === "amber"
        ? "border-l-amber-400"
        : "border-l-slate-300";
  return (
    <li
      className={`flex items-start gap-3 rounded-md border border-slate-200 border-l-4 ${accentClass} bg-white px-3 py-2`}
    >
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {question}
        </div>
        <div className="mt-1 text-sm text-slate-800">{answer}</div>
      </div>
    </li>
  );
}

export default function ReplayPromotionGate({
  comparisons,
  primaryCaseId,
}: Props) {
  const total = comparisons.length;
  const changedCases = comparisons.filter(hasAnyDiff);
  const regressionCases = comparisons.filter(
    (c) => c.diff.potentialRegression,
  );

  const primary =
    comparisons.find((c) => c.caseId === primaryCaseId) ??
    regressionCases[0] ??
    changedCases[0];

  // Q1 — What changed?
  const whatChangedAnswer =
    changedCases.length === 0 ? (
      <span className="text-slate-500">
        No changes detected across {total} case{total === 1 ? "" : "s"}.
      </span>
    ) : (
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip tone="amber">
          {changedCases.length} of {total} cases changed
        </Chip>
        {changedCases.map((c) => (
          <Chip key={c.caseId} tone="amber">
            {shortCaseName(c.caseTitle)} · {diffFieldNames(c.diff).join(", ")}
          </Chip>
        ))}
      </div>
    );

  // Q2 — Why? Compact: primary case version transition chip + verbatim
  // diff.summary. Does not loop over all changed cases.
  const whyAnswer = primary ? (
    <div className="flex flex-col gap-1.5">
      <Chip tone="slate">
        {shortCaseName(primary.caseTitle)} ·{" "}
        {primary.baseline.policyVersion}+{primary.baseline.promptVersion} →{" "}
        {primary.candidate.policyVersion}+{primary.candidate.promptVersion}
      </Chip>
      <span className="text-xs leading-snug text-slate-700">
        {primary.diff.summary}
      </span>
    </div>
  ) : (
    <span className="text-slate-500">No comparisons available.</span>
  );

  // Q3 — Potential regression?
  const regressionAnswer =
    regressionCases.length === 0 ? (
      <Chip tone="slate">No potential regressions detected</Chip>
    ) : (
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip tone="rose">
          Potential regression in {regressionCases.length} of {total} case
          {regressionCases.length === 1 ? "" : "s"}
        </Chip>
        {regressionCases.map((c) => (
          <Chip key={c.caseId} tone="rose">
            {shortCaseName(c.caseTitle)}
          </Chip>
        ))}
      </div>
    );

  // Q4 — Promote? Read-only verdict, no buttons, no actions.
  const requiresReview =
    regressionCases.length > 0 || changedCases.length > 0;
  const promoteAnswer = (
    <div className="flex flex-col gap-1">
      {requiresReview ? (
        <Chip tone={regressionCases.length > 0 ? "rose" : "amber"}>
          Requires human review before promotion
        </Chip>
      ) : (
        <Chip tone="slate">No changes detected</Chip>
      )}
      <span className="text-xs italic text-slate-500">
        Replay does not auto-promote.
      </span>
    </div>
  );

  const q1Accent: "neutral" | "amber" = changedCases.length > 0 ? "amber" : "neutral";
  const q2Accent: "neutral" | "amber" = changedCases.length > 0 ? "amber" : "neutral";
  const q3Accent: "neutral" | "rose" =
    regressionCases.length > 0 ? "rose" : "neutral";
  const q4Accent: "neutral" | "amber" | "rose" =
    regressionCases.length > 0
      ? "rose"
      : changedCases.length > 0
        ? "amber"
        : "neutral";

  return (
    <section
      aria-label="Promotion gate"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Promotion gate
        </h2>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          read-only · governance review before promotion
        </p>
      </div>
      <ol className="space-y-2">
        <GateRow
          index={1}
          question="What changed?"
          answer={whatChangedAnswer}
          accent={q1Accent}
        />
        <GateRow
          index={2}
          question="Why?"
          answer={whyAnswer}
          accent={q2Accent}
        />
        <GateRow
          index={3}
          question="Potential regression?"
          answer={regressionAnswer}
          accent={q3Accent}
        />
        <GateRow
          index={4}
          question="Promotion check"
          answer={promoteAnswer}
          accent={q4Accent}
        />
      </ol>
    </section>
  );
}
