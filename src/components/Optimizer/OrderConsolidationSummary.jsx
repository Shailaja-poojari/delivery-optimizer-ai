import React from "react";

const OrderConsolidationSummary = ({ orders }) => {
  if (!orders || orders.length === 0) return null;

  const totalOrders = orders.length;
  const totalDistance = orders.reduce((sum, o) => sum + o.distance, 0);
  const avgDistance = (totalDistance / totalOrders).toFixed(2);

  const highRiskCount = orders.filter(o => o.riskScore >= 70).length;
  const consolidatedGroups = Math.floor(totalOrders / 3); // 3 per group idea

  return (
    <div className="bg-gray-100 p-4 rounded shadow text-sm mb-4">
      <p><strong>Total Orders:</strong> {totalOrders}</p>
      <p><strong>Average Distance:</strong> {avgDistance} km</p>
      <p><strong>High Risk Orders:</strong> {highRiskCount}</p>
      <p><strong>Suggested Consolidation Groups:</strong> {consolidatedGroups}</p>
    </div>
  );
};

export default OrderConsolidationSummary;