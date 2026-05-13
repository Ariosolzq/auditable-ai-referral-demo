"use client";

import { type ReactNode, useReducer } from "react";
import AuditEventPayloadPanel from "@/components/workflow/AuditEventPayloadPanel";
import AuditTimeline from "@/components/workflow/AuditTimeline";
import EvidencePanel from "@/components/workflow/EvidencePanel";
import HumanReviewPanel from "@/components/workflow/HumanReviewPanel";
import LLMAdvisoryCard from "@/components/workflow/LLMAdvisoryCard";
import ReferralSummaryCard from "@/components/workflow/ReferralSummaryCard";
import RuleEvaluationCard from "@/components/workflow/RuleEvaluationCard";
import WorkflowProgressRail from "@/components/workflow/WorkflowProgressRail";
import { buildInitialState, caseReducer } from "@/lib/caseReducer";
import type {
  FinalDecisionValue,
  ReferralCase,
  ReviewerAction,
} from "@/types/referral";

type Props = {
  caseData: ReferralCase;
};

function statusTone(v: string): string {
  if (v === "accepted" || v === "ACCEPT" || v === "auto_accept")
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (
    v === "rejected" ||
    v === "REJECT" ||
    v === "auto_reject" ||
    v === "failed"
  )
    return "bg-rose-50 text-rose-800 border-rose-200";
  if (
    v === "needs_review" ||
    v === "waiting_for_human_review" ||
    v === "in_progress" ||
    v === "pending" ||
    v === "NEEDS_REVIEW" ||
    v === "UNCERTAIN" ||
    v === "human_review_required" ||
    v === "needs_more_evidence"
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

function Chip({
  label,
  value,
  tone,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  tone?: string;
  mono?: boolean;
}) {
  const baseClass = tone ?? "border-slate-200 bg-white text-slate-700";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs ${baseClass}`}
    >
      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] opacity-70">
        {label}
      </span>
      <span className={mono ? "font-mono text-[11px]" : "font-medium"}>
        {value}
      </span>
    </span>
  );
}

function DecisionCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </div>
      <div className="mt-1">
        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${tone}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function ZoneHeading({
  letter,
  title,
  phase,
}: {
  letter: string;
  title: string;
  phase: string;
}) {
  return (
    <h2 className="flex flex-wrap items-baseline gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <span>
        {letter} &middot; {title}
      </span>
      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-slate-600">
        phase: {phase}
      </span>
    </h2>
  );
}

export default function CaseWorkspaceClient({
  caseData: initialCase,
}: Props) {
  const [state, dispatch] = useReducer(
    caseReducer,
    initialCase,
    buildInitialState,
  );

  const { caseData } = state;
  const { selectedEvidenceIds, selectedAuditEventId } = state;

  const handleSelectEvidence = (ids: string[]) => {
    dispatch({ type: "SELECT_EVIDENCE", evidenceIds: ids });
  };

  const handleClearSelection = () => {
    dispatch({ type: "CLEAR_EVIDENCE_SELECTION" });
  };

  const handleSelectAuditEvent = (eventId: string) => {
    dispatch({ type: "SELECT_AUDIT_EVENT", eventId });
  };

  const handleSubmitReview = (input: {
    reviewerAction: ReviewerAction;
    finalDecision: FinalDecisionValue;
    reviewerNote: string;
    overrideReason?: string;
  }) => {
    dispatch({ type: "SUBMIT_REVIEW", ...input });
  };

  const handleResetCase = () => {
    dispatch({ type: "RESET_CASE", initialCase });
  };

  const finalText = caseData.finalDecision?.decision ?? "pending";
  const finalTone = caseData.finalDecision
    ? statusTone(caseData.finalDecision.decision)
    : "bg-slate-100 text-slate-500 border-slate-200";

  const showCaseCContext =
    caseData.id === "case-c" && !caseData.finalDecision;

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h1 className="text-xl font-semibold text-slate-900">
              {caseData.title}
            </h1>
            <p className="text-sm text-slate-600">{caseData.description}</p>
            {showCaseCContext && (
              <p className="text-sm font-medium text-slate-800">
                Rule decided REJECT. The case is waiting for human
                confirmation.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleResetCase}
            className="inline-flex shrink-0 items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            Reset Case
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Chip
            label="status"
            value={caseData.currentStatus}
            tone={statusTone(caseData.currentStatus)}
          />
          <Chip
            label="stage"
            value={caseData.currentStage}
            tone={statusTone(caseData.currentStage)}
          />
          <Chip
            label="risk"
            value={caseData.riskLevel}
            tone={riskTone(caseData.riskLevel)}
          />
          <Chip
            label="policy"
            value={<code>{caseData.ruleEvaluation.policyBundleVersion}</code>}
            mono
          />
          {caseData.llmAdvisory.status === "generated" ? (
            <>
              <Chip
                label="prompt"
                value={<code>{caseData.llmAdvisory.promptVersion}</code>}
                mono
              />
              <Chip
                label="model"
                value={<code>{caseData.llmAdvisory.modelVersion}</code>}
                mono
              />
            </>
          ) : (
            <Chip label="llm" value={caseData.llmAdvisory.status} />
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-md border border-slate-200">
          <DecisionCell
            label="Rule decision"
            value={caseData.ruleEvaluation.decision}
            tone={statusTone(caseData.ruleEvaluation.decision)}
          />
          <DecisionCell
            label="Routing decision"
            value={caseData.ruleEvaluation.routingDecision}
            tone={statusTone(caseData.ruleEvaluation.routingDecision)}
          />
          <DecisionCell
            label="Final decision"
            value={finalText}
            tone={finalTone}
          />
        </div>
      </header>

      <WorkflowProgressRail caseData={caseData} />

      <HumanReviewPanel
        key={`${caseData.id}-${caseData.humanReview.status}-${caseData.auditEvents.length}`}
        humanReview={caseData.humanReview}
        ruleDecision={caseData.ruleEvaluation.decision}
        onSubmitReview={handleSubmitReview}
      />

      <div className="space-y-3">
        <ZoneHeading
          letter="A"
          title="Inputs & Analysis"
          phase="input → action"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <EvidencePanel
              evidenceRecords={caseData.evidenceRecords}
              selectedEvidenceIds={selectedEvidenceIds}
              onClearSelection={handleClearSelection}
              normalizedFields={caseData.normalizedFields}
            />
            <ReferralSummaryCard referralSummary={caseData.referralSummary} />
          </div>
          <div className="space-y-4">
            <RuleEvaluationCard
              ruleEvaluation={caseData.ruleEvaluation}
              onSelectEvidence={handleSelectEvidence}
            />
            <LLMAdvisoryCard
              llmAdvisory={caseData.llmAdvisory}
              onSelectEvidence={handleSelectEvidence}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <ZoneHeading letter="B" title="Audit Record" phase="record" />
        <section
          aria-label="Audit master-detail workspace"
          className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
        >
          <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Audit master-detail
            </h3>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
              click an event → inspect its payload
            </span>
          </header>
          <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-[2fr_3fr] lg:divide-x lg:divide-y-0">
            <AuditTimeline
              auditEvents={caseData.auditEvents}
              selectedAuditEventId={selectedAuditEventId}
              onSelectAuditEvent={handleSelectAuditEvent}
            />
            <AuditEventPayloadPanel
              auditEvents={caseData.auditEvents}
              selectedAuditEventId={selectedAuditEventId}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
