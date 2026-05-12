"use client";

import { useState } from "react";
import AuditEventPayloadPanel from "@/components/workflow/AuditEventPayloadPanel";
import AuditTimeline from "@/components/workflow/AuditTimeline";
import EvidencePanel from "@/components/workflow/EvidencePanel";
import HumanReviewPanel from "@/components/workflow/HumanReviewPanel";
import LLMAdvisoryCard from "@/components/workflow/LLMAdvisoryCard";
import NormalizedFieldsCard from "@/components/workflow/NormalizedFieldsCard";
import ReferralSummaryCard from "@/components/workflow/ReferralSummaryCard";
import RuleEvaluationCard from "@/components/workflow/RuleEvaluationCard";
import type { ReferralCase } from "@/types/referral";

type Props = {
  caseData: ReferralCase;
};

export default function CaseWorkspaceClient({ caseData }: Props) {
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [selectedAuditEventId, setSelectedAuditEventId] = useState<
    string | null
  >(caseData.auditEvents[0]?.id ?? null);

  const handleSelectEvidence = (ids: string[]) => {
    setSelectedEvidenceIds(ids);
  };

  const handleClearSelection = () => {
    setSelectedEvidenceIds([]);
  };

  const handleSelectAuditEvent = (eventId: string) => {
    setSelectedAuditEventId(eventId);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr_0.9fr]">
      <div className="space-y-4">
        <ReferralSummaryCard referralSummary={caseData.referralSummary} />
        <NormalizedFieldsCard normalizedFields={caseData.normalizedFields} />
        <EvidencePanel
          evidenceRecords={caseData.evidenceRecords}
          selectedEvidenceIds={selectedEvidenceIds}
          onClearSelection={handleClearSelection}
        />
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
        <HumanReviewPanel humanReview={caseData.humanReview} />
      </div>
      <div className="space-y-4">
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
    </div>
  );
}
