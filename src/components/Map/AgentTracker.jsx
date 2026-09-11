import React, { useEffect, useState } from "react";

const AgentTracker = ({ onLocationUpdate }) => {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ latitude, longitude });
          if (onLocationUpdate) onLocationUpdate({ latitude, longitude });
        },
        (err) => console.error("❌ GPS Error:", err.message),
        { enableHighAccuracy: true }
      );
    };

    updateLocation();
    const interval = setInterval(updateLocation, 8000); // update every 8 sec
    return () => clearInterval(interval);
  }, []);

  return coords ? (
    <div className="bg-green-50 text-green-800 px-4 py-2 rounded mb-4 shadow">
      📍 Live Agent Location: <strong>{coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}</strong>
    </div>
  ) : (
    <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded mb-4 shadow">
      ⏳ Waiting for GPS permission...
    </div>
  );
};

export default AgentTracker;