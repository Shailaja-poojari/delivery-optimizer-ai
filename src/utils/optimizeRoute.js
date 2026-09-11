// Simple greedy route optimizer based on distance
const optimizeRoute = (orders, startZone = "Warehouse") => {
  if (!orders || orders.length === 0) return [];

  // Clone orders
  const unvisited = [...orders];
  const optimized = [];

  // Start from Warehouse (no actual location, just simulate)
  let currentZone = startZone;

  while (unvisited.length > 0) {
    // Find the closest order (by distance)
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      if (unvisited[i].distance < minDistance) {
        minDistance = unvisited[i].distance;
        nearestIndex = i;
      }
    }

    optimized.push(unvisited[nearestIndex]);
    currentZone = unvisited[nearestIndex].zone;
    unvisited.splice(nearestIndex, 1);
  }

  return optimized;
};

export default optimizeRoute;
