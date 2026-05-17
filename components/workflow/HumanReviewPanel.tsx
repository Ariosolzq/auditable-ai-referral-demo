"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import type {
  FinalDecisionValue,
  HumanReview,
  ReviewerAction,
  RuleDecision,
} from "@/types/referral";

type SubmitInput = {
  reviewerAction: ReviewerAction;
  finalDecision: FinalDecisionValue;
  reviewerNote: string;
  overrideReason?: string;
};

type Props = {
  humanReview: HumanReview;
  ruleDecision: RuleDecision;
  onSubmitReview?: (input: SubmitInput) => void;
};

function statusPillClass(s: HumanReview["status"]): string {
  if (s === "not_required")
    return "border-slate-200 bg-white text-slate-600";
  if (s === "submitted")
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

// Returns null when the rule decision does not commit to ACCEPT or REJECT,
// so the reviewer must make an explicit choice before submitting.
function defaultFinalDecision(
  ruleDecision: RuleDecision,
): FinalDecisionValue | null {
  if (ruleDecision === "ACCEPT" || ruleDecision === "REJECT") {
    return ruleDecision;
  }
  return null;
}

function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function GovernanceEyebrow() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-white/80 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-800">
      <span
        aria-hidden="true"
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-sky-700 text-[9px] font-bold text-white"
      >
        G
      </span>
      Governance boundary
    </span>
  );
}

function StatusPill({ status }: { status: HumanReview["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] ${statusPillClass(
        status,
      )}`}
    >
      <span className="font-semibold uppercase tracking-[0.06em]">status</span>
      <span aria-hidden="true" className="text-slate-300">
        ·
      </span>
      <span>{status}</span>
    </span>
  );
}

function LimitNote() {
  return (
    <div className="mt-4 flex items-start gap-2.5 border-t border-sky-100 pt-3 text-xs leading-snug text-slate-700">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-sm border border-sky-700 font-mono text-[9px] font-bold text-sky-700"
      >
        !
      </span>
      <p>
        <b className="font-semibold text-sky-800">Limit.</b> LLM accelerates
        this review by summarizing evidence and flagging risks &mdash; it does
        not control routing, write{" "}
        <code className="rounded-sm border border-sky-200 bg-white/70 px-1 font-mono text-[11px] text-sky-900">
          finalDecision
        </code>
        , or bypass human governance.
      </p>
    </div>
  );
}

function NotRequiredPanel({ reason }: { reason: string }) {
  return (
    <section
      aria-label="Human review status"
      className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white/80 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          <span
            aria-hidden="true"
            className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-slate-400 text-[9px] font-bold text-white"
          >
            G
          </span>
          Governance boundary
        </span>
        <h2 className="text-base font-semibold text-slate-900">
          Human review &middot; not required
        </h2>
        <span className="ml-auto">
          <StatusPill status="not_required" />
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-700">
        Policy did not route this case to human review.
      </p>
      <p className="text-sm text-slate-600">Reason: {reason}</p>
    </section>
  );
}

type SegmentOption<T extends string> = {
  value: T;
  label: string;
  activeClass: string;
};

function SegmentedRadioGroup<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
}: {
  name: string;
  legend: string;
  value: T | null;
  options: SegmentOption<T>[];
  onChange: (next: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
        {legend}
      </legend>
      <div
        role="radiogroup"
        aria-label={legend}
        className="inline-flex w-full rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-auto"
      >
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500 has-[:focus-visible]:ring-offset-1 sm:flex-none ${
                active
                  ? opt.activeClass
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={active}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function HumanReviewPanel({
  humanReview,
  ruleDecision,
  onSubmitReview,
}: Props) {
  const [reviewerAction, setReviewerAction] =
    useState<ReviewerAction>("confirm");
  const [finalDecision, setFinalDecision] = useState<FinalDecisionValue | null>(
    () => defaultFinalDecision(ruleDecision),
  );
  const [reviewerNote, setReviewerNote] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  if (humanReview.status === "not_required") {
    return <NotRequiredPanel reason={humanReview.reason} />;
  }

  const overrideBlocked =
    reviewerAction === "override" && overrideReason.trim().length === 0;
  const finalDecisionMissing = finalDecision === null;
  const canSubmit =
    !overrideBlocked && !finalDecisionMissing && onSubmitReview !== undefined;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || !onSubmitReview || finalDecision === null) return;
    onSubmitReview({
      reviewerAction,
      finalDecision,
      reviewerNote,
      overrideReason:
        reviewerAction === "override" ? overrideReason : undefined,
    });
  };

  return (
    <section
      aria-label="Human review governance band"
      className="rounded-lg border border-slate-200 border-l-4 border-l-sky-500 bg-sky-50/50 p-5 shadow-sm sm:p-6"
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <GovernanceEyebrow />
          <h2 className="text-xl font-semibold leading-tight tracking-tight text-slate-900">
            Human review &middot;{" "}
            <span className="text-slate-600">decision boundary</span>
          </h2>
          <p className="max-w-[64ch] text-sm leading-snug text-slate-700">
            Only human review can record the final decision in this case.{" "}
            <b className="font-semibold text-sky-800">
              LLM advisory cannot write finalDecision.
            </b>{" "}
            Confirm the rule outcome, or override with a reviewer-recorded
            reason &mdash; both are audited.
          </p>
        </div>
        <StatusPill status={humanReview.status} />
      </header>

      {humanReview.status === "submitted" ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            <FieldRow label="Review type" value={humanReview.reviewType} />
            {humanReview.startedAt && (
              <FieldRow label="Started at" value={humanReview.startedAt} />
            )}
            {humanReview.submittedAt && (
              <FieldRow label="Submitted at" value={humanReview.submittedAt} />
            )}
            {humanReview.reviewerAction && (
              <FieldRow
                label="Reviewer action"
                value={humanReview.reviewerAction}
              />
            )}
            {humanReview.finalDecision && (
              <FieldRow
                label="Final decision"
                value={humanReview.finalDecision}
              />
            )}
            {typeof humanReview.overrideFlag === "boolean" && (
              <FieldRow
                label="Override flag"
                value={humanReview.overrideFlag ? "true" : "false"}
              />
            )}
            {humanReview.overrideReason && (
              <FieldRow
                label="Override reason"
                value={humanReview.overrideReason}
              />
            )}
            {humanReview.reviewerNote && (
              <FieldRow
                label="Reviewer note"
                value={humanReview.reviewerNote}
              />
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {humanReview.startedAt && (
            <p className="font-mono text-[11px] text-slate-500">
              Started at: {humanReview.startedAt}
            </p>
          )}

          <div className="flex flex-wrap items-start gap-4 sm:gap-6">
            <SegmentedRadioGroup<ReviewerAction>
              name="reviewerAction"
              legend="Reviewer action"
              value={reviewerAction}
              options={[
                {
                  value: "confirm",
                  label: "Confirm",
                  activeClass:
                    "bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-300 shadow-sm",
                },
                {
                  value: "override",
                  label: "Override",
                  activeClass:
                    "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300 shadow-sm",
                },
              ]}
              onChange={setReviewerAction}
            />
            <SegmentedRadioGroup<FinalDecisionValue>
              name="finalDecision"
              legend="Final decision"
              value={finalDecision}
              options={[
                {
                  value: "ACCEPT",
                  label: "ACCEPT",
                  activeClass:
                    "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-300 shadow-sm",
                },
                {
                  value: "REJECT",
                  label: "REJECT",
                  activeClass:
                    "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-300 shadow-sm",
                },
              ]}
              onChange={setFinalDecision}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-3">
              {reviewerAction === "override" && (
                <label className="block space-y-1">
                  <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                    Override reason (required)
                  </span>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    rows={2}
                    aria-required="true"
                    className="block w-full rounded-md border border-amber-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus-visible:border-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500"
                  />
                  {overrideBlocked && (
                    <span className="block font-mono text-[10px] italic text-amber-700">
                      Override requires a reviewer-recorded reason before
                      submit.
                    </span>
                  )}
                </label>
              )}
              <label className="block space-y-1">
                <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Reviewer note (optional)
                </span>
                <textarea
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  rows={2}
                  className="block w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm focus-visible:border-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500"
                />
              </label>
            </div>

            <div className="flex flex-col items-stretch gap-1.5 lg:items-end">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-100 disabled:shadow-none"
              >
                Submit review
              </button>
              {finalDecisionMissing ? (
                <span className="font-mono text-[10px] italic text-slate-500 lg:text-right">
                  Select a final decision to submit.
                </span>
              ) : (
                <span className="font-mono text-[10px] text-slate-500 lg:max-w-[24ch] lg:text-right">
                  Submit appends review events to the audit trail.
                </span>
              )}
            </div>
          </div>
        </form>
      )}

      <LimitNote />
    </section>
  );
}
