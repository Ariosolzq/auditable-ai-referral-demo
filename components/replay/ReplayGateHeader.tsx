import type { ReactNode } from "react";
import type { ReplayCaseComparison, ReplayRun } from "@/types/replay";

type Props = {
  run: ReplayRun;
  primaryCaseId: string;
};

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const aSet = new Set(a);
  for (const x of b) if (!aSet.has(x)) return false;
  return true;
}

function caseLabelFromId(caseId: string): string {
  if (caseId.startsWith("case-")) {
    return `Case ${caseId.slice(5).toUpperCase()}`;
  }
  return caseId;
}

function GateEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/80 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-800">
      <span
        aria-hidden="true"
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-rose-600 font-mono text-[9px] font-bold text-white"
      >
        !
      </span>
      {children}
    </span>
  );
}

function VersionCartouche({
  baselineLabel,
  candidateLabel,
}: {
  baselineLabel: string;
  candidateLabel: string;
}) {
  return (
    <div className="grid gap-2 self-start sm:min-w-[240px]">
      <div className="grid grid-cols-[80px_1fr] items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Baseline
        </span>
        <span className="font-mono text-xs text-slate-800">
          {baselineLabel}
        </span>
      </div>
      <div className="grid grid-cols-[80px_1fr] items-center gap-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-rose-800">
          Candidate
        </span>
        <span className="font-mono text-xs font-bold text-rose-900">
          {candidateLabel}
        </span>
      </div>
    </div>
  );
}

function RecRow({
  label,
  value,
  valueTone = "default",
}: {
  label: string;
  value: ReactNode;
  valueTone?: "default" | "bad" | "mono";
}) {
  const valueClass =
    valueTone === "bad"
      ? "text-sm font-semibold text-rose-800"
      : valueTone === "mono"
        ? "font-mono text-[11px] text-slate-500"
        : "text-sm text-slate-700";
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-100 px-3.5 py-2 last:border-b-0 sm:grid-cols-[170px_1fr] sm:gap-3.5 sm:py-2.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function RecommendationPanel({ caseId }: { caseId: string }) {
  return (
    <div
      role="note"
      aria-label="Replay recommendation"
      className="overflow-hidden rounded-lg border border-slate-200 border-l-4 border-l-rose-500 bg-white"
    >
      <RecRow
        label="Recommended action"
        value="Block promotion until reviewed"
        valueTone="bad"
      />
      <RecRow
        label="Reason"
        value={`Potential governance regression detected in ${caseLabelFromId(caseId)}`}
      />
      <RecRow
        label="Boundary"
        value="Read-only replay · no production update · human approval required"
        valueTone="mono"
      />
    </div>
  );
}

function DeltaChip({
  label,
  from,
  to,
  unchanged,
  singleValue = false,
}: {
  label: string;
  from: string;
  to?: string;
  unchanged: boolean;
  singleValue?: boolean;
}) {
  const containerClass = `inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 ${unchanged ? "bg-slate-50" : "bg-white"}`;
  return (
    <span className={containerClass}>
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </span>
      <span className="inline-flex flex-wrap items-center gap-1.5 font-mono text-[12px]">
        <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-700">
          {from}
        </span>
        {unchanged && !singleValue && (
          <>
            <span aria-hidden="true" className="text-slate-400">
              =
            </span>
            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-700">
              {from}
            </span>
          </>
        )}
        {!unchanged && to !== undefined && (
          <>
            <span aria-hidden="true" className="text-slate-400">
              &rarr;
            </span>
            <span className="rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 font-bold text-rose-800">
              {to}
            </span>
          </>
        )}
        {unchanged && (
          <em className="ml-0.5 font-sans text-[10px] text-slate-500">
            unchanged
          </em>
        )}
      </span>
    </span>
  );
}

function PrimaryFindingBand({
  caseId,
  comparison,
}: {
  caseId: string;
  comparison: ReplayCaseComparison;
}) {
  const b = comparison.baseline;
  const c = comparison.candidate;
  const ruleSame = b.ruleDecision === c.ruleDecision;
  const routingSame = b.routingDecision === c.routingDecision;
  const reviewSame = b.requiresHumanReview === c.requiresHumanReview;
  const riskFlagsSame = arraysEqual(b.riskFlags, c.riskFlags);
  const caseLabel = caseLabelFromId(caseId);

  return (
    <section
      aria-label="Primary finding"
      className="overflow-hidden rounded-xl border border-rose-200 border-l-4 border-l-rose-500 bg-rose-50/50 p-5 sm:p-6"
    >
      <GateEyebrow>Primary finding &middot; {caseLabel}</GateEyebrow>
      <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[26px]">
        <em className="font-bold not-italic text-rose-700">
          Human review gate removed
        </em>{" "}
        for {caseLabel}.
      </h2>
      <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-slate-700 sm:text-base">
        Rule still rejects. Baseline routed REJECT cases directly to human
        review; candidate now routes to{" "}
        <code className="rounded border border-rose-200 bg-white/70 px-1 font-mono text-[12px] text-rose-900">
          needs_more_evidence
        </code>{" "}
        instead. The reviewer is no longer the immediate next actor for this
        decision &mdash; that is a governance change, not a rule change.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <DeltaChip
          label="Rule"
          from={b.ruleDecision}
          to={c.ruleDecision}
          unchanged={ruleSame}
        />
        <DeltaChip
          label="Routing"
          from={b.routingDecision}
          to={c.routingDecision}
          unchanged={routingSame}
        />
        <DeltaChip
          label="requiresHumanReview"
          from={String(b.requiresHumanReview)}
          to={String(c.requiresHumanReview)}
          unchanged={reviewSame}
        />
        <DeltaChip
          label="Risk flags"
          from={b.riskFlags.join(", ") || "—"}
          to={c.riskFlags.join(", ") || "—"}
          unchanged={riskFlagsSame}
          singleValue
        />
      </div>
    </section>
  );
}

export default function ReplayGateHeader({ run, primaryCaseId }: Props) {
  const primary = run.comparisons.find((c) => c.caseId === primaryCaseId);
  if (!primary) return null;

  return (
    <div className="space-y-5">
      <section
        aria-labelledby="replay-gate-title"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="grid gap-5 border-b border-slate-100 bg-gradient-to-b from-rose-50/80 to-white p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-6">
          <div>
            <GateEyebrow>
              Promotion review &middot; potential regression
            </GateEyebrow>
            <h1
              id="replay-gate-title"
              className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl"
            >
              Promote{" "}
              <code className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[0.78em] text-slate-900">
                {run.candidateLabel}
              </code>
              ?
            </h1>
            <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-slate-700">
              Replay detected a{" "}
              <b className="font-semibold text-slate-900">
                potential governance regression
              </b>{" "}
              before promotion. This page is{" "}
              <b className="font-semibold text-slate-900">read-only</b> and
              records no production changes &mdash; human approval is required
              to promote.
            </p>
          </div>
          <VersionCartouche
            baselineLabel={run.baselineLabel}
            candidateLabel={run.candidateLabel}
          />
        </div>
        <div className="p-4 sm:p-5">
          <RecommendationPanel caseId={primaryCaseId} />
        </div>
      </section>
      <PrimaryFindingBand caseId={primaryCaseId} comparison={primary} />
    </div>
  );
}
