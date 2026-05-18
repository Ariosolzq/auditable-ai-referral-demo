import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparison: ReplayCaseComparison;
};

type DiffStatus = "same" | "changed" | "regression";

type SemanticRow = {
  field: string;
  baseline: string;
  candidate: string;
  status: DiffStatus;
};

function shortCaseName(title: string): string {
  const [head] = title.split(":");
  return head.trim();
}

function statusChipClass(status: DiffStatus): string {
  if (status === "same")
    return "border-slate-200 bg-slate-50 text-slate-500";
  if (status === "regression")
    return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function candidateValueClass(status: DiffStatus): string {
  if (status === "regression") return "text-rose-900 font-semibold";
  if (status === "changed") return "text-amber-900 font-semibold";
  return "text-slate-700";
}

function SemanticDiffRow({
  field,
  baseline,
  candidate,
  status,
}: SemanticRow) {
  const arrowChar = status === "same" ? "=" : "→";
  return (
    <li className="border-b border-slate-100 py-2 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <code className="font-mono text-[11px] font-semibold text-slate-800">
          {field}
        </code>
        <span
          className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] ${statusChipClass(
            status,
          )}`}
        >
          {status}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[11px] leading-snug">
        <span className="break-all text-slate-700">{baseline}</span>
        <span aria-hidden="true" className="text-slate-400">
          {arrowChar}
        </span>
        <span className={`break-all ${candidateValueClass(status)}`}>
          {candidate}
        </span>
      </div>
    </li>
  );
}

function riskFlagsText(flags: string[]): string {
  return flags.length === 0 ? "—" : flags.join(", ");
}

export default function ReplayDiffPanel({ comparison }: Props) {
  const caseShort = shortCaseName(comparison.caseTitle);

  const ruleChanged = comparison.diff.ruleDecisionChanged;
  const routingChanged = comparison.diff.routingChanged;
  const reviewChanged = comparison.diff.humanReviewRequirementChanged;
  const riskFlagsChanged = comparison.diff.riskFlagsChanged;
  const lostReview =
    comparison.baseline.requiresHumanReview === true &&
    comparison.candidate.requiresHumanReview === false;

  const rows: SemanticRow[] = [
    {
      field: "ruleDecision",
      baseline: comparison.baseline.ruleDecision,
      candidate: comparison.candidate.ruleDecision,
      status: ruleChanged ? "changed" : "same",
    },
    {
      field: "routingDecision",
      baseline: comparison.baseline.routingDecision,
      candidate: comparison.candidate.routingDecision,
      status: routingChanged ? "changed" : "same",
    },
    {
      field: "requiresHumanReview",
      baseline: String(comparison.baseline.requiresHumanReview),
      candidate: String(comparison.candidate.requiresHumanReview),
      status: lostReview
        ? "regression"
        : reviewChanged
          ? "changed"
          : "same",
    },
    {
      field: "riskFlags",
      baseline: riskFlagsText(comparison.baseline.riskFlags),
      candidate: riskFlagsText(comparison.candidate.riskFlags),
      status: riskFlagsChanged ? "changed" : "same",
    },
  ];

  return (
    <div className="space-y-3">
      <header className="space-y-1 px-1">
        <h2 className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          <span>C</span>
          <span className="text-slate-300">&middot;</span>
          <span>Selected case &middot; semantic diff</span>
        </h2>
        <p className="font-mono text-[11px] text-slate-500">
          {caseShort} &middot;{" "}
          <code className="text-slate-700">{comparison.caseId}</code>
        </p>
      </header>
      <section
        aria-label="Selected case semantic diff"
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p className="mb-4 rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs italic leading-snug text-slate-600">
          {comparison.diff.summary}
        </p>

        <ul className="rounded-md border border-slate-100 px-3">
          {rows.map((row) => (
            <SemanticDiffRow
              key={row.field}
              field={row.field}
              baseline={row.baseline}
              candidate={row.candidate}
              status={row.status}
            />
          ))}
        </ul>

        <details className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-slate-50/40">
          <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-3 py-2 hover:bg-slate-100/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              Supporting detail &middot; raw replay output
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
              JSON &middot; read-only &middot; selected case
            </span>
          </summary>
          <div className="grid grid-cols-1 gap-3 border-t border-slate-200 p-3 xl:grid-cols-2">
            <div>
              <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Baseline
                </span>
                <code className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                  {comparison.baseline.policyVersion} +{" "}
                  {comparison.baseline.promptVersion}
                </code>
              </div>
              <pre className="overflow-x-auto rounded-md border border-slate-700 bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-200">
                {JSON.stringify(comparison.baseline, null, 2)}
              </pre>
            </div>
            <div>
              <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Candidate
                </span>
                <code className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                  {comparison.candidate.policyVersion} +{" "}
                  {comparison.candidate.promptVersion}
                </code>
              </div>
              <pre className="overflow-x-auto rounded-md border border-slate-700 bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-200">
                {JSON.stringify(comparison.candidate, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}
