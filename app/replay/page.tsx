import ReplayClient from "@/components/replay/ReplayClient";
import ReplayGateHeader from "@/components/replay/ReplayGateHeader";
import { replayRuns } from "@/data/replayRuns";

export default function ReplayPage() {
  const run = replayRuns[0];

  return (
    <div className="space-y-6">
      <ReplayGateHeader run={run} primaryCaseId="case-c" />

      <ReplayClient
        comparisons={run.comparisons}
        versionChangeNotes={run.versionChangeNotes}
        primaryCaseId="case-c"
      />
    </div>
  );
}
