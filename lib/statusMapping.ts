import type { FinalDecisionValue, ReferralStatus } from "@/types/referral";

export function finalDecisionToStatus(
  decision: FinalDecisionValue,
): Extract<ReferralStatus, "accepted" | "rejected"> {
  return decision === "ACCEPT" ? "accepted" : "rejected";
}
