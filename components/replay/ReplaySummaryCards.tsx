import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparisons: ReplayCaseComparison[];
};

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function ReplaySummaryCards({ comparisons }: Props) {
  const total = comparisons.length;
  const ruleChanges = comparisons.filter(
    (c) => c.diff.ruleDecisionChanged,
  ).length;
  const routingChanges = comparisons.filter((c) => c.diff.routingChanged).length;
  const reviewChanges = comparisons.filter(
    (c) => c.diff.humanReviewRequirementChanged,
  ).length;
  const regressions = comparisons.filter(
    (c) => c.diff.potentialRegression,
  ).length;

  return (
    <section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card label="Total cases" value={total} />
        <Card label="Rule decision changes" value={ruleChanges} />
        <Card label="Routing changes" value={routingChanges} />
        <Card label="Review requirement changes" value={reviewChanges} />
        <Card label="Potential regressions" value={regressions} />
      </div>
    </section>
  );
}
