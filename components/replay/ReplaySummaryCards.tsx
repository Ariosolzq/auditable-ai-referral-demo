import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparisons: ReplayCaseComparison[];
};

type Tone = "neutral" | "amber" | "rose";

function Card({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: Tone;
}) {
  const styles: Record<Tone, { card: string; label: string; value: string }> = {
    neutral: {
      card: "border-slate-200 bg-white",
      label: "text-slate-500",
      value: "text-slate-900",
    },
    amber: {
      card: "border-amber-200 bg-amber-50",
      label: "text-amber-700",
      value: "text-amber-900",
    },
    rose: {
      card: "border-rose-200 bg-rose-50",
      label: "text-rose-700",
      value: "text-rose-900",
    },
  };
  const s = styles[tone];
  return (
    <div className={`rounded-lg border p-3 shadow-sm ${s.card}`}>
      <div className={`text-xs uppercase tracking-wide ${s.label}`}>
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${s.value}`}>{value}</div>
    </div>
  );
}

export default function ReplaySummaryCards({ comparisons }: Props) {
  const total = comparisons.length;
  const ruleChanges = comparisons.filter(
    (c) => c.diff.ruleDecisionChanged,
  ).length;
  const routingChanges = comparisons.filter(
    (c) => c.diff.routingChanged,
  ).length;
  const reviewChanges = comparisons.filter(
    (c) => c.diff.humanReviewRequirementChanged,
  ).length;
  const regressions = comparisons.filter(
    (c) => c.diff.potentialRegression,
  ).length;

  return (
    <section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card label="Total cases" value={total} tone="neutral" />
        <Card
          label="Rule decision changes"
          value={ruleChanges}
          tone={ruleChanges > 0 ? "amber" : "neutral"}
        />
        <Card
          label="Routing changes"
          value={routingChanges}
          tone={routingChanges > 0 ? "amber" : "neutral"}
        />
        <Card
          label="Review requirement changes"
          value={reviewChanges}
          tone={reviewChanges > 0 ? "amber" : "neutral"}
        />
        <Card
          label="Potential regressions"
          value={regressions}
          tone={regressions > 0 ? "rose" : "neutral"}
        />
      </div>
    </section>
  );
}
