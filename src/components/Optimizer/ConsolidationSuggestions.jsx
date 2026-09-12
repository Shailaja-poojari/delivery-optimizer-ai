import React from "react";

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
    <div className="mt-10">
      {/* 🧠 One-line summary */}
      <p className="text-sm text-gray-700 mb-2">
        <strong>📦 Suggested Consolidation Groups:</strong>{" "}
        {suggestions.length > 0 ? suggestions.length : "None"}
      </p>

      <h2 className="text-xl font-semibold mb-2">🤖 AI-Driven Consolidation Suggestions</h2>

      {/* 📋 Group details */}
      {suggestions.length === 0 ? (
        <div className="text-gray-500">No bundle opportunities...</div>
      ) : (
        <ul className="space-y-4">
          {suggestions.map(([zone, group], idx) => (
            <li key={idx} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-1">{zone}</h3>
              <ul className="pl-4 list-disc text-gray-700">
                {group.map((order) => (
                  <li key={order.id}>
                    {order.customerName} – {order.distance} km – ETA: {order.estimatedDelay} min
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