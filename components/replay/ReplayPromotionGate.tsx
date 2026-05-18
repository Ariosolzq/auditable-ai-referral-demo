import { Fragment, type ReactNode } from "react";
import type { ReplayCaseComparison, ReplayOutput } from "@/types/replay";

type Props = {
  comparison: ReplayCaseComparison;
};

type NodeAccent = "rule" | "gov" | "neutral" | "changed";

function shortCaseName(title: string): string {
  const [head] = title.split(":");
  return head.trim();
}

function nextActorLabel(out: ReplayOutput): string {
  if (out.requiresHumanReview) return "Human Review Gate";
  switch (out.routingDecision) {
    case "auto_accept":
      return "Auto accept";
    case "auto_reject":
      return "Auto reject";
    case "needs_more_evidence":
      return "Document re-fetch";
    default:
      return "Workflow continues";
  }
}

function topReasonCode(codes: string[]): string {
  return codes[0] ?? "—";
}

function PathNode({
  kLabel,
  value,
  sublabel,
  accent,
}: {
  kLabel: string;
  value: string;
  sublabel?: string;
  accent: NodeAccent;
}) {
  const railColor =
    accent === "rule"
      ? "border-l-amber-400"
      : accent === "gov"
        ? "border-l-sky-500"
        : accent === "changed"
          ? "border-l-rose-500"
          : "border-l-slate-300";
  const surface =
    accent === "changed"
      ? "border-rose-200 bg-rose-50/60"
      : "border-slate-200 bg-white";
  const valueText =
    accent === "gov"
      ? "text-sky-800"
      : accent === "changed"
        ? "text-rose-900"
        : "text-slate-900";
  return (
    <div
      className={`grid gap-0.5 rounded-md border border-l-[3px] px-3 py-2 ${surface} ${railColor}`}
    >
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {kLabel}
      </span>
      <span
        className={`text-[13px] font-semibold leading-tight tracking-tight ${valueText}`}
      >
        {value}
      </span>
      {sublabel && (
        <span className="font-mono text-[10px] text-slate-500">
          {sublabel}
        </span>
      )}
    </div>
  );
}

type Step = {
  kLabel: string;
  value: string;
  sublabel?: string;
  accent: NodeAccent;
};

type Verdict = { label: string; tone: "ok" | "bad" } | null;

