import type { ReferralCase } from "@/types/referral";

type Props = {
  referralSummary: ReferralCase["referralSummary"];
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

export default function ReferralSummaryCard({ referralSummary }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Referral Summary
      </h2>
      <div className="space-y-2">
        <Field label="Referral ID" value={referralSummary.referralId} />
        <Field
          label="Patient reference"
          value={referralSummary.patientReferenceId}
        />
        <Field label="Source system" value={referralSummary.sourceSystem} />
        <Field label="Received at" value={referralSummary.receivedAt} />
        <Field label="Service type" value={referralSummary.serviceType} />
        <Field label="State" value={referralSummary.state} />
        <Field label="Payer type" value={referralSummary.payerType} />
      </div>
    </section>
  );
}
