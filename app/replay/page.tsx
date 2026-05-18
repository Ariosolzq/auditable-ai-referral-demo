import ReplayClient from "@/components/replay/ReplayClient";
import ReplayGateHeader from "@/components/replay/ReplayGateHeader";
import VersionChangeNotes from "@/components/replay/VersionChangeNotes";
import { replayRuns } from "@/data/replayRuns";

export default function ReplayPage() {
  const run = replayRuns[0];

  return (
    <div className="space-y-6">
      <ReplayGateHeader run={run} primaryCaseId="case-c" />

      <ReplayClient comparisons={run.comparisons} primaryCaseId="case-c" />

      <VersionChangeNotes notes={run.versionChangeNotes} />
    </div>
  );
}
