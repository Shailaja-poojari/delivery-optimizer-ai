// OptimizedRoute.jsx
import React from "react";

const NavIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    <path d="m3 11 18-8-8 18-2.4-7.6L3 11Z" />
  </svg>
);

const OptimizedRoute = ({ orders, etaCountdowns }) => {
  // The API returns the OR-Tools stop order. Keep an order as a safe first-run fallback.
  const sorted = orders;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
          {NavIcon}
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            Optimized Delivery Route
          </h2>
          <p className="text-xs text-slate-500">
            Stop sequence returned by the routing engine
          </p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
          <p className="text-sm text-slate-500">
            No stops sequenced yet — the route will appear once orders are loaded.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-0">
          {sorted.map((order, index) => {
            const stopNumber = order.optimizedOrder ?? index + 1;
            const isLast = index === sorted.length - 1;
            return (
              <li key={order.id} className="relative flex gap-4 pb-4 last:pb-0">
                {/* Connector line */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[15px] top-8 h-[calc(100%-28px)] w-px bg-slate-200"
                  />
                )}

                {/* Stop number */}
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm ring-4 ring-white tabular-nums">
                  {stopNumber}
                </span>

                {/* Stop details */}
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 shadow-sm transition-all hover:-translate-y-px hover:border-indigo-200 hover:shadow">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {order.customerName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {order.zone} · {order.distance} km
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 tabular-nums">
                    ETA: {etaCountdowns?.[order.id] ?? order.estimatedDelay} min
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default OptimizedRoute;