import React from "react";

const SparklesIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    <path d="m18.5 15.5.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
  </svg>
);

const PinIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
    <path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const ConsolidationSuggestions = ({ orders }) => {
  const threshold = 7; // Group if distance < 7km and same zone

  const grouped = orders.reduce((acc, order) => {
    if (!acc[order.zone]) acc[order.zone] = [];
    acc[order.zone].push(order);
    return acc;
  }, {});

  const suggestions = Object.entries(grouped).filter(
    ([_, group]) => group.length >= 2 && group.every((o) => o.distance < threshold)
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      {/* Card header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100">
            {SparklesIcon}
          </span>
          <div>
            <h4 className="text-sm font-semibold tracking-tight text-slate-900">
              AI-Driven Consolidation Suggestions
            </h4>
            <p className="text-xs text-slate-500">
              Same-zone bundles where every stop is under {threshold} km
            </p>
          </div>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 tabular-nums">
          {suggestions.length > 0 ? `${suggestions.length} group${suggestions.length === 1 ? "" : "s"}` : "None"}
        </span>
      </div>

      {/* 🧠 One-line summary */}
      <p className="mt-3 text-sm text-slate-600">
        <strong className="font-semibold text-slate-800">📦 Suggested Consolidation Groups:</strong>{" "}
        {suggestions.length > 0 ? suggestions.length : "None"}
      </p>

      {/* 📋 Group details */}
      {suggestions.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 text-center">
          <span className="text-2xl" aria-hidden="true">📭</span>
          <p className="text-sm text-slate-500">No bundle opportunities...</p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {suggestions.map(([zone, group], idx) => (
            <li
              key={idx}
              className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/30"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h5 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <span className="text-indigo-500">{PinIcon}</span>
                  {zone}
                </h5>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-200 tabular-nums">
                  {group.length} stops
                </span>
              </div>
              <ul className="space-y-1.5">
                {group.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-2 text-xs text-slate-600">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" aria-hidden="true" />
                      <span className="truncate font-medium text-slate-700">{order.customerName}</span>
                    </span>
                    <span className="shrink-0 text-slate-500 tabular-nums">
                      {order.distance} km · ETA {order.estimatedDelay} min
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConsolidationSuggestions;