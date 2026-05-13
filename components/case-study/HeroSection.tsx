import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="max-w-3xl space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Case study &middot; frontend-only demo
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[40px] sm:leading-[1.05]">
          Auditable AI-assisted referral review
          <span className="block text-slate-500 sm:mt-1">
            &mdash; drawn as a workflow.
          </span>
        </h1>
        <p className="text-base text-slate-600 sm:text-lg">
          Rules decide. The LLM advises against bound evidence. A human reviewer
          governs the final decision. Every step is audited; every policy and
          prompt change is replayed before promotion.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/cases/case-c"
            className="inline-flex items-center rounded-md bg-slate-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-amber-400/70 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            Open Case C
            <span className="ml-2 rounded bg-amber-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900">
              recommended
            </span>
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            View demo
          </Link>
          <Link
            href="/replay"
            className="inline-flex items-center rounded-md px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            View replay &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
