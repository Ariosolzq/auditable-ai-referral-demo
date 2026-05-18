import type { ReactNode } from "react";
import type { ReplayCaseComparison } from "@/types/replay";

type Props = {
  comparison: ReplayCaseComparison;
};

type NodeTone = "neutral" | "amber" | "rose";

function shortCaseName(title: string): string {
  const [head] = title.split(":");
  return head.trim();
}

function ruleVerb(decision: string): string {
  if (decision === "REJECT") return "rejects";
  if (decision === "ACCEPT") return "accepts";
  return "evaluates";
}

function humanizeRouting(routing: string): string {
  switch (routing) {
    case "human_review_required":
      return "Human Review Gate";
    case "needs_more_evidence":
      return "Needs more evidence";
    case "auto_accept":
      return "Auto accept";
    default:
      return routing;
  }
}

function PathNode({
  label,
  sublabel,
  tone,
}: {
  label: string;
  sublabel?: string;
  tone: NodeTone;
}) {
  const toneClass =
    tone === "rose"
      ? "border-rose-300 bg-rose-50 text-rose-900"
      : tone === "amber"
        ? "border-amber-300 bg-amber-50 text-amber-900"
        : "border-slate-200 bg-white text-slate-800";
  const sublabelTone =
    tone === "rose"
      ? "text-rose-700"
      : tone === "amber"
        ? "text-amber-700"
        : "text-slate-500";
  return (
    <div
      className={`flex min-w-[9rem] flex-1 flex-col items-start gap-0.5 rounded-md border px-3 py-2 ${toneClass}`}
    >
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
      {sublabel && (
        <span className={`text-[10px] leading-tight ${sublabelTone}`}>
          {sublabel}
        </span>
      )}
    </div>
  );
}

function PathArrow() {
  return (
    <span
      aria-hidden="true"
      className="hidden shrink-0 select-none text-slate-400 sm:inline"
    >
      →
    </span>
  );
}

type PathStep = {
  label: string;
  sublabel?: string;
  tone: NodeTone;
};

function PathRow({
  rowLabel,
  versionLabel,
  steps,
}: {
  rowLabel: string;
  versionLabel: string;
  steps: PathStep[];
}) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50/60 p-2.5">
      <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {rowLabel}
        </span>
        <code className="font-mono text-[10px] text-slate-500">
          {versionLabel}
        </code>
      </div>
      <div className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:gap-2">
        {steps.map((step, idx) => (
          <div
            key={`${rowLabel}-${idx}`}
            className="flex items-center gap-2 sm:contents"
          >
            <PathNode
              label={step.label}
              sublabel={step.sublabel}
              tone={step.tone}
            />
            {idx < steps.length - 1 && <PathArrow />}
          </div>
        ))}
      </div>
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="font-mono text-[12px] text-slate-700">{children}</code>
  );
}

function WhyRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone: NodeTone;
}) {
  const dotColor =
    tone === "rose"
      ? "bg-rose-400"
      : tone === "amber"
        ? "bg-amber-400"
        : "bg-slate-300";
  return (
    <li className="flex items-start gap-2 rounded-md border border-slate-100 bg-slate-50/60 px-3 py-1.5">
      <span
        aria-hidden="true"
        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`}
      />
      <div className="flex flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-xs font-semibold text-slate-700">{label}:</span>
        <span className="text-xs text-slate-700">{value}</span>
      </div>
    </li>
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

  const baselineSteps: PathStep[] = [
    {
      label: `Rule ${ruleVerb(comparison.baseline.ruleDecision)} case`,
      tone: "neutral",
    },
    {
      label: humanizeRouting(comparison.baseline.routingDecision),
      sublabel: comparison.baseline.routingDecision,
      tone: "neutral",
    },
    {
      label: comparison.baseline.requiresHumanReview
        ? "Reviewer controls final decision"
        : "No human review required",
      tone: "neutral",
    },
  ];

  const candidateRuleLabel = ruleChanged
    ? `Rule now ${ruleVerb(comparison.candidate.ruleDecision)} case`
    : `Rule still ${ruleVerb(comparison.candidate.ruleDecision)} case`;

  const candidateLastLabel = lostReview
    ? "Human review is no longer immediate"
    : comparison.candidate.requiresHumanReview
      ? "Reviewer controls final decision"
      : "No human review required";

  const candidateSteps: PathStep[] = [
    { label: candidateRuleLabel, tone: "neutral" },
    {
      label: humanizeRouting(comparison.candidate.routingDecision),
      sublabel: comparison.candidate.routingDecision,
      tone: routingChanged ? "amber" : "neutral",
    },
    {
      label: candidateLastLabel,
      tone: reviewChanged && lostReview ? "rose" : "neutral",
    },
  ];

  const ruleRow: { label: string; value: ReactNode; tone: NodeTone } =
    ruleChanged
      ? {
          label: "Rule changed",
          value: (
            <>
              {comparison.baseline.ruleDecision} →{" "}
              {comparison.candidate.ruleDecision}
            </>
          ),
          tone: "amber",
        }
      : {
          label: "Rule did not change",
          value: `${comparison.baseline.ruleDecision} stayed ${comparison.baseline.ruleDecision}`,
          tone: "neutral",
        };

  const routingRow: { label: string; value: ReactNode; tone: NodeTone } =
    routingChanged
      ? {
          label: "Governance path changed",
          value: (
            <>
              <Code>{comparison.baseline.routingDecision}</Code> →{" "}
              <Code>{comparison.candidate.routingDecision}</Code>
            </>
          ),
          tone: "amber",
        }
      : {
          label: "Governance path unchanged",
          value: <Code>{comparison.baseline.routingDecision}</Code>,
          tone: "neutral",
        };

  const reviewRow: { label: string; value: ReactNode; tone: NodeTone } =
    reviewChanged
      ? {
          label: "Review gate changed",
          value: (
            <>
              <Code>requiresHumanReview</Code>{" "}
              {comparison.baseline.requiresHumanReview ? "true" : "false"} →{" "}
              {comparison.candidate.requiresHumanReview ? "true" : "false"}
            </>
          ),
          tone: lostReview ? "rose" : "amber",
        }
      : {
          label: "Review gate unchanged",
          value: (
            <>
              <Code>requiresHumanReview</Code>{" "}
              {comparison.baseline.requiresHumanReview ? "true" : "false"}
            </>
          ),
          tone: "neutral",
        };

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
        <div className="space-y-2">
          <PathRow
            rowLabel="Baseline"
            versionLabel={baselineLabel}
            steps={baselineSteps}
          />
          <PathRow
            rowLabel="Candidate"
            versionLabel={candidateLabel}
            steps={candidateSteps}
          />
        </div>

        <div className="mt-4">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Regression logic
          </span>
          <ul className="mt-1.5 space-y-1.5">
            <WhyRow
              label={ruleRow.label}
              value={ruleRow.value}
              tone={ruleRow.tone}
            />
            <WhyRow
              label={routingRow.label}
              value={routingRow.value}
              tone={routingRow.tone}
            />
            <WhyRow
              label={reviewRow.label}
              value={reviewRow.value}
              tone={reviewRow.tone}
            />
          </ul>
        </div>
      </section>
    </div>
  );
}
