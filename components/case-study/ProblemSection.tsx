export default function ProblemSection() {
  return (
    <section
      aria-label="Problem"
      className="rounded-md border border-slate-200 border-l-4 border-l-sky-400 bg-sky-50/40 px-4 py-2.5"
    >
      <p className="text-sm leading-snug text-slate-700 sm:text-[15px]">
        <span className="mr-2 align-middle text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">
          Problem
        </span>
        <span className="align-middle">
          Scattered evidence, inconsistent judgment, weak traceability, limited
          replay capability &mdash; not lack of AI.
        </span>
      </p>
    </section>
  );
}