function PathRow({
  rowLabel,
  versionLabel,
  steps,
  verdict,
  candidate = false,
}: {
  rowLabel: string;
  versionLabel: string;
  steps: Step[];
  verdict: Verdict;
  candidate?: boolean;
}) {
  const rowSurface = candidate
    ? "border-rose-200 bg-rose-50/30"
    : "border-slate-200 bg-white";
  const rowLabelClass = candidate ? "text-rose-700" : "text-slate-600";
  return (
    <div className={`rounded-md border px-3 py-2.5 ${rowSurface}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${rowLabelClass}`}
        >
          {rowLabel}
        </span>
        <code className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
          {versionLabel}
        </code>
        {verdict && (
          <span
            className={`ml-auto inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${
              verdict.tone === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {verdict.label}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch">
        {steps.map((step, idx) => (
          <Fragment key={`${rowLabel}-${idx}`}>
            <PathNode
              kLabel={step.kLabel}
              value={step.value}
              sublabel={step.sublabel}
              accent={step.accent}
            />
            {idx < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="hidden self-center text-center text-slate-400 sm:block"
              >
                &rarr;
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

type RegressionStatus = "unchanged" | "changed" | "regression";

function RegressionLogicRow({
  label,
  value,
  status,
}: {
  label: string;
  value: ReactNode;
  status: RegressionStatus;
}) {
  const statusClass =
    status === "unchanged"
      ? "border-slate-200 bg-slate-50 text-slate-500"
      : status === "changed"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-rose-200 bg-rose-50 text-rose-800";
  return (
    <li className="grid grid-cols-1 items-baseline gap-x-4 gap-y-1 border-b border-slate-100 py-2 last:border-b-0 sm:grid-cols-[160px_minmax(0,1fr)_auto]">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </span>
      <span className="text-[13px] leading-snug text-slate-800">{value}</span>
      <span
        className={`inline-flex items-center justify-self-start rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] sm:justify-self-end ${statusClass}`}
      >
        {status}
      </span>
    </li>
  );
}

function CodeInline({ children }: { children: ReactNode }) {
  return (
    <code className="rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[11px] text-slate-700">
      {children}
    </code>
  );
}

export default function ReplayPromotionGate({ comparison }: Props) {
  const caseShort = shortCaseName(comparison.caseTitle);
  const baselineLabel = `${comparison.baseline.policyVersion} + ${comparison.baseline.promptVersion}`;
  const candidateLabel = `${comparison.candidate.policyVersion} + ${comparison.candidate.promptVersion}`;

  const ruleChanged = comparison.diff.ruleDecisionChanged;
  const routingChanged = comparison.diff.routingChanged;
  const reviewChanged = comparison.diff.humanReviewRequirementChanged;
  const lostReview =
    comparison.baseline.requiresHumanReview === true &&
    comparison.candidate.requiresHumanReview === false;

  const baselineSteps: Step[] = [
    {
      kLabel: "Rule decision",
      value: comparison.baseline.ruleDecision,
      sublabel: topReasonCode(comparison.baseline.reasonCodes),
      accent: "neutral",
    },
    {
      kLabel: "Routing",
      value: comparison.baseline.routingDecision,
      sublabel: comparison.baseline.policyVersion,
      accent: "neutral",
    },
    {
      kLabel: "Next actor",
      value: nextActorLabel(comparison.baseline),
      sublabel: `requiresHumanReview: ${comparison.baseline.requiresHumanReview}`,
      accent: comparison.baseline.requiresHumanReview ? "gov" : "neutral",
    },
  ];

  const candidateSteps: Step[] = [
    {
      kLabel: "Rule decision",
      value: comparison.candidate.ruleDecision,
      sublabel: topReasonCode(comparison.candidate.reasonCodes),
      accent: ruleChanged ? "changed" : "neutral",
    },
    {
      kLabel: "Routing",
      value: comparison.candidate.routingDecision,
      sublabel: comparison.candidate.policyVersion,
      accent: routingChanged ? "changed" : "neutral",
    },
    {
      kLabel: "Next actor",
      value: nextActorLabel(comparison.candidate),
      sublabel: `requiresHumanReview: ${comparison.candidate.requiresHumanReview}`,
      accent: lostReview
        ? "changed"
        : comparison.candidate.requiresHumanReview
          ? "gov"
          : "neutral",
    },
  ];

  // Verdict tags only render for the regression-specific case (lostReview),
  // so non-regression cases (A/B) do not get false "ok"/"bad" framing.
  const baselineVerdict: Verdict = lostReview
    ? { label: "Reviewer is immediate next actor", tone: "ok" }
    : null;
  const candidateVerdict: Verdict = lostReview
    ? { label: "Reviewer is no longer immediate", tone: "bad" }
    : null;

  type LogicRow = {
    label: string;
    value: ReactNode;
    status: RegressionStatus;
  };
  const logicRows: LogicRow[] = [];

  logicRows.push(
    ruleChanged
      ? {
          label: "Rule",
          value: (
            <>
              <CodeInline>{comparison.baseline.ruleDecision}</CodeInline> &rarr;{" "}
              <CodeInline>{comparison.candidate.ruleDecision}</CodeInline>
            </>
          ),
          status: "changed",
        }
      : {
          label: "Rule",
          value: (
            <>
              <CodeInline>{comparison.baseline.ruleDecision}</CodeInline> stayed{" "}
              <CodeInline>{comparison.baseline.ruleDecision}</CodeInline>
            </>
          ),
          status: "unchanged",
        },
  );

  logicRows.push(
    routingChanged
      ? {
          label: "Routing",
          value: (
            <>
              <CodeInline>{comparison.baseline.routingDecision}</CodeInline>{" "}
              &rarr;{" "}
              <CodeInline>{comparison.candidate.routingDecision}</CodeInline>
            </>
          ),
          status: "changed",
        }
      : {
          label: "Routing",
          value: (
            <CodeInline>{comparison.baseline.routingDecision}</CodeInline>
          ),
          status: "unchanged",
        },
  );

  logicRows.push(
    reviewChanged
      ? {
          label: "Review gate",
          value: (
            <>
              <CodeInline>requiresHumanReview</CodeInline>{" "}
              {String(comparison.baseline.requiresHumanReview)} &rarr;{" "}
              {String(comparison.candidate.requiresHumanReview)}
            </>
          ),
          status: lostReview ? "regression" : "changed",
        }
      : {
          label: "Review gate",
          value: (
            <>
              <CodeInline>requiresHumanReview</CodeInline>{" "}
              {String(comparison.baseline.requiresHumanReview)}
            </>
          ),
          status: "unchanged",
        },
  );

  if (lostReview) {
    logicRows.push({
      label: "Why flagged",
      value: "Governance boundary moved",
      status: "regression",
    });
  }

  return (
    <div className="space-y-3">
      <header className="space-y-1 px-1">
        <h2 className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          <span>A</span>
          <span className="text-slate-300">&middot;</span>
          <span>Behavior diff</span>
        </h2>
        <p className="font-mono text-[11px] text-slate-500">
          {caseShort} path under each version
        </p>
      </header>
      <section
        aria-label="Behavior diff"
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="space-y-2.5">
          <PathRow
            rowLabel="Baseline"
            versionLabel={baselineLabel}
            steps={baselineSteps}
            verdict={baselineVerdict}
          />
          <PathRow
            rowLabel="Candidate"
            versionLabel={candidateLabel}
            steps={candidateSteps}
            verdict={candidateVerdict}
            candidate
          />
        </div>

        <div className="mt-5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Regression logic
          </span>
          <ul className="mt-1.5 rounded-md border border-slate-100 px-3">
            {logicRows.map((row, i) => (
              <RegressionLogicRow
                key={`${row.label}-${i}`}
                label={row.label}
                value={row.value}
                status={row.status}
              />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
