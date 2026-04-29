import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Gujarat city coordinates

  const cityCoordinates = {
  // North Gujarat
  Banaskantha: [24.1725, 72.4380],
  Patan: [23.8490, 72.1266],
  Mehsana: [23.5880, 72.3693],
  Sabarkantha: [23.5981, 73.0024],
  Aravalli: [23.6047, 73.2980],
  Gandhinagar: [23.2156, 72.6369],

  // Central Gujarat
  Ahmedabad: [23.0225, 72.5714],
  Vadodara: [22.3072, 73.1812],
  Anand: [22.5645, 72.9289],
  Kheda: [22.7507, 72.6850],
  "Chhota Udaipur": [22.3042, 74.0150],
  Dahod: [22.8358, 74.2550],
  Mahisagar: [23.1460, 73.6190],

  // South Gujarat
  Surat: [21.1702, 72.8311],
  Bharuch: [21.7051, 72.9959],
  Narmada: [21.8763, 73.5020],
  Navsari: [20.9467, 72.9520],
  Valsad: [20.5992, 72.9342],
  Dang: [20.7570, 73.6866],
  Tapi: [21.1276, 73.3890],

  // Saurashtra-Kutch
  Rajkot: [22.3039, 70.8022],
  Jamnagar: [22.4707, 70.0692],
  Junagadh: [21.5222, 70.4579],
  Porbandar: [21.6417, 69.6293],
  Bhavnagar: [21.7645, 72.1519],
  Amreli: [21.6032, 71.2221],
  Surendranagar: [22.7271, 71.6480],
  Morbi: [22.8173, 70.8377],
  Botad: [22.1696, 71.6667],
  "Devbhumi Dwarka": [22.2442, 68.9685],
  "Gir Somnath": [20.9120, 70.3670],
  Kutch: [23.7337, 69.8597],
};
 

export default function GujaratMap({ subAdmins = [], onCityClick, setActiveTab, setPreselectedCity }) {
  const [gujaratGeo, setGujaratGeo] = useState(null);

  const gujaratAdmins = subAdmins.filter(
    (admin) => admin.state === "Gujarat"
  );

  useEffect(() => {
    axios
      .get(
        "https://raw.githubusercontent.com/geohacker/india/master/state/gujarat.geojson"
      )
      .then((res) => setGujaratGeo(res.data))
      .catch((err) => console.error("GeoJSON load error:", err));
  }, []);

  // Better colored icons
  const createColoredIcon = (isActive) =>
    new L.Icon({
      iconUrl: isActive
        ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
        : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      iconSize: [32, 32],
    });

  return (
    <div
      style={{
        height: "550px",
        width: "100%",
        marginBottom: "20px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={[22.2587, 71.1924]}
        zoom={7}
        minZoom={7}
        maxZoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        {/* 🔥 CLEAN PROFESSIONAL TILE LAYER */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CartoDB"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Gujarat Boundary */}
        {gujaratGeo && (
          <GeoJSON
            data={gujaratGeo}
            style={{
              color: "#2563eb",
              weight: 2,
              fillColor: "#3b82f6",
              fillOpacity: 0.05,
            }}
          />
        )}

        {/* All District Markers */}
{Object.entries(cityCoordinates).map(([city, coords]) => {
  const admin = gujaratAdmins.find((a) => a.city === city);

  return (
    <Marker
      key={city}
      position={coords}
      icon={
        admin
          ? createColoredIcon(admin.isActive) // green/red
          : createColoredIcon(false) // default red for no admin (we'll improve below)
      }
      eventHandlers={{
        click: () => onCityClick?.(city),
      }}
    >
      <Popup>
        <div style={{ minWidth: "180px" }}>
          <h3 style={{ fontWeight: "bold", marginBottom: "5px" }}>
            {city}
          </h3>

          {admin ? (
            <>
              <div>
                <strong>Officer:</strong> {admin.officerName}
              </div>
              <div>
                <strong>ID:</strong> {admin.officerId}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color: admin.isActive ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {admin.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </>
          ) : (
            <div>
              <div style={{ color: "gray", fontWeight: "bold", marginBottom: "10px" }}>
                No Admin Assigned
              </div>
              {setActiveTab && (
                <button
                  onClick={() => {
                    if (setPreselectedCity) {
                      setPreselectedCity(city);
                    }
                    setActiveTab("addAdmin");
                  }}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    width: "100%",
                  }}
                >
                  + Add Admin
                </button>
              )}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
})}

      </MapContainer>
    </div>
  );
}