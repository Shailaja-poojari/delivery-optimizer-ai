import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const StatsCharts = ({ orders }) => {
  // Calculate average delay per zone
  const delayByZone = {};

  orders.forEach(order => {
    const { deliveryZone, estimatedDelay } = order;
    if (!delayByZone[deliveryZone]) {
      delayByZone[deliveryZone] = { totalDelay: 0, count: 0 };
    }
    delayByZone[deliveryZone].totalDelay += estimatedDelay;
    delayByZone[deliveryZone].count += 1;
  });

  const chartData = Object.entries(delayByZone).map(([zone, stats]) => ({
    zone,
    avgDelay: +(stats.totalDelay / stats.count).toFixed(2),
  }));

  return (
    <div className="bg-white p-6 rounded shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">📊 Avg Delay by Zone</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="zone" />
          <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="avgDelay" fill="#4F46E5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsCharts;
