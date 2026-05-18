"use client";

import type { EvidenceRecord, ReferralCase } from "@/types/referral";

type Props = {
  evidenceRecords: EvidenceRecord[];
  selectedEvidenceIds?: string[];
  onClearSelection?: () => void;
  onSelectEvidence?: (ids: string[]) => void;
  normalizedFields?: ReferralCase["normalizedFields"];
};

function confidenceTone(c: EvidenceRecord["confidence"]): string {
  if (c === "high")
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (c === "medium") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

function NormalizedChip({ name, value }: { name: string; value: unknown }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px]">
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {name}
      </span>
      <span className="font-medium text-slate-700">{String(value)}</span>
    </span>
  );
}

export default function EvidencePanel({
  evidenceRecords,
  selectedEvidenceIds = [],
  onSelectEvidence,
  normalizedFields,
}: Props) {
  const selectedSet = new Set(selectedEvidenceIds);
  const normalizedEntries = normalizedFields
    ? Object.entries(normalizedFields)
    : [];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-baseline gap-2">
          <span
            aria-hidden="true"
            className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 font-mono text-[10px] font-bold text-white"
          >
            01
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
            Source &middot; Evidence package
          </span>
        </h2>
        <span className="font-mono text-[10px] text-slate-400">
          {evidenceRecords.length} record
          {evidenceRecords.length === 1 ? "" : "s"}
        </span>
      </header>

      {normalizedEntries.length > 0 && (
        <div className="mb-3 rounded-md border border-slate-100 bg-slate-50/60 p-2.5">
          <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Normalized fields
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {normalizedEntries.map(([k, v]) => (
              <NormalizedChip key={k} name={k} value={v} />
            ))}
          </div>
        </div>
      )}

      <ul className="space-y-1.5">
        {evidenceRecords.map((e) => {
          const selected = selectedSet.has(e.id);
          const base =
            "block w-full rounded-md border border-l-2 p-2.5 text-left transition";
          const tone = selected
            ? "border-amber-200 border-l-amber-400 bg-amber-50/50"
            : "border-slate-100 border-l-slate-200 bg-slate-50/50";
          const hover = onSelectEvidence
            ? " cursor-pointer hover:border-slate-200 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            : "";
          const cls = `${base} ${tone}${hover}`;
          const content = (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-semibold text-slate-900">
                      {e.label}
                    </span>
                    <code className="font-mono text-[10px] text-slate-400">
                      {e.field}
                    </code>
                  </div>
                  <div className="mt-0.5 font-mono text-[12px] text-slate-700">
                    {String(e.value)}
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] ${confidenceTone(e.confidence)}`}
                >
                  {e.confidence}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[10px] text-slate-500">
                <span>{e.sourceType}</span>
                <span className="text-slate-300">&middot;</span>
                <span>{e.sourceName}</span>
                {e.usedBy.length > 0 && (
                  <>
                    <span className="text-slate-300">&middot;</span>
                    <span>used by: {e.usedBy.join(" · ")}</span>
                  </>
                )}
                <span className="text-slate-300">&middot;</span>
                <code className="text-slate-700">{e.id}</code>
              </div>
            </>
          );
          return (
            <li key={e.id}>
              {onSelectEvidence ? (
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectEvidence([e.id])}
                  className={cls}
                >
                  {content}
                </button>
              ) : (
                <div className={cls}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
