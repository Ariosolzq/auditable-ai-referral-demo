import type { ReactNode } from "react";
import type { HumanReview } from "@/types/referral";

type Props = {
  humanReview: HumanReview;
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

function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

export default function HumanReviewPanel({ humanReview }: Props) {
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
      ) : (
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

          <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Interactive review actions will be added in Phase 7a.
          </p>
        </div>
      )}
    </section>
  );
}
