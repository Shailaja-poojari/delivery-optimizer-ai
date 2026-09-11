import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { calculateEnvironmentalImpact } from "../../utils/environmentalImpact";

const ImpactChart = ({ orders }) => {
  const dataByZone = {};

  orders.forEach((order) => {
    const { zone, distance } = order;
    const { fuelCost, co2Emission } = calculateEnvironmentalImpact(distance);
    if (!dataByZone[zone]) {
      dataByZone[zone] = { zone, fuel: 0, co2: 0 };
    }
    dataByZone[zone].fuel += fuelCost;
    dataByZone[zone].co2 += co2Emission;
  });

  const chartData = Object.values(dataByZone);

  return (
    <div className="bg-white p-4 rounded shadow mt-8">
      <h2 className="text-lg font-semibold mb-4">📉 Environmental Impact by Zone</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="zone" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="fuel" fill="#38a169" name="Fuel ₹" />
          <Bar dataKey="co2" fill="#3182ce" name="CO₂ (kg)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ImpactChart;
