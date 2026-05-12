import type { ReferralCase } from "@/types/referral";
import CaseCard from "./CaseCard";

type CaseSelectorGridProps = {
  cases: ReferralCase[];
};

export default function CaseSelectorGrid({ cases }: CaseSelectorGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cases.map((c) => (
        <CaseCard key={c.id} caseData={c} />
      ))}
    </div>
  );
}
