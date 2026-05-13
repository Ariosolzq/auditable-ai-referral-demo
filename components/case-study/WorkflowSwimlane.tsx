import { Fragment } from "react";

type LaneKey = "system" | "llm" | "human";

type Step = {
  num: number;
  label: string;
  lane: LaneKey;
  caption: string;
};

const steps: Step[] = [
  { num: 1, label: "Referral metadata", lane: "system", caption: "intake in" },
  { num: 2, label: "Evidence package", lane: "system", caption: "normalized" },
  { num: 3, label: "Rule decision", lane: "system", caption: "deterministic" },
  { num: 4, label: "Routing", lane: "system", caption: "policy decides" },
  {
    num: 5,
    label: "LLM advisory",
    lane: "llm",
    caption: "evidence-bound",
  },
  {
    num: 6,
    label: "Human review",
    lane: "human",
    caption: "confirm / override",
  },
  { num: 7, label: "Final decision", lane: "system", caption: "recorded" },
  {
    num: 8,
    label: "Audit + Replay",
    lane: "system",
    caption: "causation · diff",
  },
];

type Lane = { key: LaneKey; name: string; bandClass: string };

const lanes: Lane[] = [
  { key: "system", name: "System", bandClass: "bg-slate-50" },
  { key: "llm", name: "LLM", bandClass: "bg-slate-100/60" },
  { key: "human", name: "Human", bandClass: "bg-sky-50/60" },
];

const principles: string[] = [
  "Rule-first",
  "Evidence-bound",
  "Human-governed",
  "Replay before promotion",
];

function laneRowIndex(lane: LaneKey): number {
  // Row 1 is the header. Rows 2, 3, 4 are the lanes.
  return lanes.findIndex((l) => l.key === lane) + 2;
}

function nodeStyles(step: Step): string {
  if (step.num === 3) return "border-amber-500 ring-2 ring-amber-100";
  if (step.num === 6) return "border-sky-600 ring-2 ring-sky-100";
  if (step.lane === "llm") return "border-slate-400";
  return "border-slate-300";
}

function NodeBox({ step }: { step: Step }) {
  return (
    <div
      className={`relative mx-auto flex w-full max-w-[150px] flex-col items-center gap-0.5 rounded-md border bg-white px-2 py-1.5 text-center shadow-sm ${nodeStyles(
        step,
      )}`}
    >
      <span className="text-[11px] font-semibold leading-tight text-slate-900">
        {step.label}
      </span>
      <span className="text-[10px] leading-tight text-slate-500">
        {step.caption}
      </span>
    </div>
  );
}

