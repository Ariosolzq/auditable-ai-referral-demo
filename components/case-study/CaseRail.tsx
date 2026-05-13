import Link from "next/link";

type DecisionTone =
  | "accept"
  | "reject"
  | "review"
  | "pending"
  | "override"
  | "skipped"
  | "advisory";

type Decision = { label: string; tone: DecisionTone };

type Triple = {
  rule: Decision;
  llm: Decision;
  final: Decision;
};

type CaseEntry = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  triple: Triple;
};

const caseC: CaseEntry = {
  id: "case-c",
  title: "Case C",
  subtitle: "Rule REJECT → human override",
  description:
    "Rule rejects on lapsed eligibility. Policy requires human confirmation before finalizing. Reviewer can override to ACCEPT — override and final-decision events would then be appended to the audit trail.",
  triple: {
    rule: { label: "REJECT", tone: "reject" },
    llm: { label: "advisory", tone: "advisory" },
    final: { label: "pending → override ACCEPT", tone: "override" },
  },
};

const otherCases: CaseEntry[] = [
  {
    id: "case-a",
    title: "Case A",
    subtitle: "Low-risk auto-accept",
    description:
      "Rule produces ACCEPT with auto_accept routing. LLM advisory is skipped. No human review required.",
    triple: {
      rule: { label: "ACCEPT", tone: "accept" },
      llm: { label: "skipped", tone: "skipped" },
      final: { label: "ACCEPT", tone: "accept" },
    },
  },
  {
    id: "case-b",
    title: "Case B",
    subtitle: "Missing physician order → human review",
    description:
      "Missing physician order triggers NEEDS_REVIEW. Evidence-bound LLM advisory accompanies the case. Reviewer confirms or overrides.",
    triple: {
      rule: { label: "NEEDS_REVIEW", tone: "review" },
      llm: { label: "advisory", tone: "advisory" },
      final: { label: "pending", tone: "pending" },
    },
  },
];

function decisionToneClass(tone: DecisionTone): string {
  switch (tone) {
    case "accept":
      return "text-emerald-700";
    case "reject":
      return "text-amber-800";
    case "override":
      return "text-amber-800";
    case "review":
      return "text-slate-800";
    case "pending":
      return "text-slate-500";
    case "skipped":
      return "text-slate-500";
    case "advisory":
      return "text-slate-700";
    default:
      return "text-slate-700";
  }
}

function DecisionTriple({
  triple,
  dense = false,
}: {
  triple: Triple;
  dense?: boolean;
}) {
  const valueSize = dense ? "text-[11px]" : "text-xs sm:text-[13px]";
  const padding = dense ? "px-2 py-1.5" : "px-2.5 py-2";
  return (
    <dl className="grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className={padding}>
        <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Rule
        </dt>
        <dd
          className={`mt-0.5 font-semibold ${valueSize} ${decisionToneClass(triple.rule.tone)}`}
        >
          {triple.rule.label}
        </dd>
      </div>
      <div className={padding}>
        <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          LLM
        </dt>
        <dd
          className={`mt-0.5 font-semibold ${valueSize} ${decisionToneClass(triple.llm.tone)}`}
        >
          {triple.llm.label}
        </dd>
      </div>
      <div className={padding}>
        <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Final
        </dt>
        <dd
          className={`mt-0.5 font-semibold ${valueSize} ${decisionToneClass(triple.final.tone)}`}
        >
          {triple.final.label}
        </dd>
      </div>
    </dl>
  );
}

export default function CaseRail() {
  return (
    <section className="space-y-4" aria-label="Walkthrough cases">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Walkthrough cases
        </h2>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          start with Case C
        </p>
      </div>

      {/* Featured Case C */}
      <Link
        href={`/cases/${caseC.id}`}
        aria-label={`Open ${caseC.title}: ${caseC.subtitle} (recommended walkthrough)`}
        className="relative block rounded-lg border-2 border-amber-300 bg-amber-50/40 p-4 shadow-sm transition hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 sm:p-5"
      >
        <span className="absolute -top-2.5 left-4 inline-flex items-center rounded border border-amber-300 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
          Recommended walkthrough
        </span>
        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr] sm:items-start">
          <div>
            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
              {caseC.title}
              <span className="ml-2 font-normal text-slate-500">
                &middot; {caseC.subtitle}
              </span>
            </h3>
            <p className="mt-1.5 text-sm text-slate-700">{caseC.description}</p>
          </div>
          <DecisionTriple triple={caseC.triple} />
        </div>
      </Link>

      {/* Other cases */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Other cases
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {otherCases.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              aria-label={`Open ${c.title}: ${c.subtitle}`}
              className="block rounded-md border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {c.title}
                <span className="ml-1.5 font-normal text-slate-500">
                  &middot; {c.subtitle}
                </span>
              </h3>
              <p className="mt-1 text-xs text-slate-600">{c.description}</p>
              <div className="mt-2.5">
                <DecisionTriple triple={c.triple} dense />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
