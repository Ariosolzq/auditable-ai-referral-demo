import type { ReferralCase } from "@/types/referral";
import CaseCard from "./CaseCard";

type CaseSelectorGridProps = {
  cases: ReferralCase[];
};

export default function CaseSelectorGrid({ cases }: CaseSelectorGridProps) {
  const featured = cases.find((c) => c.id === "case-c");
  const others = cases.filter((c) => c.id !== "case-c");

  // Fallback: if case-c is not present, render the existing flat grid.
  if (!featured) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => (
          <CaseCard key={c.id} caseData={c} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="featured-case-heading" className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <h2
            id="featured-case-heading"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Recommended walkthrough
          </h2>
        </div>
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50/40 p-1">
          <CaseCard caseData={featured} />
        </div>
      </section>

      <section aria-labelledby="other-cases-heading" className="space-y-2">
        <h2
          id="other-cases-heading"
          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Other cases
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {others.map((c) => (
            <CaseCard key={c.id} caseData={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
