

import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { getPriorityMarkerColor, getPriorityStyle, matchesPriority } from "../../utils/priorityStyles";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Gujarat city coordinates
const cityCoordinates = {
  Banaskantha: [24.1725, 72.4380],
  Patan: [23.8490, 72.1266],
  Mehsana: [23.5880, 72.3693],
  Sabarkantha: [23.5981, 73.0024],
  Aravalli: [23.6047, 73.2980],
  Gandhinagar: [23.2156, 72.6369],
  Ahmedabad: [23.0225, 72.5714],
  Vadodara: [22.3072, 73.1812],
  Anand: [22.5645, 72.9289],
  Kheda: [22.7507, 72.6850],
  "Chhota Udaipur": [22.3042, 74.0150],
  Dahod: [22.8358, 74.2550],
  Mahisagar: [23.1460, 73.6190],
  Surat: [21.1702, 72.8311],
  Bharuch: [21.7051, 72.9959],
  Narmada: [21.8763, 73.5020],
  Navsari: [20.9467, 72.9520],
  Valsad: [20.5992, 72.9342],
  Dang: [20.7570, 73.6866],
  Tapi: [21.1276, 73.3890],
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

// Create marker icon based on priority
const createPriorityIcon = (priority, hasExactLocation) => {
  const color = getPriorityMarkerColor(priority);
  const borderStyle = hasExactLocation ? "border: 3px solid white" : "border: 3px dashed white";
  
  return new L.DivIcon({
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      ${borderStyle};
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    className: "priority-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

// Get marker position for each crime
const getMarkerPosition = (report) => {
  const city = report.city;
  const cityCenterCoords = cityCoordinates[city] || [23.0225, 72.5714];
  const boundaryRadius = cityRadius[city] || 15000;
  
  if (report.location && 
      report.location.coordinates && 
      report.location.coordinates.length === 2 &&
      typeof report.location.coordinates[0] === 'number' &&
      typeof report.location.coordinates[1] === 'number') {
    
    const reportLat = report.location.coordinates[1];
    const reportLng = report.location.coordinates[0];
    const distance = getDistanceFromCenter(reportLat, reportLng, cityCenterCoords[0], cityCenterCoords[1]);
    
    if (distance <= boundaryRadius) {
      return { lat: reportLat, lng: reportLng, hasExactLocation: true };
    }
  }
  
  return {
    lat: cityCenterCoords[0],
    lng: cityCenterCoords[1],
    hasExactLocation: false,
  };
};

const getDistanceFromCenter = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

// Get priority badge
const getPriorityBadge = (priority) => {
  return getPriorityStyle(priority);
};

// Map bounds component
const MapBounds = ({ selectedCity }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedCity && selectedCity !== "all" && cityCoordinates[selectedCity]) {
      const center = cityCoordinates[selectedCity];
      const radius = cityRadius[selectedCity] || 15000;
      const bounds = L.latLng(center).toBounds(radius);
      map.fitBounds(bounds);
    } else if (selectedCity === "all") {
      map.setView([22.2587, 71.1924], 7);
    }
  }, [map, selectedCity]);
  
  return null;
};

// MapResizer component - FIXED: Robust resize handling with ResizeObserver, leaflet events, and strict null checks
const MapResizer = () => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;

    let resizeTimeout = null;
    
    const safeInvalidateSize = () => {
      // Strict null/function checks FIRST
      if (!map || map._destroyed || !map.invalidateSize || typeof map.invalidateSize !== 'function') {
        return;
      }

      // Cancel previous
      if (resizeTimeout) clearTimeout(resizeTimeout);

      // Debounced call with RAF
      resizeTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
          try {
            map.invalidateSize({debounceMoveend: true});
          } catch (error) {
            console.warn('Map resize failed:', error);
          }
        });
      }, 200);
    };

    // Initial safe resize
    const initTimeout = setTimeout(safeInvalidateSize, 100);

    // Native leaflet resize event
    if (map.on) {
      map.on('resize', safeInvalidateSize);
    }

    // Modern ResizeObserver (preferred)
    const mapContainer = map.getContainer();
    if (mapContainer?.parentElement && 'ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(safeInvalidateSize);
      resizeObserver.observe(mapContainer);
      resizeObserver.observe(mapContainer.parentElement);

      return () => {
        clearTimeout(resizeTimeout);
        clearTimeout(initTimeout);
        if (map.off) map.off('resize', safeInvalidateSize);
        resizeObserver.disconnect();
      };
    } else {
      // Fallback window resize
      const handleWindowResize = () => safeInvalidateSize();
      window.addEventListener('resize', handleWindowResize, { passive: true });

      return () => {
        clearTimeout(resizeTimeout);
        clearTimeout(initTimeout);
        if (map.off) map.off('resize', safeInvalidateSize);
        window.removeEventListener('resize', handleWindowResize);
      };
    }
  }, [map]);

  return null;
};

