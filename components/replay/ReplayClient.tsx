"use client";

import { useState } from "react";
import ReplayComparisonTable from "@/components/replay/ReplayComparisonTable";
import ReplayDiffPanel from "@/components/replay/ReplayDiffPanel";
import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparisons: ReplayCaseComparison[];
};

export default function ReplayClient({ comparisons }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
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
