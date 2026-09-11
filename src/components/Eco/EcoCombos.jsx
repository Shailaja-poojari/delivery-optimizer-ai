// components/Eco/EcoCombos.jsx

import React from "react";

const EcoCombos = ({ combos }) => {
  if (combos.length === 0) return null;

  return (
    <div className="mt-6 bg-green-50 border border-green-300 p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">🌱 Eco Mode Suggestions (Delivery Combos)</h3>
      {combos.map((combo, idx) => (
        <div key={idx} className="mb-4 p-3 border-b border-green-200">
          <p><strong>Zone:</strong> {combo.zone}</p>
          <p><strong>Deliveries in Combo:</strong> {combo.orders.length}</p>
          <p><strong>Optimized Distance:</strong> {combo.comboDistance.toFixed(2)} km</p>
          <p><strong>Fuel Saved:</strong> ₹{combo.fuelSaved}</p>
          <p><strong>CO₂ Saved:</strong> {combo.co2Saved} kg</p>
        </div>
      ))}
    </div>
  );
};

export default EcoCombos;