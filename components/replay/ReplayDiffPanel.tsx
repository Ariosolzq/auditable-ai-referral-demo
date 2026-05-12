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

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Diff Panel — {comparison.caseTitle}
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Baseline output
          </h3>
          <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
            {JSON.stringify(comparison.baseline, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Candidate output
          </h3>
          <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
            {JSON.stringify(comparison.candidate, null, 2)}
          </pre>
        </div>
      </div>
      <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Changed fields
          </h3>
          {fields.length === 0 ? (
            <p className="text-sm text-slate-500">No changed fields.</p>
          ) : (
            <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-700">
              {fields.map((f) => (
                <li key={f}>
                  <code>{f}</code>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Interpretation
          </h3>
          <p className="text-sm text-slate-700">{comparison.diff.summary}</p>
        </div>
      </div>
    </section>
  );
}