export default function HomeCrimeMap({ reports = [] }) {
  const [mounted, setMounted] = useState(false);
  const [gujaratGeo, setGujaratGeo] = useState(null);
  const [selectedCity, setSelectedCity] = useState("all");
  const mapRef = useRef();
  
  useEffect(() => {
    setMounted(true);
    axios
      .get("https://raw.githubusercontent.com/geohacker/india/master/state/gujarat.geojson")
      .then((res) => setGujaratGeo(res.data))
      .catch((err) => console.error("GeoJSON load error:", err));
  }, []);
  
  const filteredReports = useMemo(() => {
    if (selectedCity === "all") return reports;
    return reports.filter(report => report.city === selectedCity);
  }, [reports, selectedCity]);
  
  const reportsStats = useMemo(() => {
    return {
      total: filteredReports.length,
      critical: filteredReports.filter(r => matchesPriority(r.priority, "critical")).length,
      high: filteredReports.filter(r => matchesPriority(r.priority, "high")).length,
      medium: filteredReports.filter(r => matchesPriority(r.priority, "medium")).length,
      low: filteredReports.filter(r => matchesPriority(r.priority, "low")).length,
    };
  }, [filteredReports]);
  
  const allReportsWithPosition = useMemo(() => {
    return filteredReports.map(report => ({
      ...report,
      markerPosition: getMarkerPosition(report)
    }));
  }, [filteredReports]);
  
  const createClusterCustomIcon = (cluster) => {
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
  };
  
  const getCityColor = (city) => {
    const cityReports = reports.filter(r => r.city === city);
    if (cityReports.length === 0) return { color: "#6b7280", fill: "#6b7280" };
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
      <div className="flex items-center justify-center h-80 bg-gray-100 rounded-lg">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Stats Bar */}
      <div className="bg-white p-3 rounded-lg shadow mb-3">
        <div className="flex flex-wrap gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Total Crimes:</span>
            <span className="text-gray-700 font-bold">{reportsStats.total}</span>
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
        
        {/* City Filter */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <label className="text-xs md:text-sm font-semibold">Filter by City:</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Gujarat</option>
            {Object.keys(cityCoordinates).map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {selectedCity !== "all" && (
            <button
              onClick={() => setSelectedCity("all")}
              className="px-2 py-1 text-xs md:text-sm text-blue-600 hover:text-blue-800"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      
      {/* Map wrapper with proper overflow handling and stacking context */}
      <div 
        style={{ 
          height: "400px", 
          width: "100%", 
          borderRadius: "12px", 
          overflow: "hidden",
          position: "relative",
          zIndex: 1
        }}
      >
  <MapContainer
          ref={mapRef}
          center={[22.2587, 71.1924]}
          zoom={7}
          minZoom={6}
          maxZoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          whenReady={(mapInstance) => {
            // Safe initial resize with strict checks
            setTimeout(() => {
              if (mapInstance && mapInstance.invalidateSize && typeof mapInstance.invalidateSize === 'function') {
                mapInstance.invalidateSize({debounceMoveend: true});
              }
            }, 250);
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {gujaratGeo && (
            <GeoJSON
              data={gujaratGeo}
              style={{ color: "#2563eb", weight: 2, fillColor: "#3b82f6", fillOpacity: 0.05 }}
            />
          )}
          
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
                    pathOptions={{ color: cityColor.color, fillColor: cityColor.fill, fillOpacity: 0.1, weight: 2, dashArray: "5, 10" }}
                  />
                );
              })
            : selectedCity && cityCoordinates[selectedCity] ? (
              <Circle
                key={selectedCity}
                center={cityCoordinates[selectedCity]}
                radius={cityRadius[selectedCity] || 15000}
                pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.1, weight: 3, dashArray: "5, 10" }}
              />
            ) : null
          }
          
          <MapBounds selectedCity={selectedCity} />
          
          {/* MapResizer - Fixes map rendering issues after page load/layout changes */}
          <MapResizer />
          
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
                  icon={createPriorityIcon(report.priority, markerPosition.hasExactLocation)}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <div className="mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(report.priority).bg} ${getPriorityBadge(report.priority).textColor}`}>
                          {getPriorityBadge(report.priority).label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 uppercase mb-1">{report.crimeType}</div>
                      <h3 className="font-bold text-gray-800 mb-1 text-sm">{report.title}</h3>
                      <div className="text-xs text-gray-500">📍 {report.area}, {report.city}</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-3 bg-white p-2 rounded-lg shadow">
        <h4 className="text-xs font-semibold mb-2">Legend</h4>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-600 border border-white"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500 border border-white"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500 border border-white"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-600 border border-dashed border-white"></div>
            <span>Approx Location</span>
          </div>
        </div>
      </div>
    </div>
  );
}

