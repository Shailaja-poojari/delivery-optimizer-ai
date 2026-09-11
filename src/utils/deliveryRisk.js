// utils/deliveryRisk.js

// Simulate risk score logic based on zone + hour of day
export const getRiskScore = (zone, hour, historicalDelays = {}) => {
  const key = `${zone}_${hour}`;
  const delayHistory = historicalDelays[key] || 0;

  // Heuristic scoring model
  if (delayHistory > 20) return Math.min(100, delayHistory * 3);
  if (delayHistory > 10) return 50 + delayHistory;
  return delayHistory * 2;
};

// Risk level for styling
export const getRiskSeverity = (score) => {
  if (score > 70) return "red";
  if (score >= 50) return "orange";
  return "green";
};
