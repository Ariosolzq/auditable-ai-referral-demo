import type { ReferralCase } from "@/types/referral";

type RailState = "done" | "active" | "pending" | "skipped" | "failed";

type RailStage = {
  label: string;
  state: RailState;
  detail: string;
};

function deriveStages(caseData: ReferralCase): RailStage[] {
  const stages: RailStage[] = [];

  stages.push({ label: "Intake", state: "done", detail: "ready" });

  const hasRule = caseData.auditEvents.some(
    (e) => e.eventType === "RuleDecisionGenerated",
  );
  stages.push(
    hasRule
      ? {
          label: "Rule",
          state: "done",
          detail: caseData.ruleEvaluation.decision,
        }
      : { label: "Rule", state: "pending", detail: "—" },
  );

  const llmStatus = caseData.llmAdvisory.status;
  if (llmStatus === "skipped") {
    stages.push({ label: "LLM", state: "skipped", detail: "skipped" });
  } else if (llmStatus === "generated") {
    stages.push({ label: "LLM", state: "done", detail: "generated" });
  } else {
    stages.push({ label: "LLM", state: "failed", detail: "failed" });
  }

  const reviewStatus = caseData.humanReview.status;
  if (reviewStatus === "not_required") {
    stages.push({
      label: "Review",
      state: "skipped",
      detail: "not_required",
    });
  } else if (reviewStatus === "submitted") {
    stages.push({ label: "Review", state: "done", detail: "submitted" });
  } else {
    stages.push({ label: "Review", state: "active", detail: reviewStatus });
  }

  stages.push(
    caseData.finalDecision
      ? {
          label: "Final",
          state: "done",
          detail: caseData.finalDecision.decision,
        }
      : { label: "Final", state: "pending", detail: "pending" },
  );

  return stages;
}

function dotClass(state: RailState): string {
  switch (state) {
    case "done":
      return "bg-emerald-500";
    case "active":
      return "bg-amber-500";
    case "pending":
      return "bg-slate-300";
    case "skipped":
      return "bg-slate-300 opacity-60";
    case "failed":
      return "bg-rose-500";
  }
}

function detailToneClass(state: RailState): string {
  switch (state) {
    case "done":
      return "text-emerald-700";
    case "active":
      return "text-amber-700";
    case "pending":
      return "text-slate-500";
    case "skipped":
      return "italic text-slate-500";
    case "failed":
      return "text-rose-700";
  }
}

type Props = {
  caseData: ReferralCase;
};

export default function WorkflowProgressRail({ caseData }: Props) {
  const stages = deriveStages(caseData);

  return (
    <section
      aria-label="Workflow progress"
      className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {stages.map((stage, i) => (
          <li key={stage.label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${dotClass(stage.state)}`}
            />
            <span className="flex items-baseline gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {stage.label}
              </span>
              <span className={`text-xs ${detailToneClass(stage.state)}`}>
                {stage.detail}
              </span>
            </span>
            {i < stages.length - 1 && (
              <span aria-hidden="true" className="px-1 text-slate-300">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
