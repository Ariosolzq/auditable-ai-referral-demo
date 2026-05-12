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
      <ol className="space-y-2 text-sm text-slate-700">
        {steps.map((step, i) => (
          <li key={step} className="flex items-start gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
