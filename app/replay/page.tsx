import type { ReactNode } from "react";
import ReplayClient from "@/components/replay/ReplayClient";
import ReplayPromotionGate from "@/components/replay/ReplayPromotionGate";
import ReplaySummaryCards from "@/components/replay/ReplaySummaryCards";
import VersionChangeNotes from "@/components/replay/VersionChangeNotes";
import { replayRuns } from "@/data/replayRuns";

const BOUNDARIES: string[] = [
  "mock replay",
  "no production status update",
  "no final-decision update",
  "no review queue update",
  "pre-authored mock outputs",
];

function BoundaryChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
      {children}
    </span>
  );
}

export default function ReplayPage() {
  const run = replayRuns[0];

  return (
    <div className="space-y-5">
      <header className="rounded-lg border border-slate-200 border-l-4 border-l-amber-300 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Replay &amp; Evaluation
            </h1>
            <p className="mt-0.5 text-sm text-slate-600">
              Promotion-gate view. Inspect baseline vs candidate before policy
              or prompt promotion.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>
              Run: <code className="font-mono">{run.title}</code>
            </span>
            <span>
              Baseline: <code className="font-mono">{run.baselineLabel}</code>
            </span>
            <span>
              Candidate:{" "}
              <code className="font-mono">{run.candidateLabel}</code>
            </span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Boundary
          </span>
          {BOUNDARIES.map((b) => (
            <BoundaryChip key={b}>{b}</BoundaryChip>
          ))}
        </div>
      </header>

      <ReplayPromotionGate
        comparisons={run.comparisons}
        primaryCaseId="case-c"
      />

      <ReplaySummaryCards comparisons={run.comparisons} />

      <ReplayClient comparisons={run.comparisons} />

      <VersionChangeNotes notes={run.versionChangeNotes} />
    </div>
  );
}
