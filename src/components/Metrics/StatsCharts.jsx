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
    <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          Avg Delay by Zone
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Model-predicted delay, averaged per delivery zone
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="delayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="zone"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#94a3b8' } }}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
              fontSize: 12,
              color: '#0f172a',
            }}
          />
          <Bar dataKey="avgDelay" fill="url(#delayGradient)" radius={[6, 6, 0, 0]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsCharts;