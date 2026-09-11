export const calculateEnvironmentalImpact = (distance) => {
  const fuelCostPerKm = 5; // ₹ per km
  const co2PerKm = 0.21;   // kg per km

  return {
    fuelCost: distance * fuelCostPerKm,
    co2Emission: distance * co2PerKm,
  };
};
