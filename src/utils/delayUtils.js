// delayUtils.js

// Delay threshold levels
export const delayThresholds = {
  green: 10,   // Safe
  orange: 20,  // Moderate
  red: Infinity, // High
};

// 🚨 Emergency Mode — simulate blocked zone and reroute
export const applyEmergencyMode = (orders, blockedZone = "Koramangala") => {
  return orders.map((order) => {
    if (order.zone === blockedZone) {
      return {
        ...order,
        estimatedDelay: order.estimatedDelay + 15, // Simulate traffic block
        rerouted: true,
      };
    }
    return { ...order, rerouted: false };
  });
};

// 🎉 Festival Mode — simulate general city-wide traffic
export const applyFestivalMode = (orders) => {
  return orders.map((order) => ({
    ...order,
    estimatedDelay: order.estimatedDelay + 5, // Add delay to everyone
    rerouted: true,
  }));
};

// 🎯 Get delay badge color
export const getDelaySeverity = (delay) => {
  if (delay <= delayThresholds.green) return "green";
  if (delay <= delayThresholds.orange) return "orange";
  return "red";
};
// 🔍 Get reason based on delay level
export const getDelayReason = (delay) => {
  if (delay <= 10) return "✅ On-time";
  if (delay <= 20) return "⏱ Moderate traffic";
  return "🚧 Heavy traffic or congestion";
};