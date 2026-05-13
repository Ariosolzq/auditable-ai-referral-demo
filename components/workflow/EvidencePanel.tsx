"use client";

import type { ReactNode } from "react";
import type { EvidenceRecord, ReferralCase } from "@/types/referral";

type Props = {
  evidenceRecords: EvidenceRecord[];
  selectedEvidenceIds?: string[];
  onClearSelection?: () => void;
  normalizedFields?: ReferralCase["normalizedFields"];
};

function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function confidenceTone(c: EvidenceRecord["confidence"]): string {
  if (c === "high")
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (c === "medium") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
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
  onClearSelection,
  normalizedFields,
}: Props) {
  const selectedCount = selectedEvidenceIds.length;
  const selectedSet = new Set(selectedEvidenceIds);
  const normalizedEntries = normalizedFields
    ? Object.entries(normalizedFields)
    : [];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Evidence Package
          </h2>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
            Selecting a chip highlights supporting evidence
          </span>
        </div>
        {selectedCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
              />
              Selected evidence
              <span className="rounded bg-amber-200 px-1 font-bold text-amber-800">
                {selectedCount}
              </span>
            </span>
            {onClearSelection && (
              <button
                type="button"
                onClick={onClearSelection}
                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
              >
                Clear selection ({selectedCount})
              </button>
            )}
          </div>
        )}
      </div>

      {normalizedEntries.length > 0 && (
        <div className="mb-3 rounded-md border border-slate-100 bg-slate-50/60 p-2.5">
          <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Normalized fields
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {normalizedEntries.map(([k, v]) => (
              <NormalizedChip key={k} name={k} value={v} />
            ))}
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {evidenceRecords.map((e) => {
          const selected = selectedSet.has(e.id);
          return (
            <li
              key={e.id}
              className={`rounded-md border p-3 text-sm transition ${
                selected
                  ? "border-sky-300 border-l-4 border-l-amber-400 bg-sky-50 ring-1 ring-sky-200"
                  : "border-slate-100 bg-slate-50/50"
              }`}
            >
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <code className="text-xs text-slate-600">{e.id}</code>
                <div className="flex gap-1">
                  <Badge className={confidenceTone(e.confidence)}>
                    {e.confidence}
                  </Badge>
                  {e.usedBy.map((u) => (
                    <Badge
                      key={u}
                      className="border-slate-200 bg-slate-100 text-slate-700"
                    >
                      {u}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="font-medium text-slate-900">{e.label}</div>
              <div className="text-slate-700">{String(e.value)}</div>
              <div className="mt-1 text-xs text-slate-500">
                field: <code>{e.field}</code> · {e.sourceType} · {e.sourceName}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
