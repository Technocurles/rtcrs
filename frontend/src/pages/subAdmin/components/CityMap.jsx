import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { getAreaCoordinates, areaCoordinates } from "../../../utils/areaCoordinates";
import { getPriorityMarkerColor, getPriorityStyle, normalizePriority } from "../../../utils/priorityStyles";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

// Create icon for crimes without exact GPS (dashed border to indicate approximate location)
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
// Priority: 1. GPS coordinates (if within city boundary), 2. Area coordinates, 3. City center
const getMarkerPosition = (report, city, cityCenterCoords, boundaryRadius = 15000) => {
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
      // GPS coordinates are within city boundary - use them
      return {
        lat: reportLat,
        lng: reportLng,
        hasExactLocation: true
      };
    }
    // GPS coordinates are outside city boundary - fall through to area/city center
  }
  
  // 2. Try to get area coordinates from areaCoordinates.js
  if (report.area && city) {
    const areaCoords = getAreaCoordinates(city, report.area);
    if (areaCoords) {
      return {
        lat: areaCoords.lat,
        lng: areaCoords.lng,
        hasExactLocation: false,
        locationType: 'area'
      };
    }
  }
  
  // 3. Fall back to city center
  return {
    lat: cityCenterCoords[0],
    lng: cityCenterCoords[1],
    hasExactLocation: false,
    locationType: 'city'
  };
};

// Calculate distance between two points in meters using Haversine formula
const getDistanceFromCenter = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth's radius in meters
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

// Create live location icon (blue)
const createLiveLocationIcon = () => {
  return new L.DivIcon({
    html: `<div style="
      background-color: #3b82f6;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>`,
    className: "live-location-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Create blinking SOS marker icon for SubAdmin map
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
          animation: sos-pulse-subadmin 1s ease-out infinite;
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
        @keyframes sos-pulse-subadmin {
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
    className: "sos-marker-subadmin",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

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

// Truncate description to max 150 chars
const truncateDescription = (desc, maxLength = 150) => {
  if (!desc) return "";
  if (desc.length <= maxLength) return desc;
  return desc.substring(0, maxLength) + "...";
};

// Component to fit map bounds to selected SOS or city
const MapBounds = ({ city, reports, selectedSOS }) => {
  const map = useMap();
  
  useEffect(() => {
    // If there's a selected SOS, center on it
    if (selectedSOS && selectedSOS.latitude && selectedSOS.longitude) {
      map.setView([selectedSOS.latitude, selectedSOS.longitude], 14);
    } else if (city && cityCoordinates[city]) {
      const center = cityCoordinates[city];
      const radius = cityRadius[city] || 15000;
      
      // Create a bounds object from the center and radius
      const bounds = L.latLng(center).toBounds(radius);
      map.fitBounds(bounds);
    }
  }, [map, city, selectedSOS]);
  
  return null;
};

export default function CityMap({ 
  city, 
  reports = [], 
  liveLocation = null, 
  sosAlerts = [],
  onViewMore,
  onMarkerClick,
  selectedSOS = null
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get city center coordinates
  const cityCenter = useMemo(() => {
    return cityCoordinates[city] || [23.0225, 72.5714]; // Default to Ahmedabad
  }, [city]);
  
  // Get city boundary radius
  const boundaryRadius = useMemo(() => {
    return cityRadius[city] || 15000;
  }, [city]);
  
  // Calculate stats for all reports
  const reportsStats = useMemo(() => {
    const stats = {
      total: reports.length,
      exactLocation: 0,
      areaLocation: 0,
      cityLocation: 0
    };
    
    reports.forEach(report => {
      const position = getMarkerPosition(report, city, cityCenter, boundaryRadius);
      if (position.hasExactLocation) {
        stats.exactLocation++;
      } else if (position.locationType === 'area') {
        stats.areaLocation++;
      } else {
        stats.cityLocation++;
      }
    });
    
    return stats;
  }, [reports, city, cityCenter, boundaryRadius]);
  
  // Get active and acknowledged SOS alerts for display
  // Show markers for all statuses except "resolved" and "false_alert"
  const displaySOSAlerts = useMemo(() => {
    return sosAlerts.filter(alert => alert.status !== "resolved" && alert.status !== "false_alert");
  }, [sosAlerts]);
  
  // Calculate SOS stats
  const sosStats = useMemo(() => {
    return {
      total: displaySOSAlerts.length,
      active: displaySOSAlerts.filter(a => a.status === "active").length,
    };
  }, [displaySOSAlerts]);
  
  // Process all reports to get their marker positions
  const allReportsWithPosition = useMemo(() => {
    return reports.map(report => ({
      ...report,
      markerPosition: getMarkerPosition(report, city, cityCenter, boundaryRadius)
    }));
  }, [reports, city, cityCenter, boundaryRadius]);
  
  // Debug logging
  console.log("All reports:", reports.length);
  console.log("Reports with exact GPS:", reportsStats.exactLocation);
  console.log("Reports with area location:", reportsStats.areaLocation);
  console.log("Reports with city location:", reportsStats.cityLocation);
  
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
        background-color: #4f46e5;
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
      <div className="bg-white p-3 rounded-lg shadow mb-4 flex gap-4 text-sm flex-wrap">
        {/* SOS Alert - High Priority */}
        {sosStats.total > 0 && (
          <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
            <span className="font-semibold text-red-600">🚨 SOS Alerts:</span>
            <span className="text-red-600 font-bold">{sosStats.total}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-semibold">Total Crimes:</span>
          <span className="text-gray-700">{reports.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Exact GPS:</span>
          <span className="text-gray-700">{reportsStats.exactLocation}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Area Based:</span>
          <span className="text-gray-700">{reportsStats.areaLocation}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">City Center:</span>
          <span className="text-gray-700">{reportsStats.cityLocation}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">City:</span>
          <span className="text-gray-700">{city}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border" style={getPriorityInlineStyle("critical")}>
            Critical
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border" style={getPriorityInlineStyle("high")}>
            High
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border" style={getPriorityInlineStyle("medium")}>
            Medium
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border" style={getPriorityInlineStyle("low")}>
            Low
          </span>
        </div>
      </div>
      
      <div style={{ height: "500px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
        <MapContainer
          center={cityCenter}
          zoom={11}
          minZoom={9}
          maxZoom={15}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          {/* Clean tile layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {/* City boundary circle */}
          <Circle
            center={cityCenter}
            radius={boundaryRadius}
            pathOptions={{
              color: "#4f46e5",
              fillColor: "#4f46e5",
              fillOpacity: 0.05,
              weight: 2,
              dashArray: "5, 10",
            }}
          />
          
          {/* Map bounds adjuster */}
          <MapBounds city={city} reports={reports} selectedSOS={selectedSOS} />
          
          {/* Crime markers with clustering */}
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            maxClusterRadius={50}
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
                      
                      {/* View More Button */}
                      <button
                        onClick={() => handleViewMore(report)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded transition-colors"
                      >
                        View More
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
          
          {/* Live Location Marker */}
          {liveLocation && liveLocation.lat && liveLocation.lng && (
            <Marker
              position={[liveLocation.lat, liveLocation.lng]}
              icon={createLiveLocationIcon()}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <h3 className="font-bold text-blue-600 mb-1">
                    🔵 Live Location
                  </h3>
                  <p className="text-sm text-gray-600">
                    Citizen's current shared location
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
          
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
        </MapContainer>
      </div>
    </div>
  );
}

