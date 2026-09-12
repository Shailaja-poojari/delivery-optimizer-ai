import React from "react";

const SmartAlerts = ({ savings }) => {
  if (!savings) return null;

  const { totalFuelSaved = 0, totalCO2Saved = 0 } = savings;

  return (
    <div
      role="status"
      className="animate-fadeUp flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true">
        <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
        <path d="M10.3 20a2 2 0 0 0 3.4 0" />
      </svg>
      <p>
        <strong className="font-semibold">Smart Alert:</strong> You&rsquo;ve saved ₹{totalFuelSaved} in fuel and {totalCO2Saved} kg CO₂ this session!
      </p>
    </div>
  );
};

export default SmartAlerts;