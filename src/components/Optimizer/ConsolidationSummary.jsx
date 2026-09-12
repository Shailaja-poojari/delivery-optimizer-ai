import React from "react";

const OrderConsolidationSummary = ({ orders }) => {
  if (!orders || orders.length === 0) return null;

  const totalOrders = orders.length;
  const totalDistance = orders.reduce((sum, o) => sum + o.distance, 0);
  const avgDistance = (totalDistance / totalOrders).toFixed(2);

  const highRiskCount = orders.filter(o => o.riskScore >= 70).length;
  const consolidatedGroups = Math.floor(totalOrders / 3); // 3 per group idea

  const stats = [
    { label: "Total Orders", value: String(totalOrders) },
    { label: "Average Distance", value: `${avgDistance} km` },
    { label: "High Risk Orders", value: String(highRiskCount) },
    { label: "Suggested Consolidation Groups", value: String(consolidatedGroups) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {stat.label}
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default OrderConsolidationSummary;