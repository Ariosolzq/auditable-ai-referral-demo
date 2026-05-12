type Principle = { title: string; detail: string };

const principles: Principle[] = [
  {
    title: "Rule-first, LLM-advisory",
    detail:
      "The deterministic rule engine produces the preliminary decision; the LLM provides advisory output bound to evidence and never sets the final decision.",
  },
  {
    title: "Evidence-bound AI outputs",
    detail:
      "Every LLM summary, missing-field analysis, and risk flag carries supportingEvidenceIds referencing the evidence package.",
  },
  {
    title: "Human review as governance boundary",
    detail:
      "Reviewers confirm or override the rule decision; the human action is the final authority and is recorded in the audit trail.",
  },
  {
    title: "Replay before policy/prompt promotion",
    detail:
      "Policy and prompt version changes are compared against historical cases before promotion, surfacing rule, routing, and review-requirement deltas.",
  },
];

export default function DesignPrinciplesSection() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">
        Design Principles
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {principles.map((p, i) => (
          <div
            key={p.title}
            className="rounded-md border border-slate-200 bg-slate-50/70 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="text-sm font-semibold text-slate-900">
                {p.title}
              </h3>
            </div>
            <p className="text-sm text-slate-600">{p.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
