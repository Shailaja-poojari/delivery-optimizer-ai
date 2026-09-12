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
    <div className="h-[400px] mb-6 rounded shadow overflow-hidden z-0">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
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