export default function ContactFooter() {
  const linkClass =
    "font-medium text-slate-700 hover:text-slate-900 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500";
  return (
    <footer
      aria-label="Contact"
      className="rounded-md border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-600"
    >
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-semibold uppercase tracking-[0.16em] text-slate-700">
          Contact
        </span>
        <span aria-hidden="true" className="text-slate-300">
          &mdash;
        </span>
        <a href="mailto:linziqi1229@outlook.com" className={linkClass}>
          linziqi1229@outlook.com
        </a>
        <span aria-hidden="true" className="text-slate-300">
          &middot;
        </span>
        <a
          href="https://github.com/Ariosolzq"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          GitHub @Ariosolzq
        </a>
        <span aria-hidden="true" className="text-slate-300">
          &middot;
        </span>
        <a
          href="https://www.linkedin.com/in/ziqi-lin-lzq"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          LinkedIn ziqi-lin-lzq
        </a>
      </p>
      <p className="mt-1 text-[11px] italic text-slate-500">
        Frontend-only mock demo. No real PHI, no real LLM API, no production
        backend.
      </p>
    </footer>
  );
}
