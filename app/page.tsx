export default function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Auditable AI Referral Review Demo
      </h1>
      <p className="text-slate-600">
        Frontend-only mock demo. No real PHI, no real LLM API, no production
        systems. The full landing page is built in a later phase.
      </p>
      <p className="text-sm text-slate-500">
        Phase 0 placeholder &mdash; routes: <code>/</code>, <code>/demo</code>,{" "}
        <code>/cases/[caseId]</code>, <code>/replay</code>.
      </p>
    </section>
  );
}
