import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Auditable AI-Assisted Referral Review Workflow
        </h1>
        <p className="text-slate-700">
          A frontend-only interactive demo of a governed referral intake
          workflow. Built with safe mock data only &mdash; no real PHI, no real
          LLM API, no production systems.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/demo"
            className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            View Demo
          </Link>
          <Link
            href="/replay"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            View Replay Comparison
          </Link>
        </div>
      </div>
    </section>
  );
}
