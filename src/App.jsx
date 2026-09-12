import React, { useState } from "react";
import Dashboard from "./components/Dashboard/Dashboard";
import DeliveryAgentApp from "./components/DeliveryAgent/DeliveryAgentApp";

const App = () => {
  const [view, setView] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-100 p-4 text-center">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">🔄 Toggle View</h1>

      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded ${
            view === "dashboard"
              ? "bg-blue-600 text-white"
              : "bg-white border border-blue-600 text-blue-600"
          }`}
          onClick={() => setView("dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className={`px-4 py-2 rounded ${
            view === "agent"
              ? "bg-green-600 text-white"
              : "bg-white border border-green-600 text-green-600"
          }`}
          onClick={() => setView("agent")}
        >
          🧑‍💼 Delivery Agent App
        </button>
      </div>

      {view === "dashboard" ? <Dashboard /> : <DeliveryAgentApp />}
    </div>
  );
};

export default App;