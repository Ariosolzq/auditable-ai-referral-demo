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

function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function statusTone(s: HumanReview["status"]): string {
  if (s === "not_required")
    return "bg-slate-100 text-slate-700 border-slate-200";
  if (s === "submitted")
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  return "bg-amber-50 text-amber-800 border-amber-200";
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

function GovernanceHeader({
  status,
}: {
  status: HumanReview["status"];
}) {
  return (
    <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          aria-label="Governance boundary"
          className="inline-flex items-center gap-1 rounded border border-sky-300 bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-800"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sky-600 text-[9px] font-bold text-white"
          >
            G
          </span>
          Governance boundary
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Human Review
        </h2>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">Status</span>
        <Badge className={statusTone(status)}>{status}</Badge>
      </div>
    </header>
  );
}

function GovernanceConstraint() {
  return (
    <p className="mb-3 rounded-md border border-sky-200 bg-white/70 px-3 py-2 text-xs text-slate-700">
      <span className="font-semibold text-sky-800">Governance boundary —</span>{" "}
      only human review can record the final decision in this case.
    </p>
  );
}

function NotRequiredPanel({
  reason,
}: {
  reason: string;
}) {
  return (
    <section
      aria-label="Human review status"
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Human Review
        </h2>
        <Badge className={statusTone("not_required")}>not_required</Badge>
      </div>
      <p className="mt-1.5 text-sm font-medium text-slate-900">
        Human review not required for this case.
      </p>
      <p className="text-sm text-slate-600">Reason: {reason}</p>
    </section>
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
      className="rounded-lg border-2 border-sky-400 bg-sky-50/40 p-4 shadow-sm"
    >
      <GovernanceHeader status={humanReview.status} />

      <GovernanceConstraint />

      {humanReview.status === "submitted" ? (
        <div className="rounded-md border border-slate-200 bg-white p-3">
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
        <form onSubmit={handleSubmit}>
          {humanReview.startedAt && (
            <p className="mb-2 text-xs text-slate-500">
              Started at: {humanReview.startedAt}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_minmax(220px,1.6fr)_auto] lg:items-start">
            <fieldset className="space-y-1.5">
              <legend className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Reviewer action
              </legend>
              <div className="flex flex-wrap gap-3">
                {(["confirm", "override"] as ReviewerAction[]).map((opt) => (
                  <label
                    key={opt}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-700"
                  >
                    <input
                      type="radio"
                      name="reviewerAction"
                      value={opt}
                      checked={reviewerAction === opt}
                      onChange={() => setReviewerAction(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-1.5">
              <legend className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Final decision
              </legend>
              <div className="flex flex-wrap gap-3">
                {(["ACCEPT", "REJECT"] as FinalDecisionValue[]).map((opt) => (
                  <label
                    key={opt}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-700"
                  >
                    <input
                      type="radio"
                      name="finalDecision"
                      value={opt}
                      checked={finalDecision === opt}
                      onChange={() => setFinalDecision(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              {reviewerAction === "override" && (
                <label className="block space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Override reason (required)
                  </span>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    rows={2}
                    className="block w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm focus-visible:border-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500"
                  />
                </label>
              )}
              <label className="block space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Reviewer note (optional)
                </span>
                <textarea
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  rows={2}
                  className="block w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm focus-visible:border-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500"
                />
              </label>
            </div>

            <div className="flex flex-col items-end gap-1 lg:pt-5">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Submit review
              </button>
              {finalDecisionMissing && (
                <span className="text-[10px] italic text-slate-500">
                  Select a final decision to submit.
                </span>
              )}
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
