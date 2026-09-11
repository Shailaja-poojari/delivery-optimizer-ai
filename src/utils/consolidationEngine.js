import React, { useState, useEffect } from "react";
import mockOrders from "../../utils/mockOrders";
import { applyEmergencyMode, applyFestivalMode, getDelaySeverity } from "../../utils/delayUtils";
import { predictDelay } from "../../utils/delayPredictors";
import { calculateSavings } from "../../utils/sustainability";
import { computeRiskScore } from "../../utils/riskScorer";
import { suggestEcoCombos } from "../../utils/ecoOptimizer"; // ✅ NEW
import { supabase } from "../../utils/supabaseClient";
import DeliveryMap from "../Map/DeliveryMap";
import StatsCharts from "../Metrics/StatsCharts";
import SmartAlerts from "../Alerts/SmartAlerts";
import OptimizedRoute from "../Optimizer/OptimizedRoute";
import EcoCombos from "../Eco/EcoCombos"; // ✅ NEW

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [originalOrders] = useState(mockOrders);
  const [savings, setSavings] = useState({ totalFuelSaved: 0, totalCO2Saved: 0 });
  const [showAlert, setShowAlert] = useState(false);
  const [isFestival, setIsFestival] = useState(false);
  const [etaCountdowns, setEtaCountdowns] = useState({});
  const [ecoCombos, setEcoCombos] = useState([]); // ✅ NEW

  // Enrich orders with delay prediction & risk score
  useEffect(() => {
    const enriched = mockOrders.map(order => {
      const predictedDelay = predictDelay(order.zone, order.distance, isFestival);
      const riskScore = computeRiskScore(order.zone, predictedDelay);
      return {
        ...order,
        estimatedDelay: predictedDelay,
        riskScore,
      };
    });
    setOrders(enriched);
    setEcoCombos(suggestEcoCombos(enriched)); // ✅ ADD eco suggestions
  }, [isFestival]);

  // Live ETA countdown
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
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, [orders]);

  // Upload to Supabase
  const uploadOrdersToSupabase = async (updatedOrders) => {
    for (const order of updatedOrders) {
      const { id, customerName, zone, estimatedDelay, distance } = order;
      const { error } = await supabase.from("optimized_orders").insert([{
        id,
        customer_name: customerName,
        zone,
        estimated_delay: estimatedDelay,
        distance,
        optimized: true,
        created_at: new Date().toISOString(),
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
    const highDelay = orders.some(order => order.estimatedDelay > 20);
    setShowAlert(highDelay);
  }, [orders]);

  return (
    <div className="p-6 text-blue-900">
      <h1 className="text-3xl font-bold mb-4">🚚 AI-Powered Delivery Optimizer</h1>

      <div className="flex gap-4 mb-4">
        <button onClick={handleEmergency} className="bg-red-600 text-white px-4 py-2 rounded">🚨 Emergency Mode</button>
        <button onClick={handleFestival} className="bg-yellow-500 text-white px-4 py-2 rounded">🎉 Festival Mode</button>
      </div>

      {/* ⚠ Smart Alerts */}
      {showAlert && (
        <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-2 mb-4 rounded">
          ⚠ Some deliveries are experiencing high delays!
        </div>
      )}
      <SmartAlerts orders={orders} />

      {/* 💹 Sustainability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded text-center">⛽ <strong>Fuel Saved:</strong> ₹{savings.totalFuelSaved}</div>
        <div className="bg-blue-100 p-4 rounded text-center">🌿 <strong>CO₂ Saved:</strong> {savings.totalCO2Saved} kg</div>
        <div className="bg-gray-100 p-4 rounded text-center">📦 <strong>Total Orders:</strong> {orders.length}</div>
      </div>

      {/* 🗺 Simulated Map */}
      <h2 className="text-xl font-semibold mb-2">🗺 Map View (Simulated)</h2>
      <DeliveryMap orders={orders} />

      {/* 📈 Charts */}
      <StatsCharts orders={orders} />

      {/* 🚀 Optimized Route */}
      <OptimizedRoute orders={orders} />

      {/* 🌱 Eco Combos */}
      <EcoCombos combos={ecoCombos} />

      {/* 📋 Orders Table */}
      <h2 className="text-xl font-semibold mt-6 mb-2">📋 Optimized Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Zone</th>
              <th className="px-4 py-2">ETA (min)</th>
              <th className="px-4 py-2">Risk Score</th>
              <th className="px-4 py-2">Delay</th>
              <th className="px-4 py-2">Distance</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
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

      {/* 🟢 Legend */}
      <div className="mt-4 text-sm text-gray-600">
        <strong>Legend:</strong>
        <span className="ml-4 text-green-700">🟢 Low Delay/Risk</span>
        <span className="ml-4 text-yellow-700">🟠 Moderate Delay</span>
        <span className="ml-4 text-red-700">🔴 High Delay/Risk</span>
      </div>
    </div>
  );
};

export default Dashboard;