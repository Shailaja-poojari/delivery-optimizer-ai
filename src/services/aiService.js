const AI_API_URL = import.meta.env.VITE_AI_API_URL ?? "/ai-api";

const trafficForZone = (zone, isFestival) => {
  if (isFestival) return "jam";
  return ["Koramangala", "Whitefield"].includes(zone) ? "high" : "medium";
};

export async function predictOrderEtas(orders, isFestival = false) {
  const hour = new Date().getHours();
  const response = await fetch(`${AI_API_URL}/predict-etas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deliveries: orders.map((order, index) => ({
        distance_km: order.distance,
        traffic_level: trafficForZone(order.zone, isFestival),
        hour_of_day: hour,
        weather: "sunny",
        package_weight_kg: order.packageWeightKg ?? 1,
        stops_remaining: Math.max(orders.length - index - 1, 0),
        is_festival: isFestival,
      })),
    }),
  });
  if (!response.ok) throw new Error(`ETA service returned ${response.status}`);
  const { predictions } = await response.json();
  return predictions;
}

export async function optimizeOrderRoute(orders) {
  if (!orders.length) return [];
  const response = await fetch(`${AI_API_URL}/optimize-route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      depot_latitude: 12.9716,
      depot_longitude: 77.5946,
      stops: orders.map((order) => ({ id: order.id, latitude: order.lat, longitude: order.lng, demand: 1 })),
      vehicle_capacities: [orders.length],
    }),
  });
  if (!response.ok) throw new Error(`Route service returned ${response.status}`);
  const { routes } = await response.json();
  const sequence = routes.flatMap((route) => route.stop_ids);
  const byId = new Map(orders.map((order) => [String(order.id), order]));
  return sequence.map((id, index) => ({ ...byId.get(String(id)), optimizedOrder: index + 1 }));
}
