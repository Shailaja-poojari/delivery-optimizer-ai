import React from "react";

/**
 * Minimal global footer. Purely presentational — no state, no data calls.
 */
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          <span className="font-semibold text-slate-700">Delivery Optimizer AI</span>
          <span className="mx-1.5 text-slate-300" aria-hidden="true">·</span>
          AI-powered last-mile logistics
        </p>

        <p className="hidden items-center gap-1.5 md:flex">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true">
            <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" />
          </svg>
          XGBoost ETA predictions · OR-Tools route optimization
        </p>

        <p>© {year} — built for logistics teams</p>
      </div>
    </footer>
  );
};

export default Footer;