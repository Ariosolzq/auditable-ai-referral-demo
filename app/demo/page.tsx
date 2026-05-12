import CaseSelectorGrid from "@/components/demo/CaseSelectorGrid";
import { cases } from "@/data/cases";

export default function DemoPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Case Selector</h1>
        <p className="text-slate-600">
          Select a mock case to open its workflow workspace. All cases are
          frontend mock data; no real PHI.
        </p>
      </header>
      <CaseSelectorGrid cases={cases} />
    </section>
  );
}
