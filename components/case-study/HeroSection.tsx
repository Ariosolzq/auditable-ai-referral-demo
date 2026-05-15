import Link from "next/link";
import GovernanceLens from "./GovernanceLens";

export default function HeroSection() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 sm:p-7">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="space-y-5 lg:col-span-7">
          <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-8 rounded-full bg-amber-300"
            />
            Case study &middot; frontend-only demo
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[40px] sm:leading-[1.05]">
            A governed workflow for AI-assisted referral review.
            <span className="block text-slate-500 sm:mt-1">Not a chatbot.</span>
          </h1>
          <p className="text-base text-slate-600 sm:text-lg">
            Rules decide. LLM advises. Humans govern. Audit and replay make
            every decision traceable before promotion.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/cases/case-c"
              className="inline-flex items-center rounded-md bg-slate-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-amber-400/70 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              Open Case C
              <span className="ml-2 rounded bg-amber-300 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900">
                recommended
              </span>
            </Link>
            <Link
              href="/replay"
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              View Replay Gate
            </Link>
            <a
              href="https://github.com/Ariosolzq/auditable-ai-referral-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md px-2 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              GitHub repo &rarr;
            </a>
          </div>
          <div className="border-l-2 border-slate-200 bg-slate-50/40 px-3 py-2 text-sm leading-snug text-slate-600">
            <span className="mr-2 align-middle font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Referral
            </span>
            <span className="align-middle">
              &middot; incoming healthcare request checked against eligibility,
              payer, authorization, and documents.
            </span>
          </div>
        </div>
        <div className="lg:col-span-5">
          <GovernanceLens />
        </div>
      </div>
    </section>
  );
}
