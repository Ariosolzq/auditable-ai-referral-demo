import DemoWalkthroughSection from "@/components/case-study/DemoWalkthroughSection";
import DesignPrinciplesSection from "@/components/case-study/DesignPrinciplesSection";
import HeroSection from "@/components/case-study/HeroSection";
import ProblemSection from "@/components/case-study/ProblemSection";
import SystemApproachSection from "@/components/case-study/SystemApproachSection";

const boundaryLines: string[] = [
  "This is a frontend-only mock demo.",
  "It does not process real PHI.",
  "It does not call real LLM APIs.",
  "It does not connect to production systems.",
  "It does not make real business decisions.",
];

const demoShows: string[] = [
  "Case selector that opens a workflow workspace for each mock case.",
  "Evidence chip highlighting: clicking a rule reason or LLM advisory chip surfaces its supporting evidence in the evidence package.",
  "Audit event payload selection: clicking an audit row updates the payload preview with that event's metadata and JSON payload.",
  "Review submit and reset driven by a local reducer; submission appends HumanReviewSubmitted, optionally HumanOverrideSubmitted, and FinalDecisionRecorded events and updates the final decision.",
  "Replay comparison page surfacing rule, routing, and review-requirement deltas under candidate policy/prompt versions.",
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <HeroSection />

      <section className="rounded-lg border border-slate-200 border-l-4 border-l-amber-300 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Mock demo boundaries
        </h2>
        <ul className="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
          {boundaryLines.map((line) => (
            <li
              key={line}
              className="rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2"
            >
              {line}
            </li>
          ))}
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
        <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-slate-700 sm:grid-cols-2">
          {demoShows.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-slate-400"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
