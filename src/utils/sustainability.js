// Estimate sustainability savings based on delivery time improvements
export function calculateSavings(originalOrders, optimizedOrders) {
  let totalFuelSaved = 0;
  let totalCO2Saved = 0;

  for (let i = 0; i < originalOrders.length; i++) {
    const original = originalOrders[i];
    const optimized = optimizedOrders[i];

    const timeDiff = original.deliveryTime - optimized.deliveryTime;

    if (timeDiff > 0) {
      // Assume fuel savings of ₹2 per minute saved
      totalFuelSaved += timeDiff * 2;

      // Assume CO₂ savings of 0.05 kg per minute saved
      totalCO2Saved += timeDiff * 0.05;
    }
  }

  return {
    totalFuelSaved: totalFuelSaved.toFixed(2),
    totalCO2Saved: totalCO2Saved.toFixed(2),
  };
}
