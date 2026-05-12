import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cases } from "../data/cases";
import {
  buildInitialState,
  caseReducer,
  type CaseDetailAction,
} from "../lib/caseReducer";
import type { AuditEvent, ReferralCase } from "../types/referral";

// Fixed system time pinned via vi.useFakeTimers so every appended event
// timestamp and humanReview.submittedAt deterministically equals FIXED_ISO.
const FIXED_ISO = "2026-05-12T12:00:00.000Z";

function getCase(id: string): ReferralCase {
  const c = cases.find((c) => c.id === id);
  if (!c) throw new Error(`mock case ${id} not found`);
  return c;
}

function lastEventOfType(
  events: AuditEvent[],
  type: AuditEvent["eventType"],
): AuditEvent {
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].eventType === type) return events[i];
  }
  throw new Error(`event ${type} not found in audit timeline`);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(FIXED_ISO));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("caseReducer SUBMIT_REVIEW Case B confirm ACCEPT", () => {
  it("appends HumanReviewSubmitted + FinalDecisionRecorded and maps to accepted", () => {
    const caseB = getCase("case-b");
    const initial = buildInitialState(caseB);
    const beforeEvents = initial.caseData.auditEvents;
    const hrRequestedId = lastEventOfType(
      beforeEvents,
      "HumanReviewRequested",
    ).id;

    const action: CaseDetailAction = {
      type: "SUBMIT_REVIEW",
      reviewerAction: "confirm",
      finalDecision: "ACCEPT",
      reviewerNote: "Confirmed after checking required fields.",
    };
    const after = caseReducer(initial, action);

    const events = after.caseData.auditEvents;
    const appended = events.slice(beforeEvents.length);
    const types = appended.map((e) => e.eventType);

    expect(events.length).toBe(beforeEvents.length + 2);
    expect(types).toEqual(["HumanReviewSubmitted", "FinalDecisionRecorded"]);

    for (const e of appended) {
      expect(typeof e.id).toBe("string");
      expect(e.id.length).toBeGreaterThan(0);
    }
    expect(new Set(appended.map((e) => e.id)).size).toBe(appended.length);

    expect(after.caseData.currentStatus).toBe("accepted");
    expect(after.caseData.currentStage).toBe("completed");

    const hr = after.caseData.humanReview;
    expect(hr.status).toBe("submitted");
    if (hr.status === "not_required") throw new Error("unexpected narrowing");
    expect(hr.reviewerAction).toBe("confirm");
    expect(hr.finalDecision).toBe("ACCEPT");
    expect(hr.overrideFlag).toBe(false);
    expect(hr.reviewerNote).toBe("Confirmed after checking required fields.");
    expect(hr.submittedAt).toBe(FIXED_ISO);

    expect(after.caseData.finalDecision).toBeDefined();
    expect(after.caseData.finalDecision?.decision).toBe("ACCEPT");
    expect(after.caseData.finalDecision?.decidedBy).toBe("reviewer");
    expect(after.caseData.finalDecision?.overrideFlag).toBe(false);
    expect(after.caseData.finalDecision?.decidedAt).toBe(FIXED_ISO);

    const [submitted, finalRecorded] = appended;
    expect(submitted.actor).toBe("reviewer");
    expect(finalRecorded.actor).toBe("workflow-engine");
    expect(submitted.timestamp).toBe(FIXED_ISO);
    expect(finalRecorded.timestamp).toBe(FIXED_ISO);

    expect(submitted.causationEventId).toBe(hrRequestedId);
    expect(finalRecorded.causationEventId).toBe(submitted.id);

    expect(submitted.payload.reviewerNote).toBe(
      "Confirmed after checking required fields.",
    );

    expect(after.selectedEvidenceIds).toEqual(initial.selectedEvidenceIds);
    expect(after.selectedAuditEventId).toBe(initial.selectedAuditEventId);
  });

  it("with finalDecision REJECT maps currentStatus to rejected", () => {
    const caseB = getCase("case-b");
    const initial = buildInitialState(caseB);
    const after = caseReducer(initial, {
      type: "SUBMIT_REVIEW",
      reviewerAction: "confirm",
      finalDecision: "REJECT",
      reviewerNote: "",
    });
    expect(after.caseData.currentStatus).toBe("rejected");
    expect(after.caseData.currentStage).toBe("completed");
    expect(after.caseData.finalDecision?.decision).toBe("REJECT");
  });
});

