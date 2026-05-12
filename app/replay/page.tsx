import ReplayClient from "@/components/replay/ReplayClient";
import ReplaySummaryCards from "@/components/replay/ReplaySummaryCards";
import VersionChangeNotes from "@/components/replay/VersionChangeNotes";
import { replayRuns } from "@/data/replayRuns";

export default function ReplayPage() {
  const run = replayRuns[0];

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
      <VersionChangeNotes notes={run.versionChangeNotes} />
      <ReplaySummaryCards comparisons={run.comparisons} />
      <ReplayClient comparisons={run.comparisons} />
    </div>
  );
}
