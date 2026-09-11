// utils/delayReasons.js

export const getDelayReason = (zone, delay, isFestival = false) => {
  if (delay > 25) {
    if (zone === "Koramangala") return "Heavy congestion in Koramangala zone";
    if (zone === "Whitefield") return "Whitefield traffic jam + long distance";
    return "High traffic + possible route disruption";
  }

  if (isFestival && delay > 15) {
    return "Festival traffic affecting all zones";
  }

  if (delay > 15) {
    return "Moderate congestion due to distance or timing";
  }

  if (delay > 8) {
    return "Slight delay – zone traffic variation";
  }

  return "On-time – minimal delay";
};