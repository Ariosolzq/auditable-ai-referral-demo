type ApproachRow = {
  num: number;
  stage: string;
  what: string;
  caseC: string;
};

const rows: ApproachRow[] = [
  {
    num: 1,
    stage: "Referral Metadata",
    what: "Intake fields normalized from the source system.",
    caseC: "skilled_nursing case from Internal Referral System.",
  },
  {
    num: 2,
    stage: "Evidence Package",
    what: "Documents, eligibility records, and portal fields assembled.",
    caseC: "5 evidence records linked, including lapsed eligibility.",
  },
  {
    num: 3,
    stage: "Deterministic Rule Evaluation",
    what: "Rules emit a preliminary decision and reason codes.",
    caseC: "Rule decision: REJECT on lapsed eligibility.",
  },
  {
    num: 4,
    stage: "Workflow Routing",
    what: "Policy maps rule output to the next workflow step.",
    caseC: "Routing: human_review_required by policy.",
  },
  {
    num: 5,
    stage: "Conditional LLM Advisory",
    what: "Evidence-bound observations when policy requires advisory.",
    caseC: "Risk flag: STALE_ELIGIBILITY_EVIDENCE.",
  },
  {
    num: 6,
    stage: "Human Review",
    what: "Reviewer confirms or overrides the rule decision.",
    caseC: "Reviewer can override REJECT to ACCEPT.",
  },
  {
    num: 7,
    stage: "Final Decision",
    what: "Recorded outcome with reviewer attribution.",
    caseC: "Final: ACCEPT with overrideFlag = true.",
  },
  {
    num: 8,
    stage: "Audit Trail + Replay Comparison",
    what: "Every event appended with causation; replayable.",
    caseC: "+3 audit events; replay diff vs policy_v2.",
  },
];

export default function SystemApproachSection() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">
        System Approach
      </h2>

      <div className="hidden grid-cols-[auto_1fr_1fr] gap-x-4 border-b border-slate-200 pb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
        <div>Stage</div>
        <div>What it does</div>
        <div>Case C example</div>
      </div>

      <ol className="divide-y divide-slate-100">
        {rows.map((row) => (
          <li
            key={row.stage}
            className="space-y-1 py-2 sm:grid sm:grid-cols-[auto_1fr_1fr] sm:gap-x-4 sm:space-y-0"
          >
            <div className="flex items-start gap-2 text-sm">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                {row.num}
              </span>
              <span className="pt-px font-medium text-slate-900">
                {row.stage}
              </span>
            </div>
            <div className="text-sm text-slate-700">{row.what}</div>
            <div className="text-sm text-slate-700">{row.caseC}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
