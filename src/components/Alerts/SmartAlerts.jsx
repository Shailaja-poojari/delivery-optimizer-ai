import React from "react";

const SmartAlerts = ({ savings }) => {
  if (!savings) return null;

  const { totalFuelSaved = 0, totalCO2Saved = 0 } = savings;

  return (
    <div className="bg-yellow-100 text-yellow-900 p-3 rounded shadow mb-4">
      🔔 <strong>Smart Alert:</strong> You’ve saved ₹{totalFuelSaved} in fuel and {totalCO2Saved} kg CO₂ this session!
    </div>
  );
};

export default SmartAlerts;