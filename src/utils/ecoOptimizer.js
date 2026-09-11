// utils/ecoOptimizer.js

export const suggestEcoCombos = (orders) => {
  const combos = [];

  // Group orders by zone
  const grouped = orders.reduce((acc, order) => {
    const zone = order.zone || order.deliveryZone;
    acc[zone] = acc[zone] || [];
    acc[zone].push(order);
    return acc;
  }, {});

  // Create combos for zones with multiple deliveries
  for (const zone in grouped) {
    const group = grouped[zone];
    if (group.length >= 2) {
      combos.push({
        zone,
        orders: group,
        comboDistance: group.reduce((sum, o) => sum + o.distance, 0) * 0.85, // 15% savings
        fuelSaved: group.length * 2, // ₹2 saved per order in combo (sample logic)
        co2Saved: group.reduce((sum, o) => sum + (o.distance * 0.21 * 0.15), 0).toFixed(2) // 15% of CO₂ saved
      });
    }
  }

  return combos;
};