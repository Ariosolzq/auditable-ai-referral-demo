const steps: string[] = [
  "Referral Metadata",
  "Evidence Package",
  "Deterministic Rule Evaluation",
  "Workflow Routing",
  "Conditional LLM Advisory",
  "Human Review",
  "Final Decision",
  "Audit Trail + Replay Comparison",
];

export default function SystemApproachSection() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">
        System Approach
      </h2>
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li
            key={step}
            className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-700"
          >
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
              {i + 1}
            </span>
            <span className="pt-px">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
