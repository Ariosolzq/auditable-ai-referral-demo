"use client";

import { useState } from "react";
import ReplayComparisonTable from "@/components/replay/ReplayComparisonTable";
import ReplayDeltaHero from "@/components/replay/ReplayDeltaHero";
import ReplayDiffPanel from "@/components/replay/ReplayDiffPanel";
import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparisons: ReplayCaseComparison[];
};

function defaultSelectedIdx(len: number): number {
  return Math.max(0, Math.min(2, len - 1));
}

export default function ReplayClient({ comparisons }: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number>(() =>
    defaultSelectedIdx(comparisons.length),
  );
  const selected = comparisons[selectedIdx];
  const isDefaultSelection =
    selectedIdx === defaultSelectedIdx(comparisons.length);
  const isCaseC = selected?.caseId === "case-c";
  const heroLabel =
    isDefaultSelection && isCaseC
      ? "Primary narrative · Case C"
      : "Selected comparison";

  return (
    <div className="space-y-4">
      {selected && (
        <ReplayDeltaHero comparison={selected} label={heroLabel} />
      )}
      <ReplayComparisonTable
        comparisons={comparisons}
        selectedIdx={selectedIdx}
        onSelectRow={setSelectedIdx}
      />
      {selected && <ReplayDiffPanel comparison={selected} />}
    </div>
  );
}
