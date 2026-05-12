"use client";

import { useState } from "react";
import ReplayComparisonTable from "@/components/replay/ReplayComparisonTable";
import ReplayDiffPanel from "@/components/replay/ReplayDiffPanel";
import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparisons: ReplayCaseComparison[];
};

export default function ReplayClient({ comparisons }: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number>(() =>
    Math.max(0, Math.min(2, comparisons.length - 1)),
  );
  const selected = comparisons[selectedIdx];

  return (
    <div className="space-y-4">
      <ReplayComparisonTable
        comparisons={comparisons}
        selectedIdx={selectedIdx}
        onSelectRow={setSelectedIdx}
      />
      {selected && <ReplayDiffPanel comparison={selected} />}
    </div>
  );
}
