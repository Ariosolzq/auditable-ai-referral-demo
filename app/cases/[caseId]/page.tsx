import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import AuditEventPayloadPanel from "@/components/workflow/AuditEventPayloadPanel";
import AuditTimeline from "@/components/workflow/AuditTimeline";
import EvidencePanel from "@/components/workflow/EvidencePanel";
import HumanReviewPanel from "@/components/workflow/HumanReviewPanel";
import LLMAdvisoryCard from "@/components/workflow/LLMAdvisoryCard";
import NormalizedFieldsCard from "@/components/workflow/NormalizedFieldsCard";
import ReferralSummaryCard from "@/components/workflow/ReferralSummaryCard";
import RuleEvaluationCard from "@/components/workflow/RuleEvaluationCard";
import { cases } from "@/data/cases";
import type { ReferralCase } from "@/types/referral";

export function generateStaticParams() {
  return cases.map((c) => ({ caseId: c.id }));
}

type CaseDetailPageProps = {
  params: Promise<{ caseId: string }>;
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

function statusTone(v: string): string {
  if (v === "accepted" || v === "ACCEPT")
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (v === "rejected" || v === "REJECT" || v === "failed")
    return "bg-rose-50 text-rose-800 border-rose-200";
  if (
    v === "needs_review" ||
    v === "waiting_for_human_review" ||
    v === "in_progress" ||
    v === "pending"
  ) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function riskTone(level: ReferralCase["riskLevel"]): string {
  if (level === "high") return "bg-rose-50 text-rose-800 border-rose-200";
  if (level === "medium") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { caseId } = await params;
  const caseData = cases.find((c) => c.id === caseId);
  if (!caseData) notFound();

  const finalText = caseData.finalDecision?.decision ?? "Pending";
  const finalTone = caseData.finalDecision
    ? statusTone(caseData.finalDecision.decision)
    : "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-900">
            {caseData.title}
          </h1>
          <p className="text-sm text-slate-600">{caseData.description}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Status:</span>
            <Badge className={statusTone(caseData.currentStatus)}>
              {caseData.currentStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Stage:</span>
            <Badge className={statusTone(caseData.currentStage)}>
              {caseData.currentStage}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Risk:</span>
            <Badge className={riskTone(caseData.riskLevel)}>
              {caseData.riskLevel}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Policy:</span>
            <code className="text-xs text-slate-700">
              {caseData.ruleEvaluation.policyBundleVersion}
            </code>
          </div>
          {caseData.llmAdvisory.status === "generated" ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Prompt:</span>
                <code className="text-xs text-slate-700">
                  {caseData.llmAdvisory.promptVersion}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Model:</span>
                <code className="text-xs text-slate-700">
                  {caseData.llmAdvisory.modelVersion}
                </code>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">LLM:</span>
              <Badge className="border-slate-200 bg-slate-100 text-slate-700">
                {caseData.llmAdvisory.status}
              </Badge>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Final:</span>
            <Badge className={finalTone}>{finalText}</Badge>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr_0.9fr]">
        <div className="space-y-4">
          <ReferralSummaryCard referralSummary={caseData.referralSummary} />
          <NormalizedFieldsCard
            normalizedFields={caseData.normalizedFields}
          />
          <EvidencePanel evidenceRecords={caseData.evidenceRecords} />
        </div>
        <div className="space-y-4">
          <RuleEvaluationCard ruleEvaluation={caseData.ruleEvaluation} />
          <LLMAdvisoryCard llmAdvisory={caseData.llmAdvisory} />
          <HumanReviewPanel humanReview={caseData.humanReview} />
        </div>
        <div className="space-y-4">
          <AuditTimeline auditEvents={caseData.auditEvents} />
          <AuditEventPayloadPanel auditEvents={caseData.auditEvents} />
        </div>
      </div>
    </div>
  );
}
