import { cases } from "../data/cases";
import { buildInitialState, caseReducer } from "../lib/caseReducer";

const caseC = cases.find((c) => c.id === "case-c");
if (!caseC) {
  console.error("case-c not found in mock data");
  process.exit(1);
}

const initialState = buildInitialState(caseC);
const beforeLength = initialState.caseData.auditEvents.length;

const afterState = caseReducer(initialState, {
  type: "SUBMIT_REVIEW",
  reviewerAction: "override",
  finalDecision: "ACCEPT",
  overrideReason:
    "Reviewer confirmed current eligibility evidence after manual review.",
  reviewerNote: "Manual override accepted for demo verification.",
});

const afterLength = afterState.caseData.auditEvents.length;
const appended = afterState.caseData.auditEvents.slice(beforeLength);
const review = afterState.caseData.humanReview;

console.log("=== Case C SUBMIT_REVIEW override scenario ===");
console.log("before auditEvents.length:", beforeLength);
console.log("after auditEvents.length:", afterLength);
console.log(
  "appended event types:",
  appended.map((e) => e.eventType),
);
console.log("currentStatus:", afterState.caseData.currentStatus);
console.log("currentStage:", afterState.caseData.currentStage);
console.log("humanReview.status:", review.status);

if (review.status !== "not_required") {
  console.log("humanReview.reviewerAction:", review.reviewerAction);
  console.log("humanReview.finalDecision:", review.finalDecision);
  console.log("humanReview.overrideFlag:", review.overrideFlag);
  console.log("humanReview.overrideReason:", review.overrideReason);
  console.log("humanReview.reviewerNote:", review.reviewerNote);
  console.log("humanReview.submittedAt:", review.submittedAt);
}

console.log("finalDecision:", afterState.caseData.finalDecision);

console.log("=== Appended events with causationEventId ===");
for (const e of appended) {
  console.log(
    `  ${e.id} (${e.eventType}) actor=${e.actor} caused by: ${e.causationEventId ?? "(none)"}`,
  );
}
