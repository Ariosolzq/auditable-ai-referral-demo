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

function statusTone(s: LLMAdvisory["status"]): string {
  if (s === "generated") return "bg-violet-50 text-violet-800 border-violet-200";
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
    ? "rounded-md border border-amber-200 border-l-2 border-l-amber-400 bg-amber-50/50 p-2.5 text-sm"
    : "rounded-md border border-slate-100 border-l-2 border-l-slate-200 bg-slate-50/50 p-2.5 text-sm";
}

function CiteList({
  ids,
  onSelectEvidence,
}: {
  ids: string[];
  onSelectEvidence?: (ids: string[]) => void;
}) {
  if (ids.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-amber-700">
        cites
      </span>
      {ids.map((id) =>
        onSelectEvidence ? (
          <button
            key={id}
            type="button"
            onClick={() => onSelectEvidence(ids)}
            className="inline-flex items-center rounded border border-amber-200 bg-amber-50/70 px-1.5 py-0.5 font-mono text-[11px] text-amber-900 hover:border-amber-300 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500"
          >
            {id}
          </button>
        ) : (
          <code
            key={id}
            className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-700"
          >
            {id}
          </code>
        ),
      )}
    </div>
  );
}

function countRelated(
  rows: Array<{ supportingEvidenceIds: string[] }>,
  selected: Set<string>,
): number {
  if (selected.size === 0) return 0;
  return rows.filter((r) =>
    r.supportingEvidenceIds.some((id) => selected.has(id)),
  ).length;
}

function PanelHeader({ citeCount }: { citeCount: number }) {
  return (
    <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="flex items-baseline gap-2">
        <span
          aria-hidden="true"
          className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-violet-500 font-mono text-[10px] font-bold text-white"
        >
          03
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700">
          Context &middot; LLM advisory
        </span>
      </h2>
      {citeCount > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-violet-800">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500"
          />
          {citeCount} cite selection
        </span>
      )}
    </header>
  );
}

function AdvisoryNote() {
  return (
    <div className="mb-3 flex items-start gap-2 rounded-md border border-violet-200 bg-violet-50/60 px-3 py-2 text-xs leading-snug text-violet-900">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-sm bg-violet-600 font-mono text-[9px] font-bold text-white"
      >
        !
      </span>
      <p>
        Advisory output. Cannot set{" "}
        <code className="rounded-sm border border-violet-200 bg-white/70 px-1 font-mono text-[10px] text-violet-900">
          finalDecision
        </code>
        . Every claim cites an evidence ID.
      </p>
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

  const citeCount =
    llmAdvisory.status === "generated"
      ? countRelated(llmAdvisory.evidenceSummary, selectedSet) +
        countRelated(llmAdvisory.missingFieldAnalysis, selectedSet) +
        countRelated(llmAdvisory.riskFlags, selectedSet)
      : 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <PanelHeader citeCount={citeCount} />
      <AdvisoryNote />

      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Status
        </span>
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
            <code className="font-mono text-xs text-slate-700">
              {llmAdvisory.policyBundleVersion}
            </code>
          </div>
        </div>
      )}

      {llmAdvisory.status === "failed" && (
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Error code</span>
            <code className="font-mono text-xs text-slate-700">
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
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-slate-500">
            <span>
              <span className="font-semibold text-slate-600">prompt</span>{" "}
              {llmAdvisory.promptVersion}
            </span>
            <span className="text-slate-300">&middot;</span>
            <span>
              <span className="font-semibold text-slate-600">model</span>{" "}
              {llmAdvisory.modelVersion}
            </span>
            <span className="text-slate-300">&middot;</span>
            <span>
              <span className="font-semibold text-slate-600">policy</span>{" "}
              {llmAdvisory.policyBundleVersion}
            </span>
            <span className="text-slate-300">&middot;</span>
            <span>
              <span className="font-semibold text-slate-600">
                requires review
              </span>{" "}
              {llmAdvisory.requiresHumanReview ? "true" : "false"}
            </span>
          </div>

          <div className="mb-2.5">
            <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
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
                        <code className="font-mono text-xs text-slate-700">
                          {s.id}
                        </code>
                      </div>
                      <p className="mt-1 text-xs leading-snug text-slate-700">
                        {s.summary}
                      </p>
                      <CiteList
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
            <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
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
                        <code className="font-mono text-xs text-slate-700">
                          {m.field}
                        </code>
                      </div>
                      <p className="mt-1 text-xs leading-snug text-slate-700">
                        {m.explanation}
                      </p>
                      <CiteList
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
            <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
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
                        <code className="font-mono text-xs text-slate-700">
                          {r.code}
                        </code>
                      </div>
                      <p className="mt-1 text-xs leading-snug text-slate-700">
                        {r.explanation}
                      </p>
                      <CiteList
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
            <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Reviewer notes
            </h3>
            <p className="rounded-md border border-slate-100 bg-slate-50/60 p-2.5 text-sm leading-snug text-slate-700">
              {llmAdvisory.reviewerNotes}
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
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
        <summary className="cursor-pointer px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 hover:bg-slate-100/60">
          Supporting detail &middot; advisory JSON
        </summary>
        <div className="border-t border-slate-100 p-3">
          <p className="mb-1.5 font-mono text-[10px] italic text-slate-400">
            Mock advisory object. Not a real LLM API response.
          </p>
          <pre className="max-h-[280px] overflow-auto rounded-md border border-slate-200 bg-white p-2 font-mono text-[10px] leading-relaxed text-slate-700">
            {JSON.stringify(llmAdvisory, null, 2)}
          </pre>
        </div>
      </details>
    </section>
  );
}
