// src/utils/riskScorer.js

// 🚨 Simple Risk Prediction based on delay patterns
export const computeRiskScore = (zone, delay) => {
  // Basic logic: more delay → higher risk
  let baseScore = delay * 3;

  // Simulate past data for zones
  const pastDelays = {
    Koramangala: 25,
    Indiranagar: 15,
    Whitefield: 22,
    Hebbal: 12,
    Rajajinagar: 18,
  };

  if (pastDelays[zone] && pastDelays[zone] > 20) {
    baseScore += 20; // Add boost for high historical delay
  }

  // Clamp score between 0–100
  return Math.min(100, Math.round(baseScore));
};
