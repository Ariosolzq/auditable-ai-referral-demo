type BandTone = "human" | "llm" | "system";

type Chip = {
  label: string;
  code?: string;
  strong?: boolean;
};

type Band = {
  tone: BandTone;
  role: string;
  claim: string;
  chips: Chip[];
};

const bands: Band[] = [
  {
    tone: "human",
    role: "Human reviewer",
    claim: "Owns the decision",
    chips: [
      { label: "confirm / override", strong: true },
      { label: "write", code: "finalDecision", strong: true },
      { label: "accountability" },
    ],
  },
  {
    tone: "llm",
    role: "LLM advisory",
    claim: "Creates review context",
    chips: [
      { label: "evidence summary", strong: true },
      { label: "risk flags", strong: true },
      { label: "missing fields", strong: true },
      { label: "reviewer notes" },
      { label: "evidence-bound" },
    ],
  },
  {
    tone: "system",
    role: "System",
    claim: "Controls the workflow",
    chips: [
      { label: "evidence package", strong: true },
      { label: "deterministic rules", strong: true },
      { label: "policy routing", strong: true },
      { label: "audit / replay" },
    ],
  },
];

function bandStripe(tone: BandTone): string {
  if (tone === "human") return "border-sky-200 before:bg-sky-300";
  if (tone === "llm") return "border-violet-200 before:bg-violet-300";
  return "border-amber-200 before:bg-amber-300";
}

function roleLabelColor(tone: BandTone): string {
  if (tone === "human") return "text-sky-800";
  if (tone === "llm") return "text-violet-800";
  return "text-amber-800";
}

function strongChipTone(tone: BandTone): string {
  if (tone === "human") return "border-sky-200 bg-sky-50 text-sky-800";
  if (tone === "llm") return "border-violet-200 bg-violet-50 text-violet-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

export default function LlmRoleStack() {
  return (
    <section
      aria-labelledby="llm-role-stack-title"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:px-6 sm:pb-5 sm:pt-6"
    >
      <header className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="llm-role-stack-title"
            className="text-lg font-semibold tracking-tight text-slate-900 sm:text-[19px]"
          >
            Where the LLM adds value
          </h2>
          <p className="mt-1.5 max-w-[56ch] text-sm leading-snug text-slate-500">
            LLM turns scattered evidence into review-ready context; humans still
            own the decision.
          </p>
        </div>
        <span
          aria-hidden="true"
          className="inline-flex items-center gap-1 self-start rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"
        >
          Authority <span className="text-slate-400">&uarr;</span>
          <span className="text-slate-300">&middot;</span>
          Execution <span className="text-slate-400">&darr;</span>
        </span>
      </header>

      <div className="grid gap-2">
        {bands.map((band) => (
          <article
            key={band.tone}
            aria-label={band.role}
            className={`relative grid grid-cols-1 items-center gap-3 overflow-hidden rounded-lg border bg-white py-3.5 pl-5 pr-4 before:absolute before:inset-y-0 before:left-0 before:w-1 sm:grid-cols-[200px_1fr] sm:gap-6 ${bandStripe(band.tone)}`}
          >
            <div className="border-b border-dashed border-slate-200 pb-2.5 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
              <span
                className={`block font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] ${roleLabelColor(
                  band.tone,
                )}`}
              >
                {band.role}
              </span>
              <span className="mt-0.5 block text-[15px] font-semibold leading-tight tracking-tight text-slate-900">
                {band.claim}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {band.chips.map((chip) => {
                const base =
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs leading-tight";
                const tone = chip.strong
                  ? `${strongChipTone(band.tone)} font-semibold`
                  : "border-slate-200 bg-white font-medium text-slate-700";
                return (
                  <span
                    key={`${chip.label}-${chip.code ?? ""}`}
                    className={`${base} ${tone}`}
                  >
                    <span>{chip.label}</span>
                    {chip.code && (
                      <code className="font-mono text-[11px] text-slate-900">
                        {chip.code}
                      </code>
                    )}
                  </span>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <p className="mt-3.5 flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm leading-snug text-amber-900">
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border-[1.5px] border-amber-700 font-mono text-[10px] font-bold text-amber-700"
        >
          !
        </span>
        <span>
          <b className="font-semibold">LLM accelerates review;</b> it does not
          control routing, write{" "}
          <code className="rounded-sm border border-amber-200 bg-white/60 px-1 font-mono text-[11px] text-amber-900">
            finalDecision
          </code>
          , or bypass human governance.
        </span>
      </p>
    </section>
  );
}
