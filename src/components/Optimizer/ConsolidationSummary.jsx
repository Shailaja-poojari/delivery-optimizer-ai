import React from "react";

const ConsolidationSummary = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      {summary.map((zone) => (
        <div
          key={zone.zone}
          className="bg-white shadow-md rounded p-4 border border-blue-200"
        >
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            📍 {zone.zone}
          </h3>
          <p>📦 Orders: {zone.totalOrders}</p>
          <p>🕓 Avg Delay: {zone.averageDelay.toFixed(1)} min</p>
          <p>💰 Cost Score: {zone.costScore.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};

export default ConsolidationSummary;