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
  LLMAdvisory,
  ReasonCode,
  ReferralCase,
  ReviewerAction,
  RuleEvaluation,
} from "@/types/referral";

type Props = {
  caseData: ReferralCase;
};

function caseEyebrow(caseData: ReferralCase): string {
  const slug = caseData.id.replace(/^case-/, "");
  return `Referral review workspace · Case ${slug.toUpperCase()}`;
}

function deriveHeadline(caseData: ReferralCase): {
  lead: string;
  trail: string;
} {
  const rule = caseData.ruleEvaluation.decision;
  const routing = caseData.ruleEvaluation.routingDecision;
  const final = caseData.finalDecision;

  if (final) {
    if (final.overrideFlag) {
      return {
        lead: "Reviewer overrode the rule;",
        trail: `final ${final.decision.toLowerCase()}.`,
      };
    }
    if (rule === "ACCEPT" && routing === "auto_accept") {
      return { lead: "Rule accepted;", trail: "auto-finalized." };
    }
    if (rule === "REJECT" && routing === "auto_reject") {
      return { lead: "Rule rejected;", trail: "auto-finalized." };
    }
    return {
      lead: `Rule ${rule.toLowerCase()};`,
      trail: `final ${final.decision.toLowerCase()}.`,
    };
  }

  if (rule === "REJECT" && routing === "human_review_required") {
    return { lead: "Rule rejected;", trail: "human review required." };
  }
  if (rule === "NEEDS_REVIEW" && routing === "human_review_required") {
    return { lead: "Rule needs review;", trail: "human review required." };
  }
  if (rule === "UNCERTAIN" && routing === "human_review_required") {
    return { lead: "Rule uncertain;", trail: "human review required." };
  }
  if (routing === "needs_more_evidence") {
    return { lead: "Awaiting evidence;", trail: "case held." };
  }
  return { lead: caseData.title, trail: "" };
}

function topReasonCode(codes: ReasonCode[]): string | null {
  if (codes.length === 0) return null;
  const order = ["blocking", "high", "medium", "low"] as const;
  for (const sev of order) {
    const found = codes.find((c) => c.severity === sev);
    if (found) return found.code;
  }
  return codes[0]?.code ?? null;
}

function finalDecisionSub(caseData: ReferralCase): string {
  if (!caseData.finalDecision) {
    return "waiting on reviewer · only human review can finalize";
  }
  const fd = caseData.finalDecision;
  if (fd.decidedBy === "system") {
    return `${caseData.ruleEvaluation.ruleSetVersion} · auto-finalized`;
  }
  if (fd.overrideFlag) {
    return "reviewer override · audit logged";
  }
  return "reviewer confirmed · audit logged";
}

function decisionValueTone(value: string): string {
  if (value === "ACCEPT" || value === "auto_accept") return "text-emerald-700";
  if (value === "REJECT" || value === "auto_reject") return "text-rose-700";
  if (
    value === "human_review_required" ||
    value === "NEEDS_REVIEW" ||
    value === "UNCERTAIN" ||
    value === "needs_more_evidence"
  )
    return "text-amber-700";
  if (value === "pending") return "text-slate-500";
  return "text-slate-700";
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-semibold uppercase tracking-[0.06em] text-slate-600">
        {label}
      </span>
      <span className="text-slate-700">{value}</span>
    </span>
  );
}

function TripleCell({
  num,
  label,
  value,
  sub,
  withConnector,
}: {
  num: string;
  label: string;
  value: string;
  sub: ReactNode;
  withConnector?: boolean;
}) {
  return (
    <div className="relative bg-white px-4 py-3">
      {withConnector && (
        <span
          aria-hidden="true"
          className="absolute -left-[7px] top-1/2 z-10 hidden h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-slate-200 bg-white sm:block"
        />
      )}
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[9px] text-slate-500">
          {num}
        </span>
        <span>{label}</span>
      </div>
      <div
        className={`mt-1.5 text-lg font-semibold tracking-tight ${decisionValueTone(
          value,
        )}`}
      >
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[11px] leading-snug text-slate-500">
        {sub}
      </div>
    </div>
  );
}

