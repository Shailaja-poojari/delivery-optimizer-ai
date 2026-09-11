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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full text-blue-900 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <img src="/logo.jpg" alt="logo" className="w-14 h-14 rounded shadow" />
        <h1 className="text-2xl md:text-3xl font-bold">🚚 AI-Powered Last Mile Delivery Optimizer</h1>
      </div>

      {/* ✅ Offline Banner */}
      {isOffline && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 mb-4 rounded border border-yellow-300 animate-pulse">
          ⚠ You are in offline mode. Displaying cached delivery data.
        </div>
      )}

      {/* Mode Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <button onClick={handleEmergency} className="bg-red-600 text-white px-4 py-2 rounded hover:scale-105 transition">🚨 Emergency Mode</button>
        <button onClick={handleFestival} className="bg-yellow-500 text-white px-4 py-2 rounded hover:scale-105 transition">🎉 Festival Mode</button>
      </div>

      {/* Delay Alert */}
      {showAlert && (
        <div className="bg-red-100 text-red-700 border border-red-500 px-4 py-2 mb-4 rounded animate-pulse">
          ⚠ Some deliveries are experiencing high delays!
        </div>
      )}

      {/* Smart Alerts */}
      <SmartAlerts orders={orders} />

      {/* Sustainability Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 text-center p-4 rounded shadow">⛽ <strong>Fuel Saved:</strong> ₹{savings.totalFuelSaved}</div>
        <div className="bg-blue-100 text-center p-4 rounded shadow">🌿 <strong>CO₂ Saved:</strong> {savings.totalCO2Saved} kg</div>
        <div className="bg-gray-100 text-center p-4 rounded shadow">📦 <strong>Total Orders:</strong> {orders.length}</div>
      </div>

      {/* Map */}
      <h2 className="text-lg md:text-xl font-semibold mb-2">🗺 Map View (Simulated)</h2>
      <DeliveryMap orders={orders} agentLocation={agentLocation} />

      {/* Charts */}
      <StatsCharts orders={orders} />
      <OptimizedRoute orders={optimizedRoute.length ? optimizedRoute : orders} />

      {/* Consolidation */}
      <h2 className="text-lg md:text-xl font-semibold mt-10 mb-2">📦 Consolidation Summary</h2>
      <OrderConsolidationSummary orders={orders} />
      <p className="text-sm text-gray-700 mb-2">
        <strong>Suggested Consolidation Groups:</strong>{" "}
        {
          Object.entries(orders.reduce((acc, order) => {
            if (!acc[order.zone]) acc[order.zone] = [];
            acc[order.zone].push(order);
            return acc;
          }, {})).filter(([_, group]) => group.length >= 2 && group.every(o => o.distance < 7)).length
        }
      </p>

      <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">📦 AI-Suggested Consolidated Groups</h2>
      <ConsolidationSuggestions orders={orders} />

      {/* Order Table */}
      <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">📋 Optimized Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow text-sm md:text-base">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Zone</th>
              <th className="px-4 py-2">ETA</th>
              <th className="px-4 py-2">Risk</th>
              <th className="px-4 py-2">Delay</th>
              <th className="px-4 py-2">Distance</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t hover:bg-gray-50 hover:scale-[1.01] transition">
                <td className="px-4 py-2">{order.id}</td>
                <td className="px-4 py-2">{order.customerName}</td>
                <td className="px-4 py-2">{order.zone}</td>
                <td className="px-4 py-2">{etaCountdowns[order.id] ?? order.estimatedDelay} min</td>
                <td className="px-4 py-2">{order.riskScore}</td>
                <td className="px-4 py-2">{order.estimatedDelay} min</td>
                <td className="px-4 py-2">{order.distance} km</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                    getDelaySeverity(order.estimatedDelay) === "green"
                      ? "bg-green-200 text-green-800"
                      : getDelaySeverity(order.estimatedDelay) === "orange"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-red-200 text-red-800"
                  }`}>
                    {getDelaySeverity(order.estimatedDelay).toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 text-sm text-gray-600">
        <strong>Legend:</strong>
        <span className="ml-4 text-green-700">🟢 Low</span>
        <span className="ml-4 text-yellow-700">🟠 Moderate</span>
        <span className="ml-4 text-red-700">🔴 High</span>
      </div>

      {/* ✅ Chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default Dashboard;