function laneBadgeClass(lane: LaneKey): string {
  if (lane === "human") return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  if (lane === "llm")
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function LaneBadge({ lane }: { lane: LaneKey }) {
  const label = lane === "llm" ? "LLM" : lane === "human" ? "Human" : "System";
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${laneBadgeClass(
        lane,
      )}`}
    >
      {label}
    </span>
  );
}

export default function WorkflowSwimlane() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          System approach
        </h2>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          one diagram &middot; eight steps &middot; two boundaries
        </p>
      </div>

      {/* Desktop swimlane (md+) */}
      <div
        role="img"
        aria-label="Workflow swimlane: System, LLM, and Human lanes across eight steps from referral metadata through evidence, rule decision, routing, LLM advisory, human review, final decision, to audit and replay. Steps 3 and 4 sit inside a rule decision boundary. Step 6 sits inside a governance boundary."
        className="hidden overflow-hidden rounded-md border border-slate-200 bg-white md:block"
      >
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: "minmax(76px, auto) repeat(8, minmax(0, 1fr))",
            gridTemplateRows: "auto repeat(3, 92px)",
          }}
        >
          {/* HEADER row, col 1: stage label */}
          <div
            className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"
            style={{ gridColumn: "1 / 2", gridRow: "1 / 2" }}
          >
            Stage
          </div>

          {/* HEADER row: step numbers 01-08 */}
          {steps.map((step, i) => (
            <div
              key={`h-${step.num}`}
              className="relative border-b border-slate-200 bg-slate-50 px-2 py-2 text-center"
              style={{ gridColumn: `${i + 2} / ${i + 3}`, gridRow: "1 / 2" }}
            >
              <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                0{step.num}
              </span>
              <span className="mt-0.5 block text-[11px] font-semibold leading-tight text-slate-700">
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1.5 top-1/2 z-30 -translate-y-1/2 rounded-full bg-slate-50 px-0.5 text-[14px] leading-none text-slate-400"
                >
                  &rarr;
                </span>
              )}
            </div>
          ))}

          {/* LANE BANDS: lane label cell + full-width band per lane (behind everything) */}
          {lanes.map((lane, idx) => (
            <Fragment key={`band-${lane.key}`}>
              <div
                className={`flex items-center px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 ${lane.bandClass}`}
                style={{
                  gridColumn: "1 / 2",
                  gridRow: `${idx + 2} / ${idx + 3}`,
                }}
              >
                {lane.name}
              </div>
              <div
                aria-hidden="true"
                className={`relative ${lane.bandClass}`}
                style={{
                  gridColumn: "2 / 10",
                  gridRow: `${idx + 2} / ${idx + 3}`,
                }}
              >
                {/* faint horizontal rail through the lane band */}
                <span className="pointer-events-none absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-slate-300/70" />
              </div>
            </Fragment>
          ))}

          {/* NODES: one per step at (lane row, step col), explicit placement so no auto-placement */}
          {steps.map((step, i) => (
            <div
              key={`n-${step.num}`}
              className="relative z-10 flex items-center justify-center px-2"
              style={{
                gridColumn: `${i + 2} / ${i + 3}`,
                gridRow: `${laneRowIndex(step.lane)} / ${
                  laneRowIndex(step.lane) + 1
                }`,
              }}
            >
              <NodeBox step={step} />
            </div>
          ))}

          {/* BOUNDARY OVERLAYS: explicit placement, transparent center, span all three lane rows */}
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-20 m-1 rounded border-2 border-dashed border-amber-400"
            style={{ gridColumn: "4 / 6", gridRow: "2 / 5" }}
          >
            <span className="absolute -top-2.5 left-2 inline-flex items-center rounded border border-amber-400 bg-white px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-700">
              Rule decision boundary
            </span>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-20 m-1 rounded border-2 border-dashed border-sky-500"
            style={{ gridColumn: "7 / 8", gridRow: "2 / 5" }}
          >
            <span className="absolute -top-2.5 left-2 inline-flex items-center rounded border border-sky-500 bg-white px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-sky-700">
              Governance boundary
            </span>
          </div>
        </div>
      </div>

      {/* MOBILE (below md): simple vertical stack with boundary markers between steps */}
      <ol className="space-y-2 md:hidden" aria-label="Workflow steps">
        {steps.map((step) => {
          const boundaryMarker =
            step.num === 3
              ? {
                  text: "Rule decision boundary ↓",
                  style: "border-amber-400 text-amber-700",
                }
              : step.num === 6
                ? {
                    text: "Governance boundary ↓",
                    style: "border-sky-500 text-sky-700",
                  }
                : null;
          const stepBorder =
            step.num === 3 || step.num === 4
              ? "border-amber-300"
              : step.num === 6
                ? "border-sky-300"
                : "border-slate-200";
          return (
            <Fragment key={`m-${step.num}`}>
              {boundaryMarker && (
                <li
                  aria-hidden="true"
                  className={`rounded border border-dashed bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${boundaryMarker.style}`}
                >
                  {boundaryMarker.text}
                </li>
              )}
              <li
                className={`flex items-start gap-3 rounded-md border bg-white px-3 py-2 shadow-sm ${stepBorder}`}
              >
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                  {step.num}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {step.label}
                    </span>
                    <LaneBadge lane={step.lane} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {step.caption}
                  </p>
                </div>
              </li>
            </Fragment>
          );
        })}
      </ol>

      {/* Reliability principles + boundary legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Reliability
        </span>
        {principles.map((p) => (
          <span
            key={p}
            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700"
          >
            {p}
          </span>
        ))}
        <span className="ml-auto hidden items-center gap-3 text-[11px] text-slate-500 sm:inline-flex">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-3.5 rounded-sm border border-dashed border-amber-400"
            />
            rule decision
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-3.5 rounded-sm border border-dashed border-sky-500"
            />
            governance
          </span>
        </span>
      </div>
    </section>
  );
}
