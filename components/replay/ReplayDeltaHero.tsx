import type { ReactNode } from "react";
import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparison: ReplayCaseComparison;
  label?: string;
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
  if (v === "REJECT" || v === "failed")
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

const NEUTRAL_TONE = "border-slate-200 bg-slate-100 text-slate-700";

function riskFlagsText(flags: string[]): string {
  return flags.length === 0 ? "—" : flags.join(", ");
}

function FieldRow({
  field,
  baseline,
  candidate,
  changed,
  baselineTone,
  candidateTone,
}: {
  field: string;
  baseline: string;
  candidate: string;
  changed: boolean;
  baselineTone: string;
  candidateTone: string;
}) {
  const rowTone = changed
    ? "border-amber-200 bg-amber-50/50"
    : "border-slate-100 bg-white";
  return (
    <div
      className={`grid grid-cols-1 gap-2 rounded-md border px-3 py-2 sm:grid-cols-[150px_1fr_1fr] sm:items-center sm:gap-3 ${rowTone}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {field}
      </span>
      <Badge className={baselineTone}>{baseline}</Badge>
      <div className="flex items-center gap-2">
        {changed ? (
          <>
            <span aria-hidden="true" className="text-slate-400">
              →
            </span>
            <Badge className={candidateTone}>{candidate}</Badge>
            <span className="ml-auto inline-flex shrink-0 items-center rounded border border-amber-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-700">
              changed
            </span>
          </>
        ) : (
          <span className="text-xs italic text-slate-400">unchanged</span>
        )}
      </div>
    </div>
  );
}

export default function ReplayDeltaHero({ comparison, label }: Props) {
  const c = comparison;
  const isRegression = c.diff.potentialRegression;

  const baselineLabel = `${c.baseline.policyVersion} + ${c.baseline.promptVersion}`;
  const candidateLabel = `${c.candidate.policyVersion} + ${c.candidate.promptVersion}`;

  const baselineReview = c.baseline.requiresHumanReview ? "true" : "false";
  const candidateReview = c.candidate.requiresHumanReview ? "true" : "false";

  const baselineRisk = riskFlagsText(c.baseline.riskFlags);
  const candidateRisk = riskFlagsText(c.candidate.riskFlags);

  const heroTone = isRegression
    ? "border-rose-200 border-l-4 border-l-rose-400 bg-rose-50/40"
    : "border-slate-200 border-l-4 border-l-slate-300 bg-white";

  return (
    <section
      aria-label="Replay delta hero"
      className={`rounded-lg border ${heroTone} p-4 shadow-sm`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label ?? "Primary narrative"}
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            {c.caseTitle}
          </h2>
        </div>
        {isRegression ? (
          <Badge className="border-rose-200 bg-white text-rose-800">
            Potential regression
          </Badge>
        ) : (
          <Badge className="border-slate-200 bg-white text-slate-600">
            No regression
          </Badge>
        )}
      </div>

      <div className="mb-2 hidden grid-cols-[150px_1fr_1fr] gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:grid">
        <span>Field</span>
        <span>
          Baseline ·{" "}
          <code className="font-mono text-[10px] normal-case tracking-normal text-slate-600">
            {baselineLabel}
          </code>
        </span>
        <span>
          Candidate ·{" "}
          <code className="font-mono text-[10px] normal-case tracking-normal text-slate-600">
            {candidateLabel}
          </code>
        </span>
      </div>

      <div className="space-y-1.5">
        <FieldRow
          field="Rule decision"
          baseline={c.baseline.ruleDecision}
          candidate={c.candidate.ruleDecision}
          changed={c.diff.ruleDecisionChanged}
          baselineTone={decisionTone(c.baseline.ruleDecision)}
          candidateTone={decisionTone(c.candidate.ruleDecision)}
        />
        <FieldRow
          field="Routing decision"
          baseline={c.baseline.routingDecision}
          candidate={c.candidate.routingDecision}
          changed={c.diff.routingChanged}
          baselineTone={decisionTone(c.baseline.routingDecision)}
          candidateTone={decisionTone(c.candidate.routingDecision)}
        />
        <FieldRow
          field="Requires human review"
          baseline={baselineReview}
          candidate={candidateReview}
          changed={c.diff.humanReviewRequirementChanged}
          baselineTone={NEUTRAL_TONE}
          candidateTone={NEUTRAL_TONE}
        />
        <FieldRow
          field="Risk flags"
          baseline={baselineRisk}
          candidate={candidateRisk}
          changed={c.diff.riskFlagsChanged}
          baselineTone={NEUTRAL_TONE}
          candidateTone={NEUTRAL_TONE}
        />
      </div>

      <p className="mt-3 rounded-md border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm leading-snug text-slate-800">
        {c.diff.summary}
      </p>
    </section>
  );
}
