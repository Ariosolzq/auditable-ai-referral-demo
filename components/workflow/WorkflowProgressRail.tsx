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

type TileCopy = {
  phase: string;
  title: string;
  detail: string;
};

function buildTileCopy(
  caseData: ReferralCase,
  stages: RailStage[],
): TileCopy[] {
  const recordCount = caseData.evidenceRecords.length;
  return [
    {
      phase: "Input",
      title: "Evidence built",
      detail: `${recordCount} record${recordCount === 1 ? "" : "s"} · normalized`,
    },
    {
      phase: "Decision",
      title: "Rule decision",
      detail: stages[1].detail,
    },
    {
      phase: "Advisory",
      title: "LLM advisory",
      detail: stages[2].detail,
    },
    {
      phase: "Governance",
      title: "Human review",
      detail: stages[3].detail,
    },
    {
      phase: "Record",
      title: "Final decision",
      detail: stages[4].detail,
    },
  ];
}

function phaseBgClass(state: RailState): string {
  if (state === "active") return "bg-sky-50/70";
  if (state === "failed") return "bg-rose-50/40";
  return "";
}

function phaseLabelClass(state: RailState): string {
  if (state === "active") return "text-sky-700";
  if (state === "failed") return "text-rose-700";
  if (state === "pending" || state === "skipped") return "text-slate-400";
  return "text-slate-500";
}

function titleClass(state: RailState): string {
  if (state === "pending" || state === "skipped") return "text-slate-500";
  return "text-slate-900";
}

function detailClass(state: RailState): string {
  switch (state) {
    case "done":
      return "text-emerald-700";
    case "active":
      return "text-sky-800 font-semibold";
    case "pending":
      return "text-slate-400 italic";
    case "skipped":
      return "italic text-slate-400";
    case "failed":
      return "text-rose-700";
  }
}

type IconSpec = { glyph: string; toneClass: string; srLabel: string };

function stateIcon(state: RailState): IconSpec {
  switch (state) {
    case "done":
      return {
        glyph: "✓",
        toneClass: "bg-emerald-100 text-emerald-700",
        srLabel: "Done",
      };
    case "active":
      return {
        glyph: "●",
        toneClass: "bg-sky-600 text-white",
        srLabel: "Active",
      };
    case "pending":
      return {
        glyph: "○",
        toneClass: "bg-slate-100 text-slate-400",
        srLabel: "Pending",
      };
    case "skipped":
      return {
        glyph: "–",
        toneClass: "bg-slate-100 text-slate-400",
        srLabel: "Skipped",
      };
    case "failed":
      return {
        glyph: "✕",
        toneClass: "bg-rose-100 text-rose-700",
        srLabel: "Failed",
      };
  }
}

type Props = {
  caseData: ReferralCase;
};

export default function WorkflowProgressRail({ caseData }: Props) {
  const stages = deriveStages(caseData);
  const copy = buildTileCopy(caseData, stages);

  return (
    <section
      aria-label="Workflow phase progression"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
          Phase progression
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
          input → decision → advisory → governance → record
        </span>
      </header>
      <ol className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
        {stages.map((stage, i) => {
          const icon = stateIcon(stage.state);
          const isActive = stage.state === "active";
          return (
            <li
              key={copy[i].phase}
              className={`relative px-4 py-3 ${phaseBgClass(stage.state)}`}
            >
              <div className="flex items-center gap-2">
                <span
                  aria-label={icon.srLabel}
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${icon.toneClass}`}
                >
                  <span aria-hidden="true">{icon.glyph}</span>
                </span>
                <span
                  className={`font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ${phaseLabelClass(
                    stage.state,
                  )}`}
                >
                  0{i + 1} · {copy[i].phase}
                </span>
                {isActive && (
                  <span className="ml-auto inline-flex items-center rounded bg-sky-600 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
                    You are here
                  </span>
                )}
              </div>
              <p
                className={`mt-2 text-sm font-semibold leading-tight ${titleClass(stage.state)}`}
              >
                {copy[i].title}
              </p>
              <p
                className={`mt-0.5 font-mono text-[11px] leading-tight ${detailClass(stage.state)}`}
              >
                {copy[i].detail}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
