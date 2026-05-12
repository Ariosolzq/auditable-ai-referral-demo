import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparison: ReplayCaseComparison;
};

function changedFields(diff: ReplayCaseComparison["diff"]): string[] {
  const fields: string[] = [];
  if (diff.ruleDecisionChanged) fields.push("ruleDecision");
  if (diff.routingChanged) fields.push("routingDecision");
  if (diff.humanReviewRequirementChanged) fields.push("requiresHumanReview");
  if (diff.riskFlagsChanged) fields.push("riskFlags");
  return fields;
}

export default function ReplayDiffPanel({ comparison }: Props) {
  const fields = changedFields(comparison.diff);
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
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Changed fields
          </h3>
          {fields.length === 0 ? (
            <p className="text-sm text-slate-500">No changed fields.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {fields.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-xs text-amber-800"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Baseline / Candidate output
          </h3>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">
                Baseline
              </p>
              <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
                {JSON.stringify(comparison.baseline, null, 2)}
              </pre>
            </div>
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">
                Candidate
              </p>
              <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
                {JSON.stringify(comparison.candidate, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
