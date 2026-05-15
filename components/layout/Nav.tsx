import Link from "next/link";

const links = [
  { href: "/#workflow", label: "Workflow" },
  { href: "/demo", label: "Cases" },
  { href: "/replay", label: "Replay" },
];

export default function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-semibold text-slate-900"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-[11px] font-bold text-amber-300"
          >
            A
          </span>
          <span className="flex items-baseline gap-2">
            <span>Auditable Referral</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:inline">
              case study
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <span
            aria-label="Mock demo"
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800"
          >
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
            />
            Mock demo
          </span>
          <ul className="hidden items-center gap-3 text-sm sm:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://github.com/Ariosolzq/auditable-ai-referral-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
