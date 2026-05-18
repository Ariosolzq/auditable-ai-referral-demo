"use client";

import { useState } from "react";
import ReplayComparisonTable from "@/components/replay/ReplayComparisonTable";
import ReplayDiffPanel from "@/components/replay/ReplayDiffPanel";
import ReplayPromotionGate from "@/components/replay/ReplayPromotionGate";
import ReplaySummaryCards from "@/components/replay/ReplaySummaryCards";
import VersionChangeNotes from "@/components/replay/VersionChangeNotes";
import type { ReplayCaseComparison, ReplayRun } from "@/types/replay";

type Props = {
  comparisons: ReplayCaseComparison[];
  versionChangeNotes: ReplayRun["versionChangeNotes"];
  primaryCaseId?: string;
};

function defaultSelectedIdx(
  comparisons: ReplayCaseComparison[],
  primaryCaseId?: string,
): number {
  if (primaryCaseId) {
    const idx = comparisons.findIndex((c) => c.caseId === primaryCaseId);
    if (idx >= 0) return idx;
  }
  return Math.max(0, comparisons.length - 1);
}

export default function ReplayClient({
  comparisons,
  versionChangeNotes,
  primaryCaseId,
}: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number>(() =>
    defaultSelectedIdx(comparisons, primaryCaseId),
  );
  const selected = comparisons[selectedIdx];

  return (
    <div className="space-y-5">
      {selected && <ReplayPromotionGate comparison={selected} />}
      <ReplaySummaryCards comparisons={comparisons} />
      <ReplayComparisonTable
        comparisons={comparisons}
        selectedIdx={selectedIdx}
        onSelectRow={setSelectedIdx}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        {selected && <ReplayDiffPanel comparison={selected} />}
        <VersionChangeNotes notes={versionChangeNotes} />
      </div>
    </div>
  );
}
