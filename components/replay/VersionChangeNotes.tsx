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
    <div className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5">
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </h4>
      <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-700">
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
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {groupLabel}
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <NotesSection label={v1Label} items={v1Items} />
        <NotesSection label={v2Label} items={v2Items} />
      </div>
    </div>
  );
}

export default function VersionChangeNotes({ notes }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Version Change Notes
      </h2>
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
