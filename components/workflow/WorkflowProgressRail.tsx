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

// Render-only mapping that produces the displayed copy for each tile.
// Reads from deriveStages output for case-specific details and from
// caseData.evidenceRecords.length for the Input tile's count.
// Does not change how stages are derived.
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

function tileClass(state: RailState): string {
  switch (state) {
    case "done":
      return "border-slate-200 bg-white";
    case "active":
      return "border-sky-500 bg-sky-50 ring-2 ring-sky-200";
    case "pending":
      return "border-slate-200 bg-slate-50/60";
    case "skipped":
      return "border-slate-200 bg-white";
    case "failed":
      return "border-rose-300 bg-rose-50/70";
  }
}

function phaseLabelClass(state: RailState): string {
  if (state === "pending" || state === "skipped") return "text-slate-400";
  if (state === "active") return "text-sky-700";
  if (state === "failed") return "text-rose-700";
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
      aria-label="Workflow progress"
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
    >
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {stages.map((stage, i) => {
          const icon = stateIcon(stage.state);
          const isActive = stage.state === "active";
          return (
            <li
              key={copy[i].phase}
              className={`relative rounded-md border p-3 ${tileClass(stage.state)}`}
            >
              {isActive && (
                <>
                  <span className="absolute -top-2.5 left-3 inline-flex items-center rounded bg-sky-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                    You are here
                  </span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-sky-500 bg-sky-50"
                  />
                </>
              )}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${phaseLabelClass(stage.state)}`}
                >
                  {i + 1}. {copy[i].phase}
                </span>
                <span
                  aria-label={icon.srLabel}
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${icon.toneClass}`}
                >
                  <span aria-hidden="true">{icon.glyph}</span>
                </span>
              </div>
              <p
                className={`mt-1.5 text-sm font-semibold leading-tight ${titleClass(stage.state)}`}
              >
                {copy[i].title}
              </p>
              <p className={`mt-1 text-xs leading-tight ${detailClass(stage.state)}`}>
                {copy[i].detail}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