describe("caseReducer SUBMIT_REVIEW Case C override ACCEPT", () => {
  it("appends HumanReviewSubmitted + HumanOverrideSubmitted + FinalDecisionRecorded", () => {
    const caseC = getCase("case-c");
    const initial = buildInitialState(caseC);
    const beforeEvents = initial.caseData.auditEvents;
    const hrRequestedId = lastEventOfType(
      beforeEvents,
      "HumanReviewRequested",
    ).id;

    const action: CaseDetailAction = {
      type: "SUBMIT_REVIEW",
      reviewerAction: "override",
      finalDecision: "ACCEPT",
      overrideReason:
        "Reviewer confirmed current eligibility evidence after manual review.",
      reviewerNote: "Manual override accepted for reducer test.",
    };
    const after = caseReducer(initial, action);

    const events = after.caseData.auditEvents;
    const appended = events.slice(beforeEvents.length);
    const types = appended.map((e) => e.eventType);

    expect(events.length).toBe(beforeEvents.length + 3);
    expect(types).toEqual([
      "HumanReviewSubmitted",
      "HumanOverrideSubmitted",
      "FinalDecisionRecorded",
    ]);

    for (const e of appended) {
      expect(typeof e.id).toBe("string");
      expect(e.id.length).toBeGreaterThan(0);
    }
    expect(new Set(appended.map((e) => e.id)).size).toBe(appended.length);

    expect(after.caseData.currentStatus).toBe("accepted");
    expect(after.caseData.currentStage).toBe("completed");

    const hr = after.caseData.humanReview;
    expect(hr.status).toBe("submitted");
    if (hr.status === "not_required") throw new Error("unexpected narrowing");
    expect(hr.reviewerAction).toBe("override");
    expect(hr.finalDecision).toBe("ACCEPT");
    expect(hr.overrideFlag).toBe(true);
    expect(hr.overrideReason).toBe(
      "Reviewer confirmed current eligibility evidence after manual review.",
    );
    expect(hr.reviewerNote).toBe("Manual override accepted for reducer test.");
    expect(hr.submittedAt).toBe(FIXED_ISO);

    expect(after.caseData.finalDecision).toBeDefined();
    expect(after.caseData.finalDecision?.decision).toBe("ACCEPT");
    expect(after.caseData.finalDecision?.decidedBy).toBe("reviewer");
    expect(after.caseData.finalDecision?.overrideFlag).toBe(true);
    expect(after.caseData.finalDecision?.decidedAt).toBe(FIXED_ISO);

    const [submitted, override, finalRecorded] = appended;
    expect(submitted.actor).toBe("reviewer");
    expect(override.actor).toBe("reviewer");
    expect(finalRecorded.actor).toBe("workflow-engine");
    expect(submitted.timestamp).toBe(FIXED_ISO);
    expect(override.timestamp).toBe(FIXED_ISO);
    expect(finalRecorded.timestamp).toBe(FIXED_ISO);

    expect(submitted.causationEventId).toBe(hrRequestedId);
    expect(override.causationEventId).toBe(submitted.id);
    expect(finalRecorded.causationEventId).toBe(override.id);
  });
});

