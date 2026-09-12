import React, { useState, useEffect } from "react";
import mockOrders from "../../utils/mockOrders";
import { applyEmergencyMode, applyFestivalMode, getDelaySeverity } from "../../utils/delayUtils";
import { predictDelay } from "../../utils/delayPredictors";
import { calculateSavings } from "../../utils/sustainability";
import { computeRiskScore } from "../../utils/riskScorer";
import { supabase } from "../../utils/supabaseClient";
import { optimizeOrderRoute, predictOrderEtas } from "../../services/aiService";
import DeliveryMap from "../Map/DeliveryMap";
import StatsCharts from "../Metrics/StatsCharts";
import SmartAlerts from "../Alerts/SmartAlerts";
import OptimizedRoute from "../Optimizer/OptimizedRoute";
import ConsolidationSuggestions from "../Optimizer/ConsolidationSuggestions";
import OrderConsolidationSummary from "../Optimizer/OrderConsolidationSummary";
import FloatingChatbot from "../Chatbot/FloatingChatbot"; // ✅ Chatbot added

/* ------------------------------------------------------------------ */
/*  Inline icons (presentational only — no dependencies added)        */
/* ------------------------------------------------------------------ */
const BoxIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5" />
    <path d="M12 13v8" />
  </svg>
);

const ClockIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const AlertTriangleIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const LeafIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    <path d="M4 20C4 11 11 4 20 4c0 9-7 16-16 16Z" />
    <path d="M4 20C8 14 13 9 20 4" />
  </svg>
);

const BoltIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
    <path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </svg>
);

const SparklesIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    <path d="m18.5 15.5.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
  </svg>
);

const WifiOffIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
    <path d="M2 8.8a15.5 15.5 0 0 1 20 0" />
    <path d="M5.5 12.5a10 10 0 0 1 13 0" />
    <path d="M9 16.2a5 5 0 0 1 6 0" />
    <circle cx="12" cy="19.5" r="0.8" fill="currentColor" />
    <path d="m3 3 18 18" />
  </svg>
);

