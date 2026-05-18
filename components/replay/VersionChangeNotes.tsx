import type { ReplayRun } from "@/types/replay";

type Props = {
  notes: ReplayRun["versionChangeNotes"];
};

function NotesSection({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </h4>
      <ul className="list-inside list-disc space-y-0.5 text-xs leading-snug text-slate-600">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function NotesGroup({
  groupLabel,
  v1Label,
  v1Items,
  v2Label,
  v2Items,
}: {
  groupLabel: string;
  v1Label: string;
  v1Items: string[];
  v2Label: string;
  v2Items: string[];
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {groupLabel}
        </h3>
        <span className="text-[10px] text-slate-400">
          <code className="font-mono">{v1Label}</code>{" "}
          <span aria-hidden="true">→</span>{" "}
          <code className="font-mono">{v2Label}</code>
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <NotesSection label={v1Label} items={v1Items} />
        <NotesSection label={v2Label} items={v2Items} />
      </div>
    </div>
  );
}

export default function VersionChangeNotes({ notes }: Props) {
  return (
    <section
      aria-label="Version change notes"
      className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Reference &middot; version change notes
        </h2>
        <span className="text-[10px] italic text-slate-400">
          Read after the behavioral delta
        </span>
      </div>
      <div className="space-y-3">
        <NotesGroup
          groupLabel="Policy"
          v1Label="policy_v1"
          v1Items={notes.policyV1}
          v2Label="policy_v2"
          v2Items={notes.policyV2}
        />
        <NotesGroup
          groupLabel="Prompt"
          v1Label="prompt_v1"
          v1Items={notes.promptV1}
          v2Label="prompt_v2"
          v2Items={notes.promptV2}
        />
      </div>
    </section>
  );
}
