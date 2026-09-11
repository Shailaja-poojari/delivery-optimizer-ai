import React from "react";

const OrderTable = ({ orders }) => {
  return (
    <div className="overflow-x-auto bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-4">📦 Optimized Order Details</h2>
      <table className="min-w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Order ID</th>
            <th className="p-2 border">Customer Name</th>
            <th className="p-2 border">Zone</th>
            <th className="p-2 border">Estimated Delay (min)</th>
            <th className="p-2 border">Distance (km)</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="p-2 border">{order.id}</td>
              <td className="p-2 border">{order.customerName}</td>
              <td className="p-2 border">{order.deliveryZone}</td>
              <td className="p-2 border">{order.estimatedDelay}</td>
              <td className="p-2 border">{order.distance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
