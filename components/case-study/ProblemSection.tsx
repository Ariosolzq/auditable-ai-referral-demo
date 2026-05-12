export default function ProblemSection() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-slate-900">Problem</h2>
      <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
        <p>
          Referral intake often requires reviewing scattered evidence across
          documents, eligibility records, payer fields, and external sources.
          Manual review can be slow, inconsistent, and difficult to audit.
        </p>
        <blockquote className="rounded-md border-l-2 border-sky-300 bg-sky-50/60 px-3 py-2 text-sm text-slate-800">
          The problem is not simply lack of AI. The real problem is scattered
          evidence, inconsistent judgment, weak traceability, and limited
          replay capability.
        </blockquote>
      </div>
    </section>
  );
}
