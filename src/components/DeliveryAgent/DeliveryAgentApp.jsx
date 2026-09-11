import React, { useState } from "react";
import mockOrders from "../../utils/mockOrders";
import { getDelaySeverity } from "../../utils/delayUtils";

const DeliveryAgentApp = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [deliveredIds, setDeliveredIds] = useState([]);

  const handleDelivered = (id) => {
    setDeliveredIds([...deliveredIds, id]);
  };

  const nextOrder = orders.find(order => !deliveredIds.includes(order.id));
  const remaining = orders.filter(order => !deliveredIds.includes(order.id)).slice(1);

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md text-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-center">📦 Today’s Deliveries</h1>

      {nextOrder ? (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Next Delivery</h2>
          <p><strong>Customer:</strong> {nextOrder.customerName}</p>
          <p><strong>ETA:</strong> {nextOrder.estimatedDelay} min</p>
          <p><strong>Zone:</strong> {nextOrder.zone}</p>
          <p><strong>Address:</strong> {nextOrder.address}</p>
          <p><strong>OTP:</strong> {1000 + nextOrder.id}</p>

          <span
            className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
              getDelaySeverity(nextOrder.estimatedDelay) === "green"
                ? "bg-green-200 text-green-800"
                : getDelaySeverity(nextOrder.estimatedDelay) === "orange"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            Delay Risk: {getDelaySeverity(nextOrder.estimatedDelay).toUpperCase()}
          </span>

          <button
            className="mt-4 block w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            onClick={() => handleDelivered(nextOrder.id)}
          >
            ✅ Mark as Delivered
          </button>
        </div>
      ) : (
        <p className="text-center text-green-600 font-semibold">🎉 All deliveries completed!</p>
      )}

      {remaining.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">📋 Remaining Deliveries ({remaining.length})</h2>
          <ul className="space-y-2">
            {remaining.map(order => (
              <li key={order.id} className="border rounded p-2 bg-gray-50">
                {order.customerName} – {order.estimatedDelay} min ({order.zone})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DeliveryAgentApp;