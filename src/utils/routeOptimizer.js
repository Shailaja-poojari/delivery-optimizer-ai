// utils/routeOptimizer.js

export const optimizeRoutes = (orders) => {
  // Sort by ascending estimated delay and distance
  const sorted = [...orders].sort((a, b) => {
    const delayScore = a.estimatedDelay - b.estimatedDelay;
    const distanceScore = a.distance - b.distance;
    return delayScore || distanceScore;
  });

  return sorted.map((order, index) => ({
    ...order,
    optimizedOrder: index + 1,
  }));
};
