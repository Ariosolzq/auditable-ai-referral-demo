const boundaries: string[] = [
  "frontend-only",
  "no real PHI",
  "no real LLM API",
  "no production systems",
  "no real business decisions",
];

export default function BoundaryStrip() {
  return (
    <section
      aria-label="Mock demo boundaries"
      className="rounded-md border border-slate-200 border-l-4 border-l-amber-300 bg-white px-4 py-2 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-700">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Mock demo
        </span>
        {boundaries.map((item) => (
          <span
            key={item}
            className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-600"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
