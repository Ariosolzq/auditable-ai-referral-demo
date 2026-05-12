import Link from "next/link";

const capabilities: string[] = [
  "Rule-first",
  "LLM-advisory",
  "Human-in-the-loop",
  "Audit + causation",
  "Replay before promotion",
];

export default function HeroSection() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Auditable AI-Assisted Referral Review Workflow
        </h1>
        <p className="text-base text-slate-600 sm:text-lg">
          A frontend-only interactive demo of a governed referral intake
          workflow. Built with safe mock data only &mdash; no real PHI, no real
          LLM API, no production systems.
        </p>
        <ul className="flex flex-wrap gap-1.5 pt-1">
          {capabilities.map((cap) => (
            <li
              key={cap}
              className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700"
            >
              {cap}
            </li>
          ))}
        </ul>
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
          <Link
            href="/cases/case-c"
            className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50/60 px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            Open Case C (recommended)
          </Link>
        </div>
      </div>
    </section>
  );
}