function countRuleCites(re: RuleEvaluation, selected: Set<string>): number {
  if (selected.size === 0) return 0;
  const hit = (ids: string[]) => ids.some((id) => selected.has(id));
  let n = 0;
  re.reasonCodes.forEach((r) => {
    if (hit(r.supportingEvidenceIds)) n++;
  });
  re.missingFields.forEach((m) => {
    if (hit(m.supportingEvidenceIds)) n++;
  });
  re.conflictFlags.forEach((c) => {
    if (hit(c.supportingEvidenceIds)) n++;
  });
  re.routingReasonCodes.forEach((r) => {
    if (hit(r.supportingEvidenceIds)) n++;
  });
  return n;
}

function countLlmCites(ad: LLMAdvisory, selected: Set<string>): number {
  if (selected.size === 0 || ad.status !== "generated") return 0;
  const hit = (ids: string[]) => ids.some((id) => selected.has(id));
  let n = 0;
  ad.evidenceSummary.forEach((s) => {
    if (hit(s.supportingEvidenceIds)) n++;
  });
  ad.missingFieldAnalysis.forEach((m) => {
    if (hit(m.supportingEvidenceIds)) n++;
  });
  ad.riskFlags.forEach((r) => {
    if (hit(r.supportingEvidenceIds)) n++;
  });
  return n;
}

function BindingMapHeader() {
  const cols = [
    { num: "01", role: "Source", panel: "Evidence package" },
    { num: "02", role: "Decision", panel: "Deterministic rule" },
    { num: "03", role: "Context", panel: "LLM advisory" },
  ];
  return (
    <div
      aria-hidden="true"
      className="relative hidden min-[800px]:grid min-[800px]:grid-cols-3 min-[800px]:gap-4"
    >
      {cols.map((c) => (
        <div
          key={c.num}
          className="rounded-md border border-slate-100 bg-white px-3 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-slate-500"
        >
          <span className="font-semibold text-slate-700">
            {c.num} &middot; {c.role}
          </span>
          <span className="text-slate-300"> &middot; </span>
          <span>{c.panel}</span>
        </div>
      ))}
      <span className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
        cites &rarr;
      </span>
      <span className="absolute left-2/3 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
        cites &rarr;
      </span>
    </div>
  );
}

