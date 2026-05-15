type Accent = "slate" | "amber" | "sky";

type Tile = {
  index: number;
  title: string;
  body: string;
  accent: Accent;
};

const tiles: Tile[] = [
  {
    index: 1,
    title: "Rules decide",
    body: "Deterministic policy path.",
    accent: "amber",
  },
  {
    index: 2,
    title: "LLM advises",
    body: "Evidence-bound; no finalDecision write.",
    accent: "slate",
  },
  {
    index: 3,
    title: "Humans govern",
    body: "Reviewer confirms or overrides.",
    accent: "sky",
  },
  {
    index: 4,
    title: "Audit + replay verify",
    body: "Causation and promotion checks.",
    accent: "slate",
  },
];

function leftEdge(accent: Accent): string {
  if (accent === "amber") return "border-l-amber-300";
  if (accent === "sky") return "border-l-sky-300";
  return "border-l-slate-300";
}

function markerTone(accent: Accent): string {
  if (accent === "amber") return "bg-amber-100 text-amber-800";
  if (accent === "sky") return "bg-sky-100 text-sky-800";
  return "bg-slate-100 text-slate-700";
}

export default function GovernanceLens() {
  return (
    <aside
      aria-labelledby="governance-lens-heading"
      className="rounded-lg border border-slate-200 bg-slate-50/40 p-3.5"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="governance-lens-heading"
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700"
        >
          AI governance lens
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
          rule-first &middot; evidence-bound &middot; human-governed &middot;
          replayable
        </span>
      </div>
      <ol className="space-y-2">
        {tiles.map((tile) => (
          <li
            key={tile.index}
            className={`rounded-md border border-slate-200 border-l-4 bg-white px-3 py-2 ${leftEdge(
              tile.accent,
            )}`}
          >
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[11px] font-semibold ${markerTone(
                  tile.accent,
                )}`}
              >
                {tile.index}
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                {tile.title}
              </span>
            </div>
            <p className="mt-1 text-xs leading-snug text-slate-600">
              {tile.body}
            </p>
          </li>
        ))}
      </ol>
    </aside>
  );
}