describe("caseReducer SUBMIT_REVIEW no-op cases", () => {
  it("Case A (not_required) returns same state reference", () => {
    const caseA = getCase("case-a");
    const before = buildInitialState(caseA);
    const after = caseReducer(before, {
      type: "SUBMIT_REVIEW",
      reviewerAction: "confirm",
      finalDecision: "ACCEPT",
      reviewerNote: "",
    });

    expect(after).toBe(before);
    expect(after.caseData.auditEvents.length).toBe(
      before.caseData.auditEvents.length,
    );
    expect(after.caseData.currentStatus).toBe(before.caseData.currentStatus);
    expect(after.caseData.currentStage).toBe(before.caseData.currentStage);
    expect(after.caseData.humanReview.status).toBe("not_required");
    expect(after.caseData.finalDecision).toBe(before.caseData.finalDecision);
  });

  it("duplicate submit returns same submitted state reference", () => {
    const caseB = getCase("case-b");
    const initial = buildInitialState(caseB);
    const submitted = caseReducer(initial, {
      type: "SUBMIT_REVIEW",
      reviewerAction: "confirm",
      finalDecision: "ACCEPT",
      reviewerNote: "first",
    });
    const duplicate = caseReducer(submitted, {
      type: "SUBMIT_REVIEW",
      reviewerAction: "override",
      finalDecision: "REJECT",
      overrideReason: "second attempt should be ignored",
      reviewerNote: "second",
    });

    expect(duplicate).toBe(submitted);
    expect(duplicate.caseData.auditEvents.length).toBe(
      submitted.caseData.auditEvents.length,
    );
    expect(duplicate.caseData.finalDecision?.decision).toBe("ACCEPT");
    expect(duplicate.caseData.currentStatus).toBe("accepted");

    const hr = duplicate.caseData.humanReview;
    if (hr.status === "not_required") throw new Error("unexpected narrowing");
    expect(hr.reviewerAction).toBe("confirm");
  });

  it("override without overrideReason returns same state reference", () => {
    const caseC = getCase("case-c");
    const before = buildInitialState(caseC);
    const after = caseReducer(before, {
      type: "SUBMIT_REVIEW",
      reviewerAction: "override",
      finalDecision: "ACCEPT",
      reviewerNote: "no reason given",
    });

    expect(after).toBe(before);
    expect(after.caseData.auditEvents.length).toBe(
      before.caseData.auditEvents.length,
    );
    expect(after.caseData.currentStatus).toBe("needs_review");
    expect(after.caseData.currentStage).toBe("waiting_for_human_review");
    const hr = after.caseData.humanReview;
    if (hr.status === "not_required") throw new Error("unexpected narrowing");
    expect(hr.status).toBe("in_progress");
    expect(after.caseData.finalDecision).toBeUndefined();
  });
});

describe("caseReducer RESET_CASE", () => {
  it("restores initial case state and resets selections (Phase 7a override of spec §9.5: selectedAuditEventId reverts to first event id, not null)", () => {
    const caseB = getCase("case-b");
    const initial = buildInitialState(caseB);
    const submitted = caseReducer(initial, {
      type: "SUBMIT_REVIEW",
      reviewerAction: "confirm",
      finalDecision: "ACCEPT",
      reviewerNote: "to be reset",
    });
    const reset = caseReducer(submitted, {
      type: "RESET_CASE",
      initialCase: caseB,
    });

    expect(reset.caseData.currentStatus).toBe(caseB.currentStatus);
    expect(reset.caseData.currentStage).toBe(caseB.currentStage);
    expect(reset.caseData.auditEvents.length).toBe(caseB.auditEvents.length);
    expect(reset.caseData.humanReview.status).toBe(caseB.humanReview.status);
    expect(reset.caseData.finalDecision).toBe(caseB.finalDecision);

    expect(reset.selectedEvidenceIds).toEqual([]);
    expect(reset.selectedAuditEventId).toBe(caseB.auditEvents[0]?.id ?? null);

    expect(reset.caseData).not.toBe(caseB);
    expect(reset.caseData.auditEvents).not.toBe(caseB.auditEvents);
  });
});

describe("caseReducer selection actions", () => {
  it("SELECT_EVIDENCE and CLEAR_EVIDENCE_SELECTION only touch selectedEvidenceIds", () => {
    const caseB = getCase("case-b");
    const initial = buildInitialState(caseB);
    const selected = caseReducer(initial, {
      type: "SELECT_EVIDENCE",
      evidenceIds: [
        "ev_b_eligibility_active",
        "ev_b_physician_order_missing",
      ],
    });
    expect(selected.selectedEvidenceIds).toEqual([
      "ev_b_eligibility_active",
      "ev_b_physician_order_missing",
    ]);
    expect(selected.caseData).toBe(initial.caseData);
    expect(selected.selectedAuditEventId).toBe(initial.selectedAuditEventId);

    const cleared = caseReducer(selected, { type: "CLEAR_EVIDENCE_SELECTION" });
    expect(cleared.selectedEvidenceIds).toEqual([]);
  });

  it("SELECT_AUDIT_EVENT only changes selectedAuditEventId", () => {
    const caseC = getCase("case-c");
    const initial = buildInitialState(caseC);
    const after = caseReducer(initial, {
      type: "SELECT_AUDIT_EVENT",
      eventId: "evt_c_05",
    });
    expect(after.selectedAuditEventId).toBe("evt_c_05");
    expect(after.caseData).toBe(initial.caseData);
    expect(after.selectedEvidenceIds).toEqual(initial.selectedEvidenceIds);
  });
});
