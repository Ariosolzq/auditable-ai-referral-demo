import Link from "next/link";

type CaseEntry = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
};

const caseEntries: CaseEntry[] = [
  {
    id: "case-a",
    title: "Case A",
    subtitle: "Low-risk auto-accept",
    description:
      "Rule produces ACCEPT with auto_accept routing. LLM advisory is skipped. No human review required.",
  },
  {
    id: "case-b",
    title: "Case B",
    subtitle: "Missing physician order → human review",
    description:
      "Missing physician order triggers NEEDS_REVIEW. Evidence-bound LLM advisory accompanies the case. Reviewer confirms or overrides.",
  },
  {
    id: "case-c",
    title: "Case C",
    subtitle: "Rule REJECT → human override",
    description:
      "Rule rejects; policy requires human confirmation. Override to ACCEPT appends override and final-decision events to the audit trail.",
  },
];

export default function DemoWalkthroughSection() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">
        Demo Walkthrough
      </h2>
      <p className="mb-3 text-sm text-slate-700">
        The demo includes three mock cases that exercise the rule-first,
        LLM-advisory, human-review boundaries.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {caseEntries.map((c) => (
          <Link
            key={c.id}
            href={`/cases/${c.id}`}
            className="block rounded-md border border-slate-200 bg-slate-50/50 p-3 shadow-sm transition hover:border-slate-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            <h3 className="text-sm font-semibold text-slate-900">{c.title}</h3>
            <p className="text-xs text-slate-500">{c.subtitle}</p>
            <p className="mt-2 text-sm text-slate-700">{c.description}</p>
          </Link>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/demo"
          className="block rounded-md border border-slate-200 bg-white p-3 text-sm shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          <span className="font-medium text-slate-900">Case selector</span>
          <span className="block text-xs text-slate-500">/demo</span>
        </Link>
        <Link
          href="/replay"
          className="block rounded-md border border-slate-200 bg-white p-3 text-sm shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          <span className="font-medium text-slate-900">Replay evaluation</span>
          <span className="block text-xs text-slate-500">/replay</span>
        </Link>
      </div>
    </section>
  );
}