/* Tone → static Tailwind classes (kept literal so Tailwind picks them up) */
const KPI_TONES = {
  indigo: { chip: "bg-indigo-50 text-indigo-600 ring-indigo-100" },
  sky: { chip: "bg-sky-50 text-sky-600 ring-sky-100" },
  rose: { chip: "bg-rose-50 text-rose-600 ring-rose-100" },
  emerald: { chip: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
};

const SEVERITY_STYLES = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  orange: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

const riskTone = (score) =>
  score >= 70 ? "bg-rose-500" : score >= 40 ? "bg-amber-500" : "bg-emerald-500";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [originalOrders] = useState(mockOrders);
  const [savings, setSavings] = useState({ totalFuelSaved: 0, totalCO2Saved: 0 });
  const [showAlert, setShowAlert] = useState(false);
  const [isFestival, setIsFestival] = useState(false);
  const [etaCountdowns, setEtaCountdowns] = useState({});
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [agentLocation, setAgentLocation] = useState(null); // ✅ GPS
  const [optimizedRoute, setOptimizedRoute] = useState([]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setAgentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error("GPS Error:", error.message),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      const cached = localStorage.getItem("cachedOrders");
      if (cached) {
        setOrders(JSON.parse(cached));
        return;
      }
    }

    const offlineEstimate = (order) => {
      const predictedDelay = predictDelay(order.zone, order.distance, isFestival);
      const riskScore = computeRiskScore(order.zone, predictedDelay);
      return { ...order, estimatedDelay: predictedDelay, riskScore };
    };

    const loadDeliveryIntelligence = async () => {
      try {
        const predictions = await predictOrderEtas(mockOrders, isFestival);
        const enriched = mockOrders.map((order, index) => {
          const estimatedDelay = predictions[index];
          return { ...order, estimatedDelay, riskScore: computeRiskScore(order.zone, estimatedDelay) };
        });
        setOrders(enriched);
        localStorage.setItem("cachedOrders", JSON.stringify(enriched));
        setOptimizedRoute(await optimizeOrderRoute(enriched));
      } catch (error) {
        // Offline support remains usable until the separately deployed model service is available.
        console.warn("Delivery Intelligence API unavailable; using offline estimates.", error);
        const enriched = mockOrders.map(offlineEstimate);
        setOrders(enriched);
        localStorage.setItem("cachedOrders", JSON.stringify(enriched));
        setOptimizedRoute([...enriched].sort((a, b) => a.distance - b.distance));
      }
    };
    loadDeliveryIntelligence();
  }, [isFestival, isOffline]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEtaCountdowns(prev => {
        const updated = {};
        orders.forEach(order => {
          const newEta = Math.max((prev[order.id] ?? order.estimatedDelay) - 1, 0);
          updated[order.id] = newEta;
        });
        return updated;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [orders]);

  const uploadOrdersToSupabase = async (updatedOrders) => {
    for (const order of updatedOrders) {
      const { id, customerName, zone, estimatedDelay, distance } = order;
      const { error } = await supabase.from("optimized_orders").insert([{
        id, customer_name: customerName, zone,
        estimated_delay: estimatedDelay,
        distance, optimized: true,
        created_at: new Date().toISOString()
      }]);
      if (error) console.error("❌ Supabase Error:", error.message);
    }
  };

  const handleEmergency = async () => {
    const updated = applyEmergencyMode(orders, "Koramangala");
    setOrders(updated);
    setSavings(calculateSavings(originalOrders, updated));
    await uploadOrdersToSupabase(updated);
  };

  const handleFestival = async () => {
    setIsFestival(true);
    const updated = applyFestivalMode(orders);
    setOrders(updated);
    setSavings(calculateSavings(originalOrders, updated));
    await uploadOrdersToSupabase(updated);
  };

  useEffect(() => {
    const hasHighDelay = orders.some(order => order.estimatedDelay > 20);
    setShowAlert(hasHighDelay);
  }, [orders]);

  /* Derived KPI values (presentation only — computed from existing state) */
  const totalOrders = orders.length;
  const highRiskCount = orders.filter(o => o.riskScore >= 70).length;
  const reroutedCount = orders.filter(o => o.rerouted).length;
  const avgDelay = totalOrders
    ? Math.round(orders.reduce((sum, o) => sum + o.estimatedDelay, 0) / totalOrders)
    : 0;

  const kpis = [
    {
      label: "Active Deliveries",
      value: String(totalOrders),
      sub: `${reroutedCount} rerouted by modes`,
      icon: BoxIcon,
      tone: "indigo",
    },
    {
      label: "Avg Predicted Delay",
      value: `${avgDelay} min`,
      sub: "across the network",
      icon: ClockIcon,
      tone: "sky",
    },
    {
      label: "High-Risk Orders",
      value: String(highRiskCount),
      sub: "risk score ≥ 70",
      icon: AlertTriangleIcon,
      tone: highRiskCount > 0 ? "rose" : "emerald",
    },
    {
      label: "Sustainability Savings",
      value: `₹${savings.totalFuelSaved}`,
      sub: `${savings.totalCO2Saved} kg CO₂ avoided`,
      icon: LeafIcon,
      tone: "emerald",
    },
  ];

  const isLoading = totalOrders === 0;

  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 py-6 animate-fadeIn sm:px-6 lg:px-8 lg:py-8"
      aria-busy={isLoading}
    >
      {/* ---------------------------------------------------------- */}
      {/*  Page head                                                  */}
      {/* ---------------------------------------------------------- */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Delivery Intelligence
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            AI-Powered Last-Mile Delivery Optimizer
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">
            Predict ETAs, rebalance routes and monitor network risk in real time —
            powered by XGBoost models and OR-Tools optimization.
          </p>
        </div>

        {/* Mode actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleEmergency}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.98]"
          >
            {BoltIcon}
            Emergency Mode
          </button>
          <button
            onClick={handleFestival}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 active:scale-[0.98]"
          >
            {SparklesIcon}
            Festival Mode
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  System banners                                             */}
      {/* ---------------------------------------------------------- */}
      {isOffline && (
        <div
          role="status"
          className="mt-6 flex items-center gap-3 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-sm"
        >
          {WifiOffIcon}
          <span className="animate-pulse">
            You are in offline mode. Displaying cached delivery data.
          </span>
        </div>
      )}

      {showAlert && (
        <div
          role="alert"
          className="mt-6 flex items-center gap-3 rounded-xl border border-rose-300/70 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm"
        >
          <span className="animate-pulse text-rose-600">{AlertTriangleIcon}</span>
          Some deliveries are experiencing high delays!
        </div>
      )}

      <div className="mt-6 empty:hidden">
        <SmartAlerts orders={orders} />
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  Loading skeleton (orders arrive asynchronously)            */}
      {/* ---------------------------------------------------------- */}
      {isLoading ? (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton h-[400px] rounded-2xl" aria-hidden="true" />
          <p role="status" aria-live="polite" className="text-sm font-medium text-slate-500">
            Crunching delivery intelligence…
          </p>
        </div>
      ) : (
        <>
          {/* ------------------------------------------------------ */}
          {/*  KPI metrics                                            */}
          {/* ------------------------------------------------------ */}
          <section aria-label="Key performance metrics" className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="animate-fadeUp rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {kpi.label}
                  </p>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-inset ${KPI_TONES[kpi.tone].chip}`}>
                    {kpi.icon}
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {kpi.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{kpi.sub}</p>
              </div>
            ))}
          </section>

          {/* ------------------------------------------------------ */}
          {/*  Live network map                                       */}
          {/* ------------------------------------------------------ */}
          <section aria-labelledby="map-heading" className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 id="map-heading" className="text-lg font-semibold tracking-tight text-slate-900">
                Map View
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 ring-1 ring-inset ring-slate-200">
                Simulated
              </span>
            </div>
            <DeliveryMap orders={orders} agentLocation={agentLocation} />
          </section>

          {/* ------------------------------------------------------ */}
          {/*  Analytics + route                                      */}
          {/* ------------------------------------------------------ */}
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="min-w-0 xl:col-span-2">
              <StatsCharts orders={orders} />
            </div>
            <div className="min-w-0 xl:col-span-3">
              <OptimizedRoute orders={optimizedRoute.length ? optimizedRoute : orders} />
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/*  Consolidation                                          */}
          {/* ------------------------------------------------------ */}
          <section aria-labelledby="consolidation-heading" className="mt-10">
            <h2 id="consolidation-heading" className="text-lg font-semibold tracking-tight text-slate-900">
              Consolidation Summary
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Bundle nearby stops to cut distance, fuel and emissions.
            </p>

            <div className="mt-4">
              <OrderConsolidationSummary orders={orders} />
            </div>

            <p className="mt-4 text-sm text-slate-600">
              <strong className="font-semibold text-slate-800">Suggested Consolidation Groups:</strong>{" "}
              {
                Object.entries(orders.reduce((acc, order) => {
                  if (!acc[order.zone]) acc[order.zone] = [];
                  acc[order.zone].push(order);
                  return acc;
                }, {})).filter(([_, group]) => group.length >= 2 && group.every(o => o.distance < 7)).length
              }
            </p>

            <h3 className="mt-6 text-base font-semibold tracking-tight text-slate-900">
              AI-Suggested Consolidated Groups
            </h3>
            <div className="mt-3">
              <ConsolidationSuggestions orders={orders} />
            </div>
          </section>

          {/* ------------------------------------------------------ */}
          {/*  Optimized orders table                                 */}
          {/* ------------------------------------------------------ */}
          <section aria-labelledby="orders-heading" className="mt-10">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 id="orders-heading" className="text-lg font-semibold tracking-tight text-slate-900">
                Optimized Orders
              </h2>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 tabular-nums">
                {totalOrders} deliveries
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <caption className="sr-only">
                    Optimized delivery orders with ETA countdown, risk score, delay and severity
                  </caption>
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th scope="col" className="px-4 py-3">ID</th>
                      <th scope="col" className="px-4 py-3">Customer</th>
                      <th scope="col" className="px-4 py-3">Zone</th>
                      <th scope="col" className="px-4 py-3">ETA</th>
                      <th scope="col" className="px-4 py-3">Risk</th>
                      <th scope="col" className="px-4 py-3">Delay</th>
                      <th scope="col" className="px-4 py-3">Distance</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(order => {
                      const severity = getDelaySeverity(order.estimatedDelay);
                      return (
                        <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-medium text-slate-400 tabular-nums">#{order.id}</td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-900">{order.customerName}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{order.zone}</td>
                          <td className="px-4 py-3 text-slate-600 tabular-nums">
                            {etaCountdowns[order.id] ?? order.estimatedDelay} min
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-2 text-slate-700 tabular-nums">
                              <span className={`h-2 w-2 rounded-full ${riskTone(order.riskScore)}`} aria-hidden="true" />
                              {order.riskScore}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 tabular-nums">{order.estimatedDelay} min</td>
                          <td className="px-4 py-3 text-slate-600 tabular-nums">{order.distance} km</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${SEVERITY_STYLES[severity]}`}>
                              {severity.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <strong className="font-semibold text-slate-700">Legend:</strong>
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" /> Low
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden="true" /> Moderate
              </span>
              <span className="inline-flex items-center gap-1.5 text-rose-700">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" /> High
              </span>
            </div>
          </section>
        </>
      )}

      {/* ✅ Chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default Dashboard;