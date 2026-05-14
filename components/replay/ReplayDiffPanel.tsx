import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparison: ReplayCaseComparison;
};

export default function ReplayDiffPanel({ comparison }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50/40 p-3">
      <details>
        <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 hover:text-slate-700">
          Raw replay output &middot; {comparison.caseTitle} &mdash; click to
          expand
        </summary>
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-slate-400">
              Baseline
            </p>
            <pre className="overflow-x-auto rounded-md border border-slate-200 bg-white p-3 text-[11px] leading-relaxed text-slate-600">
              {JSON.stringify(comparison.baseline, null, 2)}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-slate-400">
              Candidate
            </p>
            <pre className="overflow-x-auto rounded-md border border-slate-200 bg-white p-3 text-[11px] leading-relaxed text-slate-600">
              {JSON.stringify(comparison.candidate, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </section>
  );
}
