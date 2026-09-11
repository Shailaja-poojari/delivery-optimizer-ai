import React from "react";

const PerformanceStats = ({ orders, savings }) => {
  const totalOrders = orders.length;
  const onTimeOrders = orders.filter((o) => o.estimatedDelay <= 15).length;
  const avgETA = Math.round(
    orders.reduce((sum, o) => sum + o.estimatedDelay, 0) / totalOrders
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div className="bg-green-200 text-green-900 p-4 rounded shadow text-center">
        <h2 className="text-xl font-semibold">📦 On-Time %</h2>
        <p className="text-3xl font-bold">
          {Math.round((onTimeOrders / totalOrders) * 100)}%
        </p>
      </div>
      <div className="bg-yellow-100 text-yellow-900 p-4 rounded shadow text-center">
        <h2 className="text-xl font-semibold">⏱️ Avg ETA</h2>
        <p className="text-3xl font-bold">{avgETA} min</p>
      </div>
      <div className="bg-green-100 text-green-800 p-4 rounded shadow text-center">
        <h2 className="text-xl font-semibold">💸 Fuel ₹ Saved</h2>
        <p className="text-3xl font-bold">₹{savings.totalFuelSaved}</p>
      </div>
      <div className="bg-blue-100 text-blue-800 p-4 rounded shadow text-center">
        <h2 className="text-xl font-semibold">🌿 CO₂ Saved</h2>
        <p className="text-3xl font-bold">{savings.totalCO2Saved} kg</p>
      </div>
    </div>
  );
};

export default PerformanceStats;
