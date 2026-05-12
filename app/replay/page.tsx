import ReplayClient from "@/components/replay/ReplayClient";
import ReplaySummaryCards from "@/components/replay/ReplaySummaryCards";
import VersionChangeNotes from "@/components/replay/VersionChangeNotes";
import { replayRuns } from "@/data/replayRuns";

export default function ReplayPage() {
  const run = replayRuns[0];
  const caseCInsight = run.comparisons.find((c) => c.caseId === "case-c")?.diff
    .summary;
  const caseCRegression = run.comparisons.find(
    (c) => c.caseId === "case-c",
  )?.diff.potentialRegression;

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-slate-200 border-l-4 border-l-amber-300 bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Replay &amp; Evaluation
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Replay does not update production status, final decisions, or real
          review queues.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>
            Run: <code>{run.title}</code>
          </span>
          <span>
            Baseline: <code>{run.baselineLabel}</code>
          </span>
          <span>
            Candidate: <code>{run.candidateLabel}</code>
          </span>
        </div>
      </header>

      {caseCInsight && (
        <section
          aria-label="Replay insight"
          className="rounded-lg border-2 border-rose-200 bg-rose-50/60 p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="max-w-3xl space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                Replay insight &middot; read first
              </div>
              <p className="text-sm text-slate-800">{caseCInsight}</p>
            </div>
            {caseCRegression && (
              <span className="inline-flex shrink-0 items-center rounded-md border border-rose-200 bg-white px-2 py-0.5 text-xs font-medium text-rose-800">
                Potential regression &middot; Case C
              </span>
            )}
          </div>
        </section>
      )}

      <VersionChangeNotes notes={run.versionChangeNotes} />
      <ReplaySummaryCards comparisons={run.comparisons} />
      <ReplayClient comparisons={run.comparisons} />
    </div>
  );
}
