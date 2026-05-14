import Link from "next/link";

type FlowStep = {
  label: string;
  tone: string;
};

const chatbotFlow: FlowStep[] = [
  {
    label: "User prompt",
    tone: "border-slate-200 bg-slate-50 text-slate-700",
  },
  {
    label: "LLM answer",
    tone: "border-slate-300 bg-white text-slate-800",
  },
  {
    label: "User decides whether to trust it",
    tone: "border-slate-200 bg-slate-50 text-slate-700",
  },
];

const governedFlow: FlowStep[] = [
  {
    label: "Evidence package",
    tone: "border-slate-200 bg-white text-slate-800",
  },
  {
    label: "Deterministic rules",
    tone: "border-amber-300 bg-amber-50 text-amber-900",
  },
  {
    label: "LLM advisory",
    tone: "border-sky-300 bg-sky-50 text-sky-900",
  },
  {
    label: "Human review",
    tone: "border-sky-400 bg-white text-sky-900",
  },
  {
    label: "Audit trail",
    tone: "border-slate-300 bg-slate-50 text-slate-800",
  },
  {
    label: "Replay gate",
    tone: "border-amber-300 bg-white text-amber-900",
  },
];

const walkthroughSteps: string[] = [
  "Open Case C",
  "Inspect evidence, rule, and LLM advisory",
  "Submit confirm or override",
  "Inspect appended audit events",
  "Open Replay Gate",
];

function FlowChips({ steps }: { steps: FlowStep[] }) {
  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {steps.map((step, index) => (
        <li key={step.label} className="flex items-center gap-2">
          <span
            className={`inline-flex min-h-9 items-center rounded-md border px-2.5 py-1.5 text-xs font-semibold leading-tight ${step.tone}`}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="hidden text-sm text-slate-400 sm:inline"
            >
              &rarr;
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function ComparisonCard({
  title,
  note,
  steps,
  accentClass,
}: {
  title: string;
  note: string;
  steps: FlowStep[];
  accentClass: string;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm ${accentClass}`}
    >
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
        {title}
      </h3>
      <div className="mt-3">
        <FlowChips steps={steps} />
      </div>
      <p className="mt-3 text-sm leading-snug text-slate-600">{note}</p>
    </div>
  );
}

export default function LandingCommunicationGuide() {
  return (
    <div className="space-y-4">
      <section className="space-y-3" aria-labelledby="not-chatbot-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="not-chatbot-heading"
            className="text-lg font-semibold text-slate-900"
          >
            Not a chatbot. A governed workflow.
          </h2>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            decision boundary first
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <ComparisonCard
            title="Typical chatbot demo"
            steps={chatbotFlow}
            note="The model response is the main artifact."
            accentClass="border-slate-200 border-l-4 border-l-slate-300"
          />
          <ComparisonCard
            title="This workflow demo"
            steps={governedFlow}
            note="Rules and humans control decisions; LLM output is advisory and evidence-bound."
            accentClass="border-slate-200 border-l-4 border-l-amber-300"
          />
        </div>
      </section>

      <section
        aria-labelledby="walkthrough-heading"
        className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <h2
              id="walkthrough-heading"
              className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700"
            >
              Recommended 3-minute walkthrough
            </h2>
            <ol className="mt-2 grid gap-2 sm:grid-cols-5">
              {walkthroughSteps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-2"
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium leading-snug text-slate-700">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/cases/case-c"
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              Open Case C
            </Link>
            <Link
              href="/replay"
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              Open Replay Gate
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
