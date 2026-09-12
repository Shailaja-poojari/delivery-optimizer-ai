import React, { useState } from "react";
import Dashboard from "./components/Dashboard/Dashboard";
import DeliveryAgentApp from "./components/DeliveryAgent/DeliveryAgentApp";
import Header from "./components/UI/Header";
import Footer from "./components/UI/Footer";

const GridIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
  </svg>
);

const TruckIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
    <path d="M3 7h11v9H3z" />
    <path d="M14 10h3.6L21 13.4V16h-7v-6Z" />
    <circle cx="7.5" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
  </svg>
);

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Operations Dashboard",
    hint: "Network intelligence & ETAs",
    icon: GridIcon,
  },
  {
    id: "agent",
    label: "Delivery Agent",
    hint: "Driver run sheet & OTP",
    icon: TruckIcon,
  },
];

const App = () => {
  const [view, setView] = useState("dashboard");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:flex">
      {/* Accessibility: jump straight to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* ------------------------------------------------------------ */}
      {/*  Sidebar / primary navigation                                */}
      {/* ------------------------------------------------------------ */}
      <aside
        aria-label="Sidebar"
        className="sticky top-0 z-40 w-full shrink-0 bg-slate-950 text-slate-100 shadow-lg lg:flex lg:h-screen lg:w-64 lg:flex-col lg:shadow-none"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 pt-4 lg:px-5 lg:pt-6">
          <img
            src="/logo.jpg"
            alt="Delivery Optimizer AI logo"
            className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/20"
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-white">
              Delivery Optimizer
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              AI Logistics
            </p>
          </div>
        </div>

        {/* Nav — horizontal pills on mobile, vertical list on desktop */}
        <nav
          aria-label="Primary"
          className="mt-3 flex gap-2 overflow-x-auto px-4 pb-4 lg:mt-8 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0"
        >
          {NAV_ITEMS.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                aria-current={active ? "page" : undefined}
                className={`group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-400/40"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    active
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-white/5 text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex flex-col">
                  <span className="whitespace-nowrap lg:whitespace-normal">{item.label}</span>
                  <span className="hidden text-[11px] font-normal text-slate-400 lg:block">
                    {item.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Desktop-only system status card */}
        <div className="mt-auto hidden px-3 pb-6 lg:block">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-pingSoft absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <p className="text-xs font-semibold text-white">All systems nominal</p>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              XGBoost ETA model · OR-Tools routing · Supabase sync
            </p>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------ */}
      {/*  Main column                                                 */}
      {/* ------------------------------------------------------------ */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header view={view} />

        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {view === "dashboard" ? <Dashboard /> : <DeliveryAgentApp />}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default App;