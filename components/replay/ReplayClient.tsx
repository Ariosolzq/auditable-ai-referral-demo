"use client";

import { useState } from "react";
import ReplayComparisonTable from "@/components/replay/ReplayComparisonTable";
import ReplayDiffPanel from "@/components/replay/ReplayDiffPanel";
import ReplayPromotionGate from "@/components/replay/ReplayPromotionGate";
import ReplaySummaryCards from "@/components/replay/ReplaySummaryCards";
import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparisons: ReplayCaseComparison[];
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

export default function ReplayClient({ comparisons, primaryCaseId }: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number>(() =>
    defaultSelectedIdx(comparisons, primaryCaseId),
  );
  const selected = comparisons[selectedIdx];
  const isPrimary =
    primaryCaseId !== undefined && selected?.caseId === primaryCaseId;

  return (
    <div className="space-y-5">
      {selected && (
        <ReplayPromotionGate
          comparison={selected}
          label={isPrimary ? "Primary finding" : "Selected case"}
        />
      )}
      <ReplaySummaryCards comparisons={comparisons} />
      <div className="space-y-3">
        <p className="text-[11px] italic text-slate-500">
          Select a case to update the replay explanation and raw output.
        </p>
        <ReplayComparisonTable
          comparisons={comparisons}
          selectedIdx={selectedIdx}
          onSelectRow={setSelectedIdx}
        />
        {selected && <ReplayDiffPanel comparison={selected} />}
      </div>
    </div>
  );
}
