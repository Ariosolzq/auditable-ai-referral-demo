import { Fragment } from "react";
import type { ReferralCase } from "@/types/referral";

type Props = {
  referralSummary: ReferralCase["referralSummary"];
};

export default function ReferralSummaryCard({ referralSummary }: Props) {
  const rows: [string, string][] = [
    ["Referral ID", referralSummary.referralId],
    ["Patient reference", referralSummary.patientReferenceId],
    ["Source system", referralSummary.sourceSystem],
    ["Received at", referralSummary.receivedAt],
    ["Service type", referralSummary.serviceType],
    ["State", referralSummary.state],
    ["Payer type", referralSummary.payerType],
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
        Referral Summary
      </h2>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
        {rows.map(([label, value]) => (
          <Fragment key={label}>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {label}
            </dt>
            <dd className="break-all text-right text-xs font-medium text-slate-800">
              {value}
            </dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
}
