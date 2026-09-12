import React from "react";

/**
 * Global top bar: breadcrumb, current date and live-status indicator.
 * Purely presentational — receives the active view from App.
 */
const Header = ({ view }) => {
  const copy =
    view === "agent"
      ? { crumb: "Fleet", title: "Delivery Agent Run Sheet" }
      : { crumb: "Operations", title: "Delivery Command Center" };

  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            <span>Logistics</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="text-indigo-600">{copy.crumb}</span>
          </nav>
          <p className="mt-0.5 truncate text-base font-semibold tracking-tight text-slate-900">
            {copy.title}
          </p>
        </div>

        {/* Right side: date + live status */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm sm:inline-flex">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-slate-400" aria-hidden="true">
              <rect x="3" y="4.5" width="18" height="16" rx="2" />
              <path d="M3 9.5h18" />
              <path d="M8 2.5v4M16 2.5v4" />
            </svg>
            <time>{today}</time>
          </span>

          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-pingSoft absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;