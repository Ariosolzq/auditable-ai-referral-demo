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

function defaultFinalDecision(ruleDecision: RuleDecision): FinalDecisionValue {
  if (ruleDecision === "ACCEPT" || ruleDecision === "REJECT") {
    return ruleDecision;
  }
  return "ACCEPT";
}

function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

export default function HumanReviewPanel({
  humanReview,
  ruleDecision,
  onSubmitReview,
}: Props) {
  const [reviewerAction, setReviewerAction] =
    useState<ReviewerAction>("confirm");
  const [finalDecision, setFinalDecision] = useState<FinalDecisionValue>(
    defaultFinalDecision(ruleDecision),
  );
  const [reviewerNote, setReviewerNote] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const overrideBlocked =
    reviewerAction === "override" && overrideReason.trim().length === 0;
  const canSubmit = !overrideBlocked && onSubmitReview !== undefined;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || !onSubmitReview) return;
    onSubmitReview({
      reviewerAction,
      finalDecision,
      reviewerNote,
      overrideReason:
        reviewerAction === "override" ? overrideReason : undefined,
    });
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Human Review
      </h2>

      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-500">Status</span>
        <Badge className={statusTone(humanReview.status)}>
          {humanReview.status}
        </Badge>
      </div>

      {humanReview.status === "not_required" ? (
        <div className="rounded-md border border-slate-100 bg-slate-50/50 p-3 text-sm text-slate-700">
          <p className="font-medium text-slate-900">
            Human review not required for this case.
          </p>
          <p className="mt-1 text-slate-700">Reason: {humanReview.reason}</p>
        </div>
      ) : humanReview.status === "submitted" ? (
        <div className="space-y-1.5">
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
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {humanReview.startedAt && (
            <p className="text-xs text-slate-500">
              Started at: {humanReview.startedAt}
            </p>
          )}

          <fieldset className="space-y-1.5">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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

          {reviewerAction === "override" && (
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reviewer note (optional)
            </span>
            <textarea
              value={reviewerNote}
              onChange={(e) => setReviewerNote(e.target.value)}
              rows={2}
              className="block w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm focus-visible:border-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Submit review
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
