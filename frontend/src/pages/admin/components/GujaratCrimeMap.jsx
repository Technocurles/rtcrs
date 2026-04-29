import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { getPriorityMarkerColor, getPriorityStyle, matchesPriority, normalizePriority } from "../../../utils/priorityStyles";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Create blinking SOS marker icon
const createSOSIcon = () => {
  return new L.DivIcon({
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
      ">
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          background-color: #dc2626;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(220, 38, 38, 0.6);
          animation: sos-pulse 1s ease-out infinite;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 18px;
          font-weight: bold;
        ">🚨</div>
      </div>
      <style>
        @keyframes sos-pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      </style>
    `,
    className: "sos-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Gujarat city coordinates (center points for each city)
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

// Approximate radius for city boundaries (in meters)
const cityRadius = {
  Ahmedabad: 25000,
  Surat: 20000,
  Vadodara: 20000,
  Rajkot: 15000,
  Jamnagar: 12000,
  Junagadh: 12000,
  Bhavnagar: 15000,
  Gandhinagar: 15000,
  Anand: 10000,
  Kheda: 12000,
  Bharuch: 10000,
  Navsari: 10000,
  Valsad: 10000,
  Patan: 10000,
  Mehsana: 12000,
  Sabarkantha: 15000,
  Banaskantha: 15000,
  Surendranagar: 12000,
  Morbi: 10000,
  Amreli: 10000,
  Botad: 10000,
  "Chhota Udaipur": 10000,
  Dahod: 10000,
  Mahisagar: 10000,
  Narmada: 8000,
  Dang: 10000,
  Tapi: 10000,
  Porbandar: 8000,
  "Devbhumi Dwarka": 12000,
  "Gir Somnath": 10000,
  Kutch: 30000,
  Aravalli: 10000,
};

// Create icon for crimes with exact GPS (solid border)
const createPriorityIcon = (priority) => {
  const color = getPriorityMarkerColor(priority);
  
  return new L.DivIcon({
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    className: "priority-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Create icon for crimes without exact GPS (dashed border)
const createFallbackIcon = (priority) => {
  const color = getPriorityMarkerColor(priority);
  
  return new L.DivIcon({
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px dashed white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    className: "fallback-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Helper function to get marker position for each crime
const getMarkerPosition = (report) => {
  const city = report.city;
  const cityCenterCoords = cityCoordinates[city] || [23.0225, 72.5714];
  const boundaryRadius = cityRadius[city] || 15000;
  
  // 1. Try to get exact GPS coordinates
  if (report.location && 
      report.location.coordinates && 
      report.location.coordinates.length === 2 &&
      typeof report.location.coordinates[0] === 'number' &&
      typeof report.location.coordinates[1] === 'number') {
    
    const reportLat = report.location.coordinates[1];
    const reportLng = report.location.coordinates[0];
    
    // Check if the GPS coordinates are within the city's boundary
    const distance = getDistanceFromCenter(reportLat, reportLng, cityCenterCoords[0], cityCenterCoords[1]);
    
    if (distance <= boundaryRadius) {
      return {
        lat: reportLat,
        lng: reportLng,
        hasExactLocation: true
      };
    }
  }
  
  // 2. Fall back to city center
  return {
    lat: cityCenterCoords[0],
    lng: cityCenterCoords[1],
    hasExactLocation: false,
    locationType: 'city'
  };
};

// Calculate distance between two points in meters using Haversine formula
const getDistanceFromCenter = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

// Get priority badge color
const getPriorityBadge = (priority) => {
  return getPriorityStyle(priority);
};

const getPriorityInlineStyle = (priority) => {
  switch (normalizePriority(priority)) {
    case "critical":
      return { backgroundColor: "#dc2626", color: "#ffffff", borderColor: "#dc2626" };
    case "high":
      return { backgroundColor: "#ea580c", color: "#ffffff", borderColor: "#ea580c" };
    case "medium":
      return { backgroundColor: "#eab308", color: "#ffffff", borderColor: "#eab308" };
    case "low":
      return { backgroundColor: "#22c55e", color: "#ffffff", borderColor: "#22c55e" };
    default:
      return { backgroundColor: "#6b7280", color: "#ffffff", borderColor: "#6b7280" };
  }
};

// Component to fit map bounds to selected city
const MapBounds = ({ selectedCity }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedCity && selectedCity !== "all" && cityCoordinates[selectedCity]) {
      const center = cityCoordinates[selectedCity];
      const radius = cityRadius[selectedCity] || 15000;
      const bounds = L.latLng(center).toBounds(radius);
      map.fitBounds(bounds);
    } else if (selectedCity === "all") {
      // Reset to Gujarat view
      map.setView([22.2587, 71.1924], 7);
    }
  }, [map, selectedCity]);
  
  return null;
};

export default function GujaratCrimeMap({ 
  reports = [], 
  sosAlerts = [],
  onViewMore,
  onMarkerClick,
  onSOSAlertReceived,
  selectedCity = "all"
}) {
  const [mounted, setMounted] = useState(false);
  const [gujaratGeo, setGujaratGeo] = useState(null);
  const [districtGeo, setDistrictGeo] = useState(null);
  const [localSOSAlerts, setLocalSOSAlerts] = useState(sosAlerts);
  
  // Use the selectedCity prop directly - no local state needed
  
  // Update local SOS alerts when prop changes
  useEffect(() => {
    setLocalSOSAlerts(sosAlerts);
  }, [sosAlerts]);
  
  // Get all SOS alerts for display (excluding resolved and false_alert)
  // This shows all SOS alerts on the map, similar to SubAdmin's CityMap
  const displaySOSAlerts = useMemo(() => {
    return localSOSAlerts.filter(alert => alert.status !== "resolved" && alert.status !== "false_alert");
  }, [localSOSAlerts]);
  
  // Calculate SOS stats - show all active SOS alerts (excluding resolved/false_alert)
  const sosStats = useMemo(() => {
    return {
      total: displaySOSAlerts.length,
      active: displaySOSAlerts.filter(a => a.status === "active").length,
    };
  }, [displaySOSAlerts]);
  
  useEffect(() => {
    setMounted(true);
    
    // Load Gujarat State Boundary GeoJSON
    axios
      .get("https://raw.githubusercontent.com/geohacker/india/master/state/gujarat.geojson")
      .then((res) => setGujaratGeo(res.data))
      .catch((err) => console.error("GeoJSON load error:", err));
      
    // Load Gujarat District Boundaries GeoJSON
    axios
      .get("https://raw.githubusercontent.com/Geohub/India-GeoJSON/master/gujarat/districts.json")
      .then((res) => setDistrictGeo(res.data))
      .catch((err) => console.error("District GeoJSON load error:", err));
  }, []);
  
  // Filter reports by selected city
  const filteredReports = useMemo(() => {
    if (selectedCity === "all") return reports;
    return reports.filter(report => report.city === selectedCity);
  }, [reports, selectedCity]);
  
  // Calculate stats
  const reportsStats = useMemo(() => {
    const stats = {
      total: filteredReports.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    
    filteredReports.forEach(report => {
      if (matchesPriority(report.priority, "critical")) stats.critical++;
      else if (matchesPriority(report.priority, "high")) stats.high++;
      else if (matchesPriority(report.priority, "medium")) stats.medium++;
      else if (matchesPriority(report.priority, "low")) stats.low++;
    });
    
    return stats;
  }, [filteredReports]);
  
  // Process all reports to get their marker positions
  const allReportsWithPosition = useMemo(() => {
    return filteredReports.map(report => ({
      ...report,
      markerPosition: getMarkerPosition(report)
    }));
  }, [filteredReports]);
  
  // Handle view more click
  const handleViewMore = useCallback((report) => {
    if (onViewMore) {
      onViewMore(report);
    }
  }, [onViewMore]);
  
  // Custom marker cluster icon
  const createClusterCustomIcon = useCallback((cluster) => {
    const count = cluster.getChildCount();
    let size = 'small';
    if (count > 50) size = 'large';
    else if (count > 20) size = 'medium';
    
    return L.divIcon({
      html: `<div style="
        background-color: #dc2626;
        color: white;
        border-radius: 50%;
        width: ${size === 'small' ? 30 : size === 'medium' ? 40 : 50}px;
        height: ${size === 'small' ? 30 : size === 'medium' ? 40 : 50}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${size === 'small' ? 10 : size === 'medium' ? 12 : 14}px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${count}</div>`,
      className: "cluster-marker",
      iconSize: L.point(40, 40),
    });
  }, []);
  
  // Get city color for boundary circles
  const getCityColor = (city) => {
    const cityReports = reports.filter(r => r.city === city);
    if (cityReports.length === 0) return { color: "#94a3b8", fill: "#94a3b8" };
    
    const hasCritical = cityReports.some(r => matchesPriority(r.priority, "critical"));
    const hasHigh = cityReports.some(r => matchesPriority(r.priority, "high"));
    const hasMedium = cityReports.some(r => matchesPriority(r.priority, "medium"));
    
    if (hasCritical) return { color: getPriorityMarkerColor("critical"), fill: getPriorityMarkerColor("critical") };
    if (hasHigh) return { color: getPriorityMarkerColor("high"), fill: getPriorityMarkerColor("high") };
    if (hasMedium) return { color: getPriorityMarkerColor("medium"), fill: getPriorityMarkerColor("medium") };
    return { color: getPriorityMarkerColor("low"), fill: getPriorityMarkerColor("low") };
  };
  
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Stats Bar */}
      <div className="bg-white p-3 rounded-lg shadow mb-4">
        <div className="flex flex-wrap gap-4 text-sm">
          {/* SOS Alert - High Priority */}
          {sosStats.total > 0 && (
            <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
              <span className="font-semibold text-red-600">🚨 SOS Alerts:</span>
              <span className="text-red-600 font-bold">{sosStats.active}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Total Crimes:</span>
            <span className="text-gray-700">{reportsStats.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Critical:</span>
            <span className="text-red-600 font-bold">{reportsStats.critical}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">High:</span>
            <span className="text-orange-600 font-bold">{reportsStats.high}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Medium:</span>
            <span className="text-yellow-600 font-bold">{reportsStats.medium}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Low:</span>
            <span className="text-green-600 font-bold">{reportsStats.low}</span>
          </div>
</div>
      </div>
      
      <div style={{ height: "550px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
        <MapContainer
          center={[22.2587, 71.1924]}
          zoom={7}
          minZoom={6}
          maxZoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          {/* Clean tile layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
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
          
          {/* District Boundaries - Show actual GeoJSON boundaries */}
          {districtGeo && selectedCity === "all" && (
            <GeoJSON
              data={districtGeo}
              style={{
                color: "#6366f1",
                weight: 1.5,
                fillColor: "#818cf8",
                fillOpacity: 0.1,
              }}
              onEachFeature={(feature, layer) => {
                const districtName = feature.properties?.name || feature.properties?.DISTRICT || feature.properties?.district;
                if (districtName) {
                  layer.bindPopup(`<strong>${districtName}</strong>`);
                }
              }}
            />
          )}
          
          {/* When specific city is selected - highlight and zoom to that district */}
          {districtGeo && selectedCity !== "all" && (
            <GeoJSON
              data={districtGeo}
              style={(feature) => {
                const districtName = feature.properties?.name || feature.properties?.DISTRICT || feature.properties?.district;
                // Match the selected city (handle case sensitivity and special characters)
                const isSelected = districtName?.toLowerCase().replace(/\s+/g, '') === selectedCity.toLowerCase().replace(/\s+/g, '').replace(/'/g, '');
                return {
                  color: isSelected ? "#2563eb" : "#94a3b8",
                  weight: isSelected ? 3 : 1,
                  fillColor: isSelected ? "#3b82f6" : "#cbd5e1",
                  fillOpacity: isSelected ? 0.25 : 0.05,
                };
              }}
              onEachFeature={(feature, layer) => {
                const districtName = feature.properties?.name || feature.properties?.DISTRICT || feature.properties?.district;
                if (districtName) {
                  layer.bindPopup(`<strong>${districtName}</strong>`);
                }
              }}
            />
          )}
          
          {/* Map bounds adjuster */}
          <MapBounds selectedCity={selectedCity} />
          
          {/* City boundary circles - show priority-based colored circles for each city */}
          {selectedCity === "all" 
            ? Object.entries(cityCoordinates).map(([city, coords]) => {
                const cityColor = getCityColor(city);
                const cityReports = reports.filter(r => r.city === city);
                if (cityReports.length === 0) return null;
                return (
                  <Circle
                    key={city}
                    center={coords}
                    radius={cityRadius[city] || 15000}
                    pathOptions={{ 
                      color: cityColor.color, 
                      fillColor: cityColor.fill, 
                      fillOpacity: 0.35, 
                      weight: 4, 
                      dashArray: "5, 10" 
                    }}
                  />
                );
              })
            : selectedCity && cityCoordinates[selectedCity] ? (
              <Circle
                key={selectedCity}
                center={cityCoordinates[selectedCity]}
                radius={cityRadius[selectedCity] || 15000}
                pathOptions={{ 
                  color: getPriorityMarkerColor("low"), 
                  fillColor: getPriorityMarkerColor("low"), 
                  fillOpacity: 0.35, 
                  weight: 4, 
                  dashArray: "5, 10" 
                }}
              />
            ) : null
          }
          
          {/* SOS Markers - Rendered separately (not clustered) for highest priority display */}
          {displaySOSAlerts.map((alert) => (
            <Marker
              key={alert._id}
              position={[alert.latitude, alert.longitude]}
              icon={createSOSIcon()}
            >
              <Popup>
                <div className="min-w-[200px] max-w-[280px]">
                  {/* SOS Header */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
                      🚨 SOS - CRITICAL
                    </span>
                  </div>
                  
                  {/* Alert Type */}
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {alert.alertType} Alert
                  </div>
                  
                  {/* User Info */}
                  <h3 className="font-bold text-gray-800 mb-2">
                    {alert.name || "Unknown"}
                  </h3>
                  
                  {/* Phone Number */}
                  {alert.phoneNumber && (
                    <div className="text-xs text-gray-500 mb-1">
                      📞 {alert.phoneNumber}
                    </div>
                  )}
                  
                  {/* Location Info */}
                  <div className="text-xs text-gray-500 mb-3">
                    📍 {alert.area || "Unknown Area"}, {alert.city}
                  </div>
                  
                  {/* Coordinates */}
                  <div className="text-xs text-gray-500 mb-3">
                    🌐 {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                  </div>
                  
                  {/* Time */}
                  <div className="text-xs text-gray-500 mb-3">
                    🕐 {new Date(alert.timestamp).toLocaleString()}
                  </div>
                  
                  {/* Status */}
                  <div className="text-xs mb-3">
                    <span className="font-semibold">Status:</span> {alert.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Crime markers with clustering */}
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
          >
            {allReportsWithPosition.map((report) => {
              const { markerPosition } = report;
              
              return (
                <Marker
                  key={report._id}
                  position={[markerPosition.lat, markerPosition.lng]}
                  icon={markerPosition.hasExactLocation 
                    ? createPriorityIcon(report.priority) 
                    : createFallbackIcon(report.priority)}
                  eventHandlers={{
                    click: () => {
                      if (onMarkerClick) onMarkerClick(report);
                    },
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px] max-w-[280px]">
                      {/* Priority Badge */}
                      <div className="mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(report.priority).bg} ${getPriorityBadge(report.priority).textColor}`}
                          style={getPriorityInlineStyle(report.priority)}
                        >
                          {getPriorityBadge(report.priority).label}
                        </span>
                      </div>
                      
                      {/* Crime Type */}
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {report.crimeType}
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-bold text-gray-800 mb-2">
                        {report.title}
                      </h3>
                      
                      {/* Location Info */}
                      <div className="text-xs text-gray-500 mb-3">
                        📍 {report.area}, {report.city}
                      </div>
                      
                      {/* Status */}
                      <div className="text-xs mb-3">
                        <span className="font-semibold">Status:</span> {report.status}
                      </div>
                      
                      {/* View More Button */}
                      <button
                        onClick={() => handleViewMore(report)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-4 bg-white p-3 rounded-lg shadow">
        <h4 className="text-sm font-semibold mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: "#dc2626" }}></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: "#ea580c" }}></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: "#eab308" }}></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: "#22c55e" }}></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full border-2 border-dashed border-white" style={{ backgroundColor: "#dc2626" }}></div>
            <span>Approximate Location</span>
          </div>
        </div>
      </div>
    </div>
  );
}