function SelectionSummaryStrip({
  selectedEvidenceIds,
  ruleCiteCount,
  llmCiteCount,
  onClearSelection,
}: {
  selectedEvidenceIds: string[];
  ruleCiteCount: number;
  llmCiteCount: number;
  onClearSelection: () => void;
}) {
  if (selectedEvidenceIds.length === 0) {
    return (
      <p className="px-1 font-mono text-[11px] italic text-slate-400">
        Select an evidence row or a cite pill to inspect its bindings across
        the three panels.
      </p>
    );
  }
  const rPlural = ruleCiteCount === 1 ? "" : "s";
  const lPlural = llmCiteCount === 1 ? "" : "s";
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-sm shadow-sm">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800">
        Selected
      </span>
      <span className="flex flex-wrap gap-1">
        {selectedEvidenceIds.map((id) => (
          <code
            key={id}
            className="inline-flex items-center rounded-full border border-amber-300 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-900"
          >
            {id}
          </code>
        ))}
      </span>
      <span className="text-slate-700">
        cited by{" "}
        <b className="font-semibold text-slate-900">
          {ruleCiteCount} rule item{rPlural}
        </b>{" "}
        and{" "}
        <b className="font-semibold text-slate-900">
          {llmCiteCount} LLM advisory item{lPlural}
        </b>
        .
      </span>
      <button
        type="button"
        onClick={onClearSelection}
        className="ml-auto inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500"
      >
        Clear selection
      </button>
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

  const headline = deriveHeadline(caseData);
  const topRule = topReasonCode(caseData.ruleEvaluation.reasonCodes);
  const topRouting = topReasonCode(caseData.ruleEvaluation.routingReasonCodes);
  const finalText = caseData.finalDecision?.decision ?? "pending";

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0 space-y-3">
            <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span
                aria-hidden="true"
                className="inline-block h-0.5 w-5 rounded bg-amber-400"
              />
              {caseEyebrow(caseData)}
            </p>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              {headline.lead}
              {headline.trail && (
                <>
                  {" "}
                  <span className="font-medium text-slate-500">
                    {headline.trail}
                  </span>
                </>
              )}
            </h1>
            <p className="max-w-[60ch] text-sm leading-snug text-slate-600">
              {caseData.description}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-slate-500">
              <MetaItem label="status" value={caseData.currentStatus} />
              <MetaItem label="stage" value={caseData.currentStage} />
              <MetaItem label="risk" value={caseData.riskLevel} />
              <MetaItem
                label="policy"
                value={caseData.ruleEvaluation.policyBundleVersion}
              />
              {caseData.llmAdvisory.status === "generated" && (
                <>
                  <MetaItem
                    label="prompt"
                    value={caseData.llmAdvisory.promptVersion}
                  />
                  <MetaItem
                    label="model"
                    value={caseData.llmAdvisory.modelVersion}
                  />
                </>
              )}
              {caseData.llmAdvisory.status === "skipped" && (
                <MetaItem label="llm" value="skipped" />
              )}
              {caseData.llmAdvisory.status === "failed" && (
                <>
                  <MetaItem
                    label="prompt"
                    value={caseData.llmAdvisory.promptVersion}
                  />
                  <MetaItem
                    label="model"
                    value={caseData.llmAdvisory.modelVersion}
                  />
                  <MetaItem label="llm" value="failed" />
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetCase}
            className="inline-flex shrink-0 items-center self-start justify-self-start rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 sm:justify-self-end"
          >
            Reset Case
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <TripleCell
            num="01"
            label="Rule decision"
            value={caseData.ruleEvaluation.decision}
            sub={
              <>
                <span className="font-semibold text-slate-700">
                  {caseData.ruleEvaluation.ruleSetVersion}
                </span>
                {topRule && <> · {topRule}</>}
              </>
            }
          />
          <TripleCell
            num="02"
            label="Routing decision"
            value={caseData.ruleEvaluation.routingDecision}
            sub={
              <>
                <span className="font-semibold text-slate-700">
                  {caseData.ruleEvaluation.policyBundleVersion}
                </span>
                {topRouting && <> · {topRouting}</>}
              </>
            }
            withConnector
          />
          <TripleCell
            num="03"
            label="Final decision"
            value={finalText}
            sub={finalDecisionSub(caseData)}
            withConnector
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
        <header className="space-y-1 px-1">
          <h2 className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <span>A</span>
            <span className="text-slate-300">&middot;</span>
            <span>Inputs &amp; Analysis</span>
            <span className="text-slate-300">&middot;</span>
            <span className="font-mono normal-case tracking-normal text-slate-700">
              Evidence-bound review map
            </span>
          </h2>
          <p className="font-mono text-[11px] text-slate-500">
            three surfaces &middot; one evidence package &middot; click any
            item to see its bindings
          </p>
        </header>
        <ReferralSummaryCard referralSummary={caseData.referralSummary} />
        <SelectionSummaryStrip
          selectedEvidenceIds={selectedEvidenceIds}
          ruleCiteCount={countRuleCites(
            caseData.ruleEvaluation,
            new Set(selectedEvidenceIds),
          )}
          llmCiteCount={countLlmCites(
            caseData.llmAdvisory,
            new Set(selectedEvidenceIds),
          )}
          onClearSelection={handleClearSelection}
        />
        <BindingMapHeader />
        <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 min-[800px]:grid-cols-3">
          <EvidencePanel
            evidenceRecords={caseData.evidenceRecords}
            selectedEvidenceIds={selectedEvidenceIds}
            onClearSelection={handleClearSelection}
            onSelectEvidence={handleSelectEvidence}
            normalizedFields={caseData.normalizedFields}
          />
          <RuleEvaluationCard
            ruleEvaluation={caseData.ruleEvaluation}
            onSelectEvidence={handleSelectEvidence}
            selectedEvidenceIds={selectedEvidenceIds}
          />
          <LLMAdvisoryCard
            llmAdvisory={caseData.llmAdvisory}
            onSelectEvidence={handleSelectEvidence}
            selectedEvidenceIds={selectedEvidenceIds}
          />
        </div>
        <p className="px-1 font-mono text-[11px] italic text-slate-500">
          Evidence binding is enforced by{" "}
          <code className="not-italic text-slate-700">
            supportingEvidenceIds
          </code>{" "}
          in mock data. LLM advisory cannot write{" "}
          <code className="not-italic text-slate-700">finalDecision</code>.
        </p>
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
