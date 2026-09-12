import React, { useState } from "react";
import mockOrders from "../../utils/mockOrders";
import { getDelaySeverity } from "../../utils/delayUtils";

const SEVERITY_STYLES = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  orange: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

const PinIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
    <path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const CheckIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
    <path d="m5 13 4 4L19 7" />
  </svg>
);

const DeliveryAgentApp = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [deliveredIds, setDeliveredIds] = useState([]);

  const handleDelivered = (id) => {
    setDeliveredIds([...deliveredIds, id]);
  };

  const nextOrder = orders.find(order => !deliveredIds.includes(order.id));
  const remaining = orders.filter(order => !deliveredIds.includes(order.id)).slice(1);

  const completed = deliveredIds.length;
  const total = orders.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 animate-fadeIn sm:py-10">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* Card header with progress */}
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600">
                Agent Run Sheet
              </p>
              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
                Today&rsquo;s Deliveries
              </h1>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 tabular-nums">
              {completed} / {total} done
            </span>
          </div>

          {/* Progress bar */}
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Delivery completion"
            className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="p-6 text-gray-800">
          {nextOrder ? (
            <div className="mb-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Next Delivery
                </h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                    SEVERITY_STYLES[getDelaySeverity(nextOrder.estimatedDelay)]
                  }`}
                >
                  Delay Risk: {getDelaySeverity(nextOrder.estimatedDelay).toUpperCase()}
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                {nextOrder.customerName}
              </p>

              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-medium text-slate-500">ETA</dt>
                  <dd className="font-semibold text-slate-800 tabular-nums">{nextOrder.estimatedDelay} min</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-medium text-slate-500">Zone</dt>
                  <dd className="font-semibold text-slate-800">{nextOrder.zone}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 font-medium text-slate-500">Address</dt>
                  <dd className="text-right font-semibold text-slate-800">{nextOrder.address}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-dashed border-slate-200 pt-3">
                  <dt className="font-medium text-slate-500">Delivery OTP</dt>
                  <dd>
                    <span className="rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-base font-bold tracking-[0.3em] text-white tabular-nums">
                      {1000 + nextOrder.id}
                    </span>
                  </dd>
                </div>
              </dl>

              <button
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99]"
                onClick={() => handleDelivered(nextOrder.id)}
              >
                {CheckIcon}
                Mark as Delivered
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-emerald-50 px-6 py-10 text-center ring-1 ring-inset ring-emerald-600/15">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                  <path d="m5 13 4 4L19 7" />
                </svg>
              </span>
              <p className="text-base font-bold text-emerald-800">All deliveries completed!</p>
              <p className="text-sm text-emerald-700">Great work — head back to the depot.</p>
            </div>
          )}

          {remaining.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Remaining Deliveries ({remaining.length})
              </h2>
              <ul className="space-y-2">
                {remaining.map((order) => (
                  <li
                    key={order.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-2.5 text-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="text-slate-400">{PinIcon}</span>
                      <span className="truncate font-medium text-slate-800">{order.customerName}</span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-500 tabular-nums">
                      {order.estimatedDelay} min · {order.zone}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryAgentApp;