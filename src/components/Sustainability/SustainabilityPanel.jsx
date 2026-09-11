import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const SustainabilityPanel = ({ orders }) => {
  const FUEL_COST_PER_KM = 5; // ₹
  const CO2_PER_KM = 0.21; // kg

  const totalDistance = orders.reduce((acc, order) => acc + order.distance, 0);
  const totalFuelSaved = totalDistance * FUEL_COST_PER_KM;
  const totalCO2Saved = totalDistance * CO2_PER_KM;

  const data = [
    { name: "Fuel Saved (₹)", value: totalFuelSaved },
    { name: "CO₂ Saved (kg)", value: totalCO2Saved },
  ];

  const COLORS = ["#34D399", "#60A5FA"];

  return (
    <div className="bg-white p-6 rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">🌱 Sustainability Impact</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <p className="mb-2">✅ <strong>Total Distance:</strong> {totalDistance.toFixed(2)} km</p>
          <p className="mb-2">⛽ <strong>Fuel Saved:</strong> ₹{totalFuelSaved.toFixed(2)}</p>
          <p className="mb-2">🌿 <strong>CO₂ Reduced:</strong> {totalCO2Saved.toFixed(2)} kg</p>
        </div>

        <PieChart width={320} height={240}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};

export default SustainabilityPanel;
