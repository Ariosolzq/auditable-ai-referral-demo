import type { ReferralCase } from "@/types/referral";

type Props = {
  normalizedFields: ReferralCase["normalizedFields"];
};

export default function NormalizedFieldsCard({ normalizedFields }: Props) {
  const entries = Object.entries(normalizedFields);
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Normalized Fields
      </h2>
      <div className="space-y-2">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <span className="text-slate-500">{key}</span>
            <span className="text-right font-medium text-slate-900">
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
