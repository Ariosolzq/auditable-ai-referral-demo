import { Fragment } from "react";
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

const controlPath: FlowStep[] = [
  {
    label: "Evidence package",
    tone: "border-slate-300 bg-white text-slate-900",
  },
  {
    label: "Deterministic rules",
    tone: "border-amber-400 bg-amber-50 text-amber-900",
  },
  {
    label: "Policy routing",
    tone: "border-amber-400 bg-amber-50 text-amber-900",
  },
  {
    label: "Final decision",
    tone: "border-slate-300 bg-white text-slate-900",
  },
];

const governanceLayer: FlowStep[] = [
  {
    label: "LLM advisory",
    tone: "border-slate-200 bg-slate-50 text-slate-600",
  },
  {
    label: "Human review",
    tone: "border-sky-300 bg-sky-50 text-sky-800",
  },
  {
    label: "Audit trail",
    tone: "border-slate-200 bg-slate-50 text-slate-600",
  },
  {
    label: "Replay gate",
    tone: "border-slate-200 bg-slate-50 text-slate-600",
  },
];

type WalkthroughStep = {
  label: string;
  href?: string;
};

const walkthroughSteps: WalkthroughStep[] = [
  { label: "Case C", href: "/cases/case-c" },
  { label: "Evidence → Rule → LLM" },
  { label: "Human override" },
  { label: "Audit events" },
  { label: "Replay Gate", href: "/replay" },
];

function ChatbotFlow() {
  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {chatbotFlow.map((step, index) => (
        <li key={step.label} className="flex items-center gap-2">
          <span
            className={`inline-flex min-h-9 items-center rounded-md border px-2.5 py-1.5 text-xs font-semibold leading-tight ${step.tone}`}
          >
            {step.label}
          </span>
          {index < chatbotFlow.length - 1 && (
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

function ControlPathRow() {
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
          Main control path
        </span>
        <span className="text-[10px] italic text-slate-400">
          rule-first &middot; policy-routed
        </span>
      </div>
      <ol className="flex flex-col gap-2">
        {[controlPath.slice(0, 2), controlPath.slice(2, 4)].map(
          (row, rowIdx) => (
            <li
              key={`row-${rowIdx}`}
              className="flex flex-wrap items-center gap-2"
            >
              {row.map((step, idx) => {
                const isLast = idx === row.length - 1;
                return (
                  <Fragment key={step.label}>
                    <span
                      className={`inline-flex min-h-9 items-center rounded-md border-2 px-3 py-1.5 text-xs font-semibold leading-tight shadow-sm ${step.tone}`}
                    >
                      {step.label}
                    </span>
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="hidden text-sm font-semibold text-slate-500 sm:inline"
                      >
                        &rarr;
                      </span>
                    )}
                  </Fragment>
                );
              })}
            </li>
          ),
        )}
      </ol>
    </div>
  );
}

function GovernanceLayerRow() {
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Governance layer
        </span>
        <span className="text-[10px] italic text-slate-400">
          advisory &middot; human-triggered by policy &middot; audit &middot; replay
        </span>
      </div>
      <ul className="flex flex-wrap items-center gap-1.5">
        {governanceLayer.map((step) => (
          <li key={step.label}>
            <span
              className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${step.tone}`}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WalkthroughPath() {
  return (
    <section
      aria-labelledby="walkthrough-heading"
      className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3"
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2
            id="walkthrough-heading"
            className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700"
          >
            Recommended 3-minute walkthrough
          </h2>
          <span className="text-xs text-slate-500">
            Start with Case C. End at Replay Gate.
          </span>
        </div>
      </div>
      <ol className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
        {walkthroughSteps.map((step, index) => {
          const isAction = Boolean(step.href);
          const isFirst = index === 0;
          const isLast = index === walkthroughSteps.length - 1;
          const pillRing = isFirst
            ? "ring-2 ring-amber-300"
            : isAction
              ? "ring-1 ring-slate-300"
              : "ring-1 ring-slate-200";
          const pillBg = isAction ? "bg-white" : "bg-white/70";
          const pillText = isAction ? "text-slate-900" : "text-slate-700";
          const pillClass = `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${pillBg} ${pillText} ${pillRing} shadow-sm`;
          const markerClass = isFirst
            ? "bg-amber-500 text-white"
            : isAction
              ? "bg-slate-900 text-white"
              : "bg-slate-200 text-slate-700";
          const stepContent = (
            <>
              <span
                aria-hidden="true"
                className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold ${markerClass}`}
              >
                {index + 1}
              </span>
              <span>{step.label}</span>
              {isAction && (
                <span aria-hidden="true" className="text-slate-400">
                  &rarr;
                </span>
              )}
            </>
          );
          return (
            <li
              key={step.label}
              className="flex items-center gap-1.5"
            >
              {step.href ? (
                <Link
                  href={step.href}
                  className={`${pillClass} transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500`}
                >
                  {stepContent}
                </Link>
              ) : (
                <span className={pillClass}>{stepContent}</span>
              )}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="hidden text-sm text-slate-400 sm:inline"
                >
                  &rarr;
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
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
          <div className="rounded-lg border border-slate-200 border-l-4 border-l-slate-300 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
              Typical chatbot demo
            </h3>
            <div className="mt-3">
              <ChatbotFlow />
            </div>
            <p className="mt-3 text-sm leading-snug text-slate-600">
              The model response is the main artifact.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 border-l-4 border-l-amber-300 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
              This workflow demo
            </h3>
            <div className="mt-3 space-y-3">
              <ControlPathRow />
              <GovernanceLayerRow />
            </div>
            <p className="mt-3 text-sm leading-snug text-slate-700">
              Rules and humans control decisions; LLM output is advisory and
              evidence-bound.
            </p>
          </div>
        </div>
      </section>

      <WalkthroughPath />
    </div>
  );
}
