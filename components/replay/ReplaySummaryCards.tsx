import type { ReactNode } from "react";
import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparisons: ReplayCaseComparison[];
};

type Tone = "neutral" | "amber" | "rose";

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) {
  const valueTone: Record<Tone, string> = {
    neutral: "text-slate-900",
    amber: "text-amber-800",
    rose: "text-rose-800",
  };
  const labelTone: Record<Tone, string> = {
    neutral: "text-slate-500",
    amber: "text-amber-700",
    rose: "text-rose-700",
  };
  return (
    <div className="inline-flex items-baseline gap-1.5">
      <span className={`text-lg font-semibold tabular-nums ${valueTone[tone]}`}>
        {value}
      </span>
      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${labelTone[tone]}`}
      >
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <span
      aria-hidden="true"
      className="hidden h-4 w-px bg-slate-200 sm:inline-block"
    />
  );
}

function Cell({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-3">{children}</div>;
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
    <section
      aria-label="Replay scoreboard"
      className="rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Scoreboard
        </span>
        <Cell>
          <Stat label="Total cases" value={total} tone="neutral" />
        </Cell>
        <Divider />
        <Cell>
          <Stat
            label="Rule"
            value={ruleChanges}
            tone={ruleChanges > 0 ? "amber" : "neutral"}
          />
        </Cell>
        <Divider />
        <Cell>
          <Stat
            label="Routing"
            value={routingChanges}
            tone={routingChanges > 0 ? "amber" : "neutral"}
          />
        </Cell>
        <Divider />
        <Cell>
          <Stat
            label="Review req."
            value={reviewChanges}
            tone={reviewChanges > 0 ? "amber" : "neutral"}
          />
        </Cell>
        <Divider />
        <Cell>
          <Stat
            label="Potential regressions"
            value={regressions}
            tone={regressions > 0 ? "rose" : "neutral"}
          />
        </Cell>
      </div>
    </section>
  );
}
