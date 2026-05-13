import type { ReactNode } from "react";
import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparison: ReplayCaseComparison;
};

type FieldDelta = {
  key: string;
  label: string;
  meaning: string;
  before: string;
  after: string;
  pill?: string;
};

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

function deriveFieldDeltas(c: ReplayCaseComparison): FieldDelta[] {
  const deltas: FieldDelta[] = [];

  if (c.diff.ruleDecisionChanged) {
    deltas.push({
      key: "ruleDecision",
      label: "Rule decision",
      meaning: "Underlying rule outcome differs between baseline and candidate.",
      before: c.baseline.ruleDecision,
      after: c.candidate.ruleDecision,
    });
  }

  if (c.diff.routingChanged) {
    deltas.push({
      key: "routingDecision",
      label: "Routing decision",
      meaning: "Downstream routing target differs between baseline and candidate.",
      before: c.baseline.routingDecision,
      after: c.candidate.routingDecision,
    });
  }

  if (c.diff.humanReviewRequirementChanged) {
    const lostReview =
      c.baseline.requiresHumanReview === true &&
      c.candidate.requiresHumanReview === false;
    deltas.push({
      key: "requiresHumanReview",
      label: "Requires human review",
      meaning: "Human review requirement differs between baseline and candidate.",
      before: c.baseline.requiresHumanReview ? "true" : "false",
      after: c.candidate.requiresHumanReview ? "true" : "false",
      pill: lostReview ? "review gate changed" : undefined,
    });
  }

  if (c.diff.riskFlagsChanged) {
    deltas.push({
      key: "riskFlags",
      label: "Risk flags",
      meaning: "Risk flag set differs between baseline and candidate.",
      before: riskFlagsText(c.baseline.riskFlags),
      after: riskFlagsText(c.candidate.riskFlags),
    });
  }

  return deltas;
}

function valueTone(key: string, value: string): string {
  if (key === "ruleDecision" || key === "routingDecision") {
    return decisionTone(value);
  }
  return NEUTRAL_TONE;
}

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

function FieldDeltaRow({ delta }: { delta: FieldDelta }) {
  return (
    <li className="rounded-md border border-amber-200 bg-amber-50/50 p-2.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <code className="font-mono text-[11px] text-amber-900">
          {delta.key}
        </code>
        <span className="text-sm font-medium text-slate-900">
          {delta.label}
        </span>
        {delta.pill && (
          <span className="inline-flex items-center rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-700">
            {delta.pill}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-xs leading-snug text-slate-600">
        {delta.meaning}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
        <Badge className={valueTone(delta.key, delta.before)}>
          {delta.before}
        </Badge>
        <span aria-hidden="true" className="text-slate-400">
          →
        </span>
        <Badge className={valueTone(delta.key, delta.after)}>
          {delta.after}
        </Badge>
      </div>
    </li>
  );
}

export default function ReplayDiffPanel({ comparison }: Props) {
  const deltas = deriveFieldDeltas(comparison);
  const isRegression = comparison.diff.potentialRegression;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Diff Panel &mdash; {comparison.caseTitle}
        </h2>
        {isRegression && (
          <span className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800">
            Potential regression
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="rounded-md border border-slate-100 bg-slate-50/60 p-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Interpretation
          </h3>
          <p className="text-sm text-slate-800">{comparison.diff.summary}</p>
        </div>

        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Changed fields
          </h3>
          {deltas.length === 0 ? (
            <p className="rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm text-slate-500">
              No changed fields between baseline and candidate.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {deltas.map((d) => (
                <FieldDeltaRow key={d.key} delta={d} />
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-md border border-slate-100 bg-slate-50/40 p-3">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Supporting detail &middot; raw replay output
            </h3>
            <span className="text-[10px] italic text-slate-400">
              read after the changed-fields summary above
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">
                Baseline
              </p>
              <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700">
                {JSON.stringify(comparison.baseline, null, 2)}
              </pre>
            </div>
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">
                Candidate
              </p>
              <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700">
                {JSON.stringify(comparison.candidate, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
