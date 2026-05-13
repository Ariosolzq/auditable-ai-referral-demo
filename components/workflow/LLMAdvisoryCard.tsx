"use client";

import type { ReactNode } from "react";
import type { LLMAdvisory } from "@/types/referral";

type Props = {
  llmAdvisory: LLMAdvisory;
  onSelectEvidence?: (ids: string[]) => void;
  selectedEvidenceIds?: string[];
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

function Chip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs">
      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <span className="font-medium text-slate-700">{value}</span>
    </span>
  );
}

function statusTone(s: LLMAdvisory["status"]): string {
  if (s === "generated") return "bg-sky-50 text-sky-800 border-sky-200";
  if (s === "failed") return "bg-rose-50 text-rose-800 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function severityTone(s: string): string {
  if (s === "blocking" || s === "high")
    return "bg-rose-50 text-rose-800 border-rose-200";
  if (s === "medium") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function confidenceTone(c: "low" | "medium" | "high"): string {
  if (c === "high")
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (c === "medium") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function rowClass(related: boolean): string {
  return related
    ? "rounded-md border border-amber-300 border-l-4 border-l-amber-500 bg-amber-50/50 p-2.5 text-sm shadow-sm"
    : "rounded-md border border-slate-100 bg-slate-50/50 p-2.5 text-sm";
}

function BindingCue({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
      />
      evidence-bound
      <span className="rounded bg-amber-200 px-1 font-bold text-amber-800">
        {count}
      </span>
    </span>
  );
}

function SupportingEvidence({
  ids,
  onSelectEvidence,
}: {
  ids: string[];
  onSelectEvidence?: (ids: string[]) => void;
}) {
  if (ids.length === 0) return null;
  if (!onSelectEvidence) {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <BindingCue count={ids.length} />
        {ids.map((id, i) => (
          <span key={id}>
            <code>{id}</code>
            {i < ids.length - 1 ? ", " : ""}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
      <BindingCue count={ids.length} />
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelectEvidence(ids)}
          className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500"
        >
          {id}
        </button>
      ))}
    </div>
  );
}

export default function LLMAdvisoryCard({
  llmAdvisory,
  onSelectEvidence,
  selectedEvidenceIds,
}: Props) {
  const selectedSet = new Set(selectedEvidenceIds ?? []);
  const isRelated = (ids: string[]): boolean =>
    selectedSet.size > 0 && ids.some((id) => selectedSet.has(id));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Mock LLM Advisory
      </h2>

      <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Advisory only — this output does not change the final decision.
      </div>

      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-500">Status</span>
        <Badge className={statusTone(llmAdvisory.status)}>
          {llmAdvisory.status}
        </Badge>
      </div>

      {llmAdvisory.status === "skipped" && (
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Reason</span>
            <span className="text-right font-medium text-slate-900">
              {llmAdvisory.reason}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Policy bundle version</span>
            <code className="text-xs text-slate-700">
              {llmAdvisory.policyBundleVersion}
            </code>
          </div>
        </div>
      )}

      {llmAdvisory.status === "failed" && (
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Error code</span>
            <code className="text-xs text-slate-700">
              {llmAdvisory.errorCode}
            </code>
          </div>
          <p className="text-slate-700">{llmAdvisory.errorMessage}</p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Next action</span>
            <Badge className="border-slate-200 bg-slate-100 text-slate-700">
              {llmAdvisory.nextAction}
            </Badge>
          </div>
        </div>
      )}

      {llmAdvisory.status === "generated" && (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <Chip
              label="prompt"
              value={
                <code className="font-mono">{llmAdvisory.promptVersion}</code>
              }
            />
            <Chip
              label="model"
              value={
                <code className="font-mono">{llmAdvisory.modelVersion}</code>
              }
            />
            <Chip
              label="policy"
              value={
                <code className="font-mono">
                  {llmAdvisory.policyBundleVersion}
                </code>
              }
            />
            <Chip
              label="requires human review"
              value={llmAdvisory.requiresHumanReview ? "true" : "false"}
            />
          </div>

          <div className="mb-2.5">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Evidence summary
            </h3>
            {llmAdvisory.evidenceSummary.length === 0 ? (
              <p className="text-sm text-slate-500">None</p>
            ) : (
              <ul className="space-y-1.5">
                {llmAdvisory.evidenceSummary.map((s) => {
                  const related = isRelated(s.supportingEvidenceIds);
                  return (
                    <li key={s.id} className={rowClass(related)}>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Badge className={confidenceTone(s.confidence)}>
                          {s.confidence}
                        </Badge>
                        <code className="text-xs text-slate-700">{s.id}</code>
                      </div>
                      <p className="mt-1 text-xs leading-snug text-slate-700">
                        {s.summary}
                      </p>
                      <SupportingEvidence
                        ids={s.supportingEvidenceIds}
                        onSelectEvidence={onSelectEvidence}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mb-2.5">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Missing field analysis
            </h3>
            {llmAdvisory.missingFieldAnalysis.length === 0 ? (
              <p className="text-sm text-slate-500">None</p>
            ) : (
              <ul className="space-y-1.5">
                {llmAdvisory.missingFieldAnalysis.map((m) => {
                  const related = isRelated(m.supportingEvidenceIds);
                  return (
                    <li key={m.field} className={rowClass(related)}>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Badge className={severityTone(m.severity)}>
                          {m.severity}
                        </Badge>
                        <code className="text-xs text-slate-700">{m.field}</code>
                      </div>
                      <p className="mt-1 text-xs leading-snug text-slate-700">
                        {m.explanation}
                      </p>
                      <SupportingEvidence
                        ids={m.supportingEvidenceIds}
                        onSelectEvidence={onSelectEvidence}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mb-2.5">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Risk flags
            </h3>
            {llmAdvisory.riskFlags.length === 0 ? (
              <p className="text-sm text-slate-500">None</p>
            ) : (
              <ul className="space-y-1.5">
                {llmAdvisory.riskFlags.map((r) => {
                  const related = isRelated(r.supportingEvidenceIds);
                  return (
                    <li key={r.code} className={rowClass(related)}>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Badge className={severityTone(r.severity)}>
                          {r.severity}
                        </Badge>
                        <code className="text-xs text-slate-700">{r.code}</code>
                      </div>
                      <p className="mt-1 text-xs leading-snug text-slate-700">
                        {r.explanation}
                      </p>
                      <SupportingEvidence
                        ids={r.supportingEvidenceIds}
                        onSelectEvidence={onSelectEvidence}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mb-2.5">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reviewer notes
            </h3>
            <p className="text-sm leading-snug text-slate-700">
              {llmAdvisory.reviewerNotes}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Unsupported claims
            </h3>
            {llmAdvisory.unsupportedClaims.length === 0 ? (
              <p className="text-sm text-slate-500">None</p>
            ) : (
              <ul className="space-y-1.5">
                {llmAdvisory.unsupportedClaims.map((u, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5 text-sm"
                  >
                    <p className="font-medium text-slate-900">{u.claim}</p>
                    <p className="text-xs text-slate-500">{u.reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <details className="mt-3 rounded-md border border-slate-200 bg-slate-50/40">
        <summary className="cursor-pointer px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 hover:bg-slate-100/60">
          Supporting detail · advisory JSON
        </summary>
        <div className="border-t border-slate-100 p-3">
          <p className="mb-1.5 text-[10px] italic text-slate-400">
            Mock advisory object. Not a real LLM API response.
          </p>
          <pre className="max-h-[280px] overflow-auto rounded-md border border-slate-200 bg-white p-2 text-[10px] leading-relaxed text-slate-700">
            {JSON.stringify(llmAdvisory, null, 2)}
          </pre>
        </div>
      </details>
    </section>
  );
}
