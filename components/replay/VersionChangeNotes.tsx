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
    <div className="rounded-md border border-slate-100 bg-slate-50/50 p-3">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </h3>
      <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function VersionChangeNotes({ notes }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Version Change Notes
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NotesSection label="policy_v1" items={notes.policyV1} />
        <NotesSection label="policy_v2" items={notes.policyV2} />
        <NotesSection label="prompt_v1" items={notes.promptV1} />
        <NotesSection label="prompt_v2" items={notes.promptV2} />
      </div>
    </section>
  );
}
