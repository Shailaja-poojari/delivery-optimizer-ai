import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Leaflet icon fix for Vite builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 📍 Optional custom truck icon
const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995526.png",
  iconSize: [30, 30],
});

// 📍 Custom agent icon
const agentIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [28, 28],
});

const DeliveryMap = ({ orders, agentLocation }) => {
  const center = [12.9716, 77.5946]; // Bengaluru default

  return (
    <div className="relative z-0 mb-6 h-[400px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Floating legend badge (does not intercept map interactions) */}
      <div className="pointer-events-none absolute right-3 top-3 z-[1000] rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur">
        <p className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500" aria-hidden="true" />
          Delivery stop
        </p>
        <p className="mt-1 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          Agent (live GPS)
        </p>
      </div>

      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        aria-label="Delivery network map"
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Delivery order markers */}
        {orders.map((order) => (
          <Marker key={order.id} position={[order.lat, order.lng]} icon={truckIcon}>
            <Popup>
              <strong>{order.customerName}</strong><br />
              Zone: {order.zone}<br />
              Delay: {order.estimatedDelay} min
            </Popup>
          </Marker>
        ))}

        {/* Agent live GPS marker */}
        {agentLocation && (
          <Marker position={[agentLocation.latitude, agentLocation.longitude]} icon={agentIcon}>
            <Popup>
              🚚 Agent Live Location<br />
              Lat: {agentLocation.latitude.toFixed(4)}<br />
              Lon: {agentLocation.longitude.toFixed(4)}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;