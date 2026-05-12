import DemoWalkthroughSection from "@/components/case-study/DemoWalkthroughSection";
import DesignPrinciplesSection from "@/components/case-study/DesignPrinciplesSection";
import HeroSection from "@/components/case-study/HeroSection";
import ProblemSection from "@/components/case-study/ProblemSection";
import SystemApproachSection from "@/components/case-study/SystemApproachSection";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <HeroSection />

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Mock demo boundaries
        </h2>
        <ul className="space-y-1 text-sm text-slate-700">
          <li>This is a frontend-only mock demo.</li>
          <li>It does not process real PHI.</li>
          <li>It does not call real LLM APIs.</li>
          <li>It does not connect to production systems.</li>
          <li>It does not make real business decisions.</li>
        </ul>
      </section>

      <ProblemSection />
      <SystemApproachSection />
      <DesignPrinciplesSection />
      <DemoWalkthroughSection />

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          What This Demo Shows
        </h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
          <li>
            Case selector that opens a workflow workspace for each mock case.
          </li>
          <li>
            Evidence chip highlighting: clicking a rule reason or LLM advisory
            chip surfaces its supporting evidence in the evidence package.
          </li>
          <li>
            Audit event payload selection: clicking an audit row updates the
            payload preview with that event&apos;s metadata and JSON payload.
          </li>
          <li>
            Review submit and reset driven by a local reducer; submission
            appends HumanReviewSubmitted, optionally HumanOverrideSubmitted,
            and FinalDecisionRecorded events and updates the final decision.
          </li>
          <li>
            Replay comparison page surfacing rule, routing, and
            review-requirement deltas under candidate policy/prompt versions.
          </li>
        </ul>
      </section>
    </div>
  );
}
