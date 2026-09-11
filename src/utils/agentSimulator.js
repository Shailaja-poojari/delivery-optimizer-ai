// src/utils/agentSimulator.js

// Simulated agent location updater using basic path interpolation
export const startSimulatedAgentTracking = (orders, onUpdate) => {
  if (!orders || orders.length === 0) return;

  let index = 0;
  let current = { lat: 12.935, lng: 77.614 }; // Start: somewhere in Koramangala
  const updateInterval = 3000; // 3 seconds

  const interval = setInterval(() => {
    if (index >= orders.length) {
      clearInterval(interval);
      return;
    }

    // Fake "approaching" the next delivery point
    const order = orders[index];
    const target = getLatLngForZone(order.zone);
    current = moveTowards(current, target, 0.002); // simulate agent moving closer

    onUpdate(current, order); // send update to dashboard/map

    // If close enough to target, move to next order
    if (getDistance(current, target) < 0.01) {
      index++;
    }
  }, updateInterval);

  return () => clearInterval(interval); // cleanup
};

// Basic lat/lng data for zones
const getLatLngForZone = (zone) => {
  const zones = {
    Koramangala: { lat: 12.935, lng: 77.614 },
    Indiranagar: { lat: 12.971, lng: 77.640 },
    Whitefield: { lat: 12.986, lng: 77.728 },
    Malleshwaram: { lat: 13.006, lng: 77.568 },
    Hebbal: { lat: 13.035, lng: 77.597 },
    Rajajinagar: { lat: 12.991, lng: 77.556 },
  };
  return zones[zone] || zones["Koramangala"];
};

// Move towards target by a small step
const moveTowards = (current, target, step = 0.001) => {
  const lat = current.lat + step * Math.sign(target.lat - current.lat);
  const lng = current.lng + step * Math.sign(target.lng - current.lng);
  return { lat, lng };
};

// Calculate basic distance between two points
const getDistance = (a, b) => {
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);
};