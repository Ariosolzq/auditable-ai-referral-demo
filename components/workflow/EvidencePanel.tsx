import type { ReactNode } from "react";
import type { EvidenceRecord } from "@/types/referral";

type Props = {
  evidenceRecords: EvidenceRecord[];
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

export default function EvidencePanel({ evidenceRecords }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Evidence Package
      </h2>
      <ul className="space-y-2">
        {evidenceRecords.map((e) => (
          <li
            key={e.id}
            className="rounded-md border border-slate-100 bg-slate-50/50 p-3 text-sm"
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
        ))}
      </ul>
    </section>
  );
}
