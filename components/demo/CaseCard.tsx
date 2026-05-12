import Link from "next/link";
import type { ReactNode } from "react";
import type { ReasonCode, ReferralCase } from "@/types/referral";

type CaseCardProps = {
  caseData: ReferralCase;
};

const SEVERITY_RANK: Record<string, number> = {
  blocking: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function badgeTone(value: string): string {
  if (value === "accepted" || value === "ACCEPT" || value === "auto_accept") {
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
  if (
    value === "needs_review" ||
    value === "NEEDS_REVIEW" ||
    value === "UNCERTAIN" ||
    value === "in_progress" ||
    value === "pending" ||
    value === "human_review_required" ||
    value === "needs_more_evidence" ||
    value === "waiting_for_human_review"
  ) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  if (
    value === "rejected" ||
    value === "REJECT" ||
    value === "auto_reject" ||
    value === "failed"
  ) {
    return "bg-rose-50 text-rose-800 border-rose-200";
  }
  if (value === "generated") {
    return "bg-sky-50 text-sky-800 border-sky-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function severityTone(severity: string): string {
  if (severity === "blocking" || severity === "high") {
    return "bg-rose-50 text-rose-800 border-rose-200";
  }
  if (severity === "medium") {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function riskTone(level: ReferralCase["riskLevel"]): string {
  if (level === "high") return "bg-rose-50 text-rose-800 border-rose-200";
  if (level === "medium") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

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

function FieldRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <Badge className={tone}>{value}</Badge>
    </div>
  );
}

export default function CaseCard({ caseData }: CaseCardProps) {
  const finalText = caseData.finalDecision?.decision ?? "—";
  const finalTone = caseData.finalDecision
    ? badgeTone(caseData.finalDecision.decision)
    : "bg-slate-100 text-slate-500 border-slate-200";

  const topReasonCodes: ReasonCode[] = [...caseData.ruleEvaluation.reasonCodes]
    .sort(
      (a, b) =>
        (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0),
    )
    .slice(0, 2);

  const routingHighlight = caseData.ruleEvaluation.routingReasonCodes.find(
    (r) => r.severity === "blocking" || r.severity === "high",
  );

  return (
    <Link
      href={`/cases/${caseData.id}`}
      aria-label={`Open ${caseData.title}`}
      className="group block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
    >
      <div className="mb-3 space-y-1">
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-950">
          {caseData.title}
        </h3>
        <p className="text-sm text-slate-600">{caseData.description}</p>
      </div>

      <div className="space-y-1.5">
        <FieldRow
          label="Status"
          value={caseData.currentStatus}
          tone={badgeTone(caseData.currentStatus)}
        />
        <FieldRow
          label="Stage"
          value={caseData.currentStage}
          tone={badgeTone(caseData.currentStage)}
        />
        <FieldRow
          label="Risk"
          value={caseData.riskLevel}
          tone={riskTone(caseData.riskLevel)}
        />
        <FieldRow
          label="Rule"
          value={caseData.ruleEvaluation.decision}
          tone={badgeTone(caseData.ruleEvaluation.decision)}
        />
        <FieldRow
          label="Routing"
          value={caseData.ruleEvaluation.routingDecision}
          tone={badgeTone(caseData.ruleEvaluation.routingDecision)}
        />
        <FieldRow
          label="LLM"
          value={caseData.llmAdvisory.status}
          tone={badgeTone(caseData.llmAdvisory.status)}
        />
        <FieldRow
          label="Review"
          value={caseData.humanReview.status}
          tone={badgeTone(caseData.humanReview.status)}
        />
        <FieldRow label="Final" value={finalText} tone={finalTone} />
      </div>

      {(topReasonCodes.length > 0 || routingHighlight) && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          {topReasonCodes.length > 0 && (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                Reason codes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topReasonCodes.map((r) => (
                  <Badge key={r.code} className={severityTone(r.severity)}>
                    {r.code}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {routingHighlight && (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                Routing reason
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge className={severityTone(routingHighlight.severity)}>
                  {routingHighlight.code}
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
