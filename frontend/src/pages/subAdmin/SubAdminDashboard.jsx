  
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SubAdminSidebar from "./components/SubAdminSidebar";
import CityMap from "./components/CityMap";
import SOSAlerts from "./components/SOSAlerts";
import CityUsers from "./components/CityUsers";
import { getReportsByCity, updateCrimeStatus } from "../admin/services/crimeService";
import { Clock } from "lucide-react";
import { getSOSAlertsByCity, updateSOSAlertStatus } from "../admin/services/sosService";
import { getCurrentAdmin } from "../admin/services/adminService";
import { initializeSocket, onNewCrimeReport, onNewSOSAlert, disconnectSocket, removeCrimeReportListener, removeSOSAlertListener } from "../../utils/socket";
import { getPriorityLabel, getPriorityStyle, matchesPriority, normalizePriority } from "../../utils/priorityStyles";

export default function SubAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  
  // CRITICAL FIX: Get admin info from backend API instead of localStorage
  // This prevents cross-tab city switching issues since each tab's JWT is independent
  const [adminInfo, setAdminInfo] = useState(null);
  const [loadingAdminInfo, setLoadingAdminInfo] = useState(true);
  
  // CRITICAL FIX: Use sessionStorage instead of localStorage for the token
  // sessionStorage is tab-specific (each tab has its own), preventing cross-tab token pollution
  const adminToken = sessionStorage.getItem("subAdminToken") || localStorage.getItem("subAdminToken");
  
  // City from API state - this is tab-specific because it comes from the API response
  // not from localStorage which is shared across tabs
  const adminCity = adminInfo?.city;
  const adminId = adminInfo?._id;
  
  // Live location state (for citizen's shared location)
  const [liveLocation, setLiveLocation] = useState(null);
  
  // SOS alerts state
  const [sosAlerts, setSOSAlerts] = useState([]);
  // Recent activity timeline
  const [recentActivity, setRecentActivity] = useState([]);
  const [showSOSNotification, setShowSOSNotification] = useState(false);
  const [latestSOS, setLatestSOS] = useState(null);
  
  // Selected SOS for map centering
  const [selectedSOS, setSelectedSOS] = useState(null);
  
  // Show response panel state
  const [showResponsePanel, setShowResponsePanel] = useState(false);
  
  // Evidence expand modal state
  const [expandedEvidence, setExpandedEvidence] = useState(null);
  
  // Audio ref for emergency sound
  const audioRef = useRef(null);

  // Initialize audio for emergency sound
  useEffect(() => {
    // Create emergency sound using Web Audio API
    const playEmergencySound = () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        // Create pulsing effect
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        // Repeat for 3 times
        let count = 0;
        const interval = setInterval(() => {
          count++;
          if (count >= 3) {
            clearInterval(interval);
            return;
          }
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.value = 800;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + 0.3);
        }, 400);
      } catch (e) {
        console.log("Audio not supported");
      }
    };
    
    // Store function in ref
    audioRef.current = playEmergencySound;
  }, []);

  useEffect(() => {
    if (!adminToken) {
      navigate("/subadmin/login", { replace: true });
    }
  }, [adminToken, navigate]);

  // CRITICAL FIX: Fetch admin info from API on mount to get tab-specific city
  // This prevents cross-tab city switching because each tab has its own JWT token
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        setLoadingAdminInfo(true);
        const data = await getCurrentAdmin();
        setAdminInfo(data);
        console.log("Admin info fetched from API:", data.city);
      } catch (err) {
        console.error("Error fetching admin info:", err);
        // If error, redirect to login
        sessionStorage.removeItem("subAdminToken");
        localStorage.removeItem("subAdminToken");
        navigate("/subadmin/login", { replace: true });
      } finally {
        setLoadingAdminInfo(false);
      }
    };
    
    if (adminToken) {
      fetchAdminInfo();
    }
  }, [adminToken, navigate]);

  // CRITICAL FIX: Removed localStorage city monitoring
  // The previous code was reading from localStorage.getItem("subAdminCity") which
  // caused cross-tab pollution - when one tab logged in, it would change the city
  // for all other tabs. Now city only comes from the authenticated user's data
  // fetched via API, ensuring complete tab isolation.

  // Compute recent activity from reports and SOS alerts
  const computeRecentActivity = useCallback(() => {
    const events = [];

    // Recent crimes
    reports.slice(0, 5).forEach(report => {
      events.push({
        id: `crime-${report._id}`,
        type: 'new_crime',
        title: report.title,
        subtitle: `${report.crimeType} • ${report.area}`,
        status: report.status,
        timestamp: new Date(report.createdAt),
        priority: report.priority,
        icon: '📋'
      });
    });

    // Recent SOS
    sosAlerts.slice(0, 5).forEach(alert => {
      events.push({
        id: `sos-${alert._id}`,
        type: 'sos_alert',
        title: alert.name || 'SOS Alert',
        subtitle: `${alert.area} • ${alert.status}`,
        status: alert.status,
        timestamp: new Date(alert.timestamp),
        priority: 'high',
        icon: '🚨'
      });
    });

    // Sort by timestamp descending
    events.sort((a, b) => b.timestamp - a.timestamp);
    return events.slice(0, 10);
  }, [reports, sosAlerts]);

  // Update recent activity when reports or sosAlerts change
  useMemo(() => {
    const activity = computeRecentActivity();
    setRecentActivity(activity);
  }, [computeRecentActivity]);

  // Fetch reports when component mounts
  useEffect(() => {
    fetchReports();
    fetchSOSAlerts();
  }, []);

  // Initialize socket for real-time updates
  useEffect(() => {
    if (adminToken && adminCity) {
      try {
        // Pass adminId to ensure unique socket connection per user
        initializeSocket(adminToken, "sub_admin", adminCity, adminId);
        
        // CRITICAL: Remove old listeners before adding new ones to prevent duplicate events
        removeCrimeReportListener();
        removeSOSAlertListener();
        
        // Listen for new crime reports
        onNewCrimeReport((data) => {
          console.log("New crime report received:", data);
          
          // CRITICAL: Verify city of the report before adding
          if (data.data && data.data.city) {
            const reportCity = data.data.city || "";
            const normalizedReportCity = reportCity.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            const normalizedAdminCity = adminCity.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            
            // Only process reports for this subadmin's city
            if (normalizedReportCity !== normalizedAdminCity) {
              console.log(`Ignoring crime report from different city: ${normalizedReportCity} !== ${normalizedAdminCity}`);
              return;
            }
            
            console.log(`Processing crime report for MY city: ${normalizedAdminCity}`);
            
            // Add new report to the list
            setReports((prev) => {
              // Check if report already exists
              const exists = prev.some(r => r._id === data.data.id);
              if (exists) return prev;
              
              // Add new report at the beginning
              return [data.data, ...prev];
            });

            // Add to recent activity
            setRecentActivity(prev => {
              const newEvent = {
                id: `crime-${data.data.id}`,
                type: 'new_crime',
                title: data.data.title,
                subtitle: `${data.data.crimeType} • ${data.data.area}`,
                status: data.data.status,
                timestamp: new Date(),
                priority: data.data.priority,
                icon: '📋'
              };
              const updated = [newEvent, ...prev.filter(e => e.id !== newEvent.id)];
              return updated.slice(0, 10);
            });
          }
        });
        
        // Listen for new SOS alerts
        onNewSOSAlert((data) => {
          console.log("New SOS alert received:", data);
          
          if (data.alert) {
            // IMPORTANT: Filter by city - only show alerts for this subadmin's city
            // Use consistent normalization: lowercase first, then title case
            const alertCity = data.alert.city || "";
            const normalizedAlertCity = alertCity.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            const normalizedAdminCity = adminCity.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            
            console.log(`Comparing cities: Alert City = "${normalizedAlertCity}", Admin City = "${normalizedAdminCity}"`);
            
            // Only process alerts for this subadmin's city
            if (normalizedAlertCity !== normalizedAdminCity) {
              console.log(`Ignoring SOS alert from different city: ${normalizedAlertCity} !== ${normalizedAdminCity}`);
              return; // Exit early - don't show notification for other cities
            }
            
            console.log(`Processing SOS alert for MY city: ${normalizedAdminCity}`);
            
            // Add to SOS alerts list
            setSOSAlerts((prev) => {
              const exists = prev.some(a => a._id === data.alert._id);
              if (exists) return prev;
              return [data.alert, ...prev];
            });

            // Add to recent activity
            setRecentActivity(prev => {
              const newEvent = {
                id: `sos-${data.alert._id}`,
                type: 'sos_alert',
                title: data.alert.name || 'SOS Alert',
                subtitle: `${data.alert.area} • Active`,
                status: 'active',
                timestamp: new Date(),
                priority: 'high',
                icon: '🚨'
              };
              const updated = [newEvent, ...prev.filter(e => e.id !== newEvent.id)];
              return updated.slice(0, 10);
            });
            
            // Show notification with sound
            setLatestSOS(data.alert);
            setShowSOSNotification(true);
            
            // Play emergency sound - need to resume AudioContext on user interaction
            if (audioRef.current) {
              try {
                // Try to play the sound - may fail without user interaction
                audioRef.current();
              } catch (e) {
                console.log("Audio play failed:", e);
              }
            }
          }
        });
      } catch (err) {
        console.error("Socket initialization error:", err);
      }
    }

    // Cleanup on unmount - remove listeners and disconnect socket
    return () => {
      removeCrimeReportListener();
      removeSOSAlertListener();
      disconnectSocket();
    };
  }, [adminToken, adminCity, adminId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getReportsByCity();
      setReports(data.reports || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      
      // Check for token expiration or invalid token
      if (err.response?.status === 401 || err.message?.includes("Invalid or expired token")) {
        // Token is invalid or expired, redirect to login
        sessionStorage.removeItem("subAdminToken");
        localStorage.removeItem("subAdminToken");
        setError("Session expired. Please login again.");
        setTimeout(() => {
          navigate("/subadmin/login", { replace: true });
        }, 2000);
        return;
      }
      
      setError(err.message || err.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchSOSAlerts = async (fetchAll = true) => {
    try {
      const params = fetchAll ? {} : { status: "active" };
      const data = await getSOSAlertsByCity(params);
      setSOSAlerts(data.alerts || []);
    } catch (err) {
      console.error("Error fetching SOS alerts:", err);
    }
  };

  // Handle "Received" button click - acknowledge and notify citizen, open map
  const handleSOSReceived = async () => {
    const sosToAcknowledge = latestSOS;
    
    if (sosToAcknowledge && sosToAcknowledge._id) {
      // SECURITY: Client-side city verification before attempting to acknowledge
      // This provides immediate feedback without waiting for server rejection
      const alertCity = sosToAcknowledge.city || "";
      const normalizedAlertCity = alertCity.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      const normalizedAdminCity = adminCity.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      
      if (normalizedAlertCity !== normalizedAdminCity) {
        console.error(`[SECURITY] City mismatch! Cannot acknowledge SOS from ${normalizedAlertCity} - your city is ${normalizedAdminCity}`);
        alert(`Security Error: This SOS alert is from ${normalizedAlertCity}, but you are assigned to ${normalizedAdminCity}. You cannot acknowledge alerts from other cities.`);
        setShowSOSNotification(false);
        setLatestSOS(null);
        return;
      }
      
      try {
        // Update SOS status to acknowledged
        await updateSOSAlertStatus(sosToAcknowledge._id, { status: "acknowledged" });
        
        // Update local state - keep the SOS data for the map
        setSOSAlerts((prev) =>
          prev.map((alert) =>
            alert._id === sosToAcknowledge._id ? { ...alert, status: "acknowledged" } : alert
          )
        );
        
        // Set selected SOS for map centering and open map view
        // This will center the map on the exact SOS coordinates
        setSelectedSOS(sosToAcknowledge);
        setActiveTab("map");
        setShowResponsePanel(true);
        
        // Close notification but keep the data
        setShowSOSNotification(false);
        // Don't set latestSOS to null immediately - we need it for the map
      } catch (err) {
        console.error("Error acknowledging SOS:", err);
        
        // Check if this is a city mismatch error from backend
        if (err.response?.status === 403) {
          alert("Access Denied: You can only acknowledge SOS alerts from your assigned city.");
        }
        
        setShowSOSNotification(false);
        setLatestSOS(null);
      }
    } else {
      setShowSOSNotification(false);
      setLatestSOS(null);
    }
  };

  // Handle "Dismiss" button click
  const handleSOSDismiss = () => {
    setShowSOSNotification(false);
    setLatestSOS(null);
    setSelectedSOS(null);
  };

  // Handle officer response - dispatch team
  const handleDispatchTeam = async (officerResponse, dispatchedTeam = "") => {
    if (selectedSOS && selectedSOS._id) {
      try {
        await updateSOSAlertStatus(selectedSOS._id, { 
          status: "team_dispatched",
          officerResponse,
          dispatchedTeam
        });
        
        // Update local state
        setSOSAlerts((prev) =>
          prev.map((alert) =>
            alert._id === selectedSOS._id ? { ...alert, status: "team_dispatched", officerResponse, dispatchedTeam } : alert
          )
        );
        
        setShowResponsePanel(false);
        setSelectedSOS(null);
      } catch (err) {
        console.error("Error dispatching team:", err);
      }
    }
  };

  // Handle status update for SOS
  const handleSOSStatusUpdate = async (newStatus, notes = "") => {
    if (selectedSOS && selectedSOS._id) {
      try {
        await updateSOSAlertStatus(selectedSOS._id, { 
          status: newStatus,
          resolutionNotes: notes
        });
        
        // Update local state
        setSOSAlerts((prev) =>
          prev.map((alert) =>
            alert._id === selectedSOS._id ? { ...alert, status: newStatus } : alert
          )
        );
        
        setShowResponsePanel(false);
        setSelectedSOS(null);
      } catch (err) {
        console.error("Error updating SOS status:", err);
      }
    }
  };

  // Close response panel
  const handleCloseResponsePanel = () => {
    setShowResponsePanel(false);
    setSelectedSOS(null);
  };

  // Calculate stats for all statuses
  const totalComplaints = reports.length;
  const pendingReports = reports.filter(r => r.status === "pending").length;
  const underReviewReports = reports.filter(r => r.status === "under_review").length;
  const approvedReports = reports.filter(r => r.status === "approved").length;
  const rejectedReports = reports.filter(r => r.status === "rejected").length;
  const closedReports = reports.filter(r => r.status === "closed").length;
  
  // Calculate priority stats for map
  const priorityStats = useMemo(() => {
    return {
      critical: reports.filter(r => matchesPriority(r.priority, "critical")).length,
      high: reports.filter(r => matchesPriority(r.priority, "high")).length,
      medium: reports.filter(r => matchesPriority(r.priority, "medium")).length,
      low: reports.filter(r => matchesPriority(r.priority, "low")).length,
    };
  }, [reports]);

  // Active SOS count
  const activeSOSCount = useMemo(() => {
    return sosAlerts.filter(a => a.status === "active").length;
  }, [sosAlerts]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    return getPriorityStyle(priority).badgeSolid;
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

  // Handle status update
  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await updateCrimeStatus(reportId, { status: newStatus });
      
      // Update local state
      setReports((prev) =>
        prev.map((report) =>
          report._id === reportId ? { ...report, status: newStatus } : report
        )
      );
      
      setSelectedReport(null);
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  // Handle "View More" from map popup
  const handleViewMore = useCallback((report) => {
    setSelectedReport(report);
  }, []);

  // Helper function to determine file type from URL
  const getFileTypeFromUrl = (url) => {
    if (!url) return 'unknown';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (lowerUrl.match(/\.(mp4|webm|mov|avi)$/)) return 'video';
    if (lowerUrl.match(/\.(mp3|wav|ogg|m4a)$/)) return 'audio';
    return 'unknown';
  };

  // Toggle live location (simulated - in production, this would come from a citizen)
  const toggleLiveLocation = () => {
    if (liveLocation) {
      setLiveLocation(null);
    } else {
      // Simulated live location (in real app, this would be real-time data from citizens)
      setLiveLocation({
        lat: 23.0225 + (Math.random() - 0.5) * 0.1,
        lng: 72.5714 + (Math.random() - 0.5) * 0.1,
      });
    }
  };

  // Show loading while fetching admin info - must be after all hooks
  if (loadingAdminInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SubAdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sosAlerts={sosAlerts}
        reports={reports}
        adminCity={adminCity}
      />

      <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-auto transition-all duration-300 ml-0">
        
        {/* SOS Emergency Notification Modal */}
        {showSOSNotification && latestSOS && (
          <div 
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ 
              zIndex: 99999,
              backgroundColor: 'rgba(220, 38, 38, 0.3)'
            }}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in"
              style={{ position: 'relative', zIndex: 999999 }}
            >
              <div className="text-center">
                {/* Emergency Icon */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <span className="text-4xl">🚨</span>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-red-600 mb-2">
                  🚨 SOS ALERT - EMERGENCY!
                </h3>
                
                {/* Alert Details */}
                <div className="bg-red-50 p-4 rounded-lg mb-4 text-left">
                  <p className="font-semibold text-lg">{latestSOS.name || "Unknown"}</p>
                  {latestSOS.phoneNumber && (
                    <p className="text-red-700">📞 {latestSOS.phoneNumber}</p>
                  )}
                  <p className="text-red-700">📍 {latestSOS.area || "Unknown Area"}, {latestSOS.city}</p>
                  <p className="text-red-700">🕐 {new Date(latestSOS.timestamp).toLocaleString()}</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSOSDismiss}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleSOSReceived}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <span>✓</span>
                    <span>Received</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* City Header */}
        {activeTab === "map" && adminCity && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  🗺️ {adminCity} Crime Map
                </h2>
                <p className="text-sm text-gray-500">
                  Viewing crimes in your assigned city only
                </p>
              </div>
              <div className="flex gap-3">
                {/* Toggle Live Location Button */}
                <button
                  onClick={toggleLiveLocation}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    liveLocation 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {liveLocation ? "🔵 Hide Live Location" : "📍 Show Live Location"}
                </button>
                
                {/* Refresh Button */}
                <button
                  onClick={fetchReports}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {loading ? "Loading..." : "🔄 Refresh"}
                </button>
              </div>
            </div>
            
            {/* Priority Stats */}
            <div className="flex gap-4 mt-3 text-sm">
              {/* SOS Alert */}
              {activeSOSCount > 0 && (
                <span className="flex items-center gap-1 bg-red-100 px-3 py-1 rounded-lg">
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
                  <span className="font-semibold text-red-600">SOS: {activeSOSCount}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-600"></span>
                Critical: {priorityStats.critical}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-orange-600"></span>
                High: {priorityStats.high}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                Medium: {priorityStats.medium}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Low: {priorityStats.low}
              </span>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* SOS Alert Banner */}
            {activeSOSCount > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚨</span>
                    <span className="font-bold">Active SOS Alert{activeSOSCount > 1 ? 's' : ''}: {activeSOSCount}</span>
                  </div>
                  <button 
                    onClick={() => setActiveTab("map")}
                    className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    View on Map
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white shadow-md rounded-xl p-4">
                <h3 className="text-gray-600 text-sm">Total</h3>
                <p className="text-2xl font-bold mt-2 text-blue-600">
                  {loading ? "..." : totalComplaints}
                </p>
              </div>

              <div className="bg-white shadow-md rounded-xl p-4">
                <h3 className="text-gray-600 text-sm">Pending</h3>
                <p className="text-2xl font-bold mt-2 text-yellow-500">
                  {loading ? "..." : pendingReports}
                </p>
              </div>

              <div className="bg-white shadow-md rounded-xl p-4">
                <h3 className="text-gray-600 text-sm">Under Review</h3>
                <p className="text-2xl font-bold mt-2 text-blue-500">
                  {loading ? "..." : underReviewReports}
                </p>
              </div>

              <div className="bg-white shadow-md rounded-xl p-4">
                <h3 className="text-gray-600 text-sm">Approved</h3>
                <p className="text-2xl font-bold mt-2 text-green-500">
                  {loading ? "..." : approvedReports}
                </p>
              </div>

              <div className="bg-white shadow-md rounded-xl p-4">
                <h3 className="text-gray-600 text-sm">Rejected</h3>
                <p className="text-2xl font-bold mt-2 text-red-500">
                  {loading ? "..." : rejectedReports}
                </p>
              </div>

              <div className="bg-white shadow-md rounded-xl p-4">
                <h3 className="text-gray-600 text-sm">Closed</h3>
                <p className="text-2xl font-bold mt-2 text-gray-500">
                  {loading ? "..." : closedReports}
                </p>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="mt-6 bg-white shadow-md rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </h3>
                <span className="text-sm text-gray-500">
                  Last {recentActivity.length} events
                </span>
              </div>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentActivity.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex-shrink-0 mt-0.5 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{event.icon}</span>
                          <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                          {event.priority && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium border"
                            style={getPriorityInlineStyle(event.priority)}
                          >
                              {getPriorityLabel(event.priority)}
                          </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{event.subtitle}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.status ? `${event.status.replace('_', ' ')} • ` : ''}
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

{activeTab === "users" && adminCity && (
          <CityUsers adminCity={adminCity} />
        )}

        {/* SOS Alerts Tab */}
        {activeTab === "sos" && (
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-bold">SOS Alerts & History</h1>
              <p className="text-gray-500">View and manage all SOS alerts for {adminCity}</p>
            </div>
            <SOSAlerts 
              sosAlerts={sosAlerts} 
              adminCity={adminCity}
              onSOSUpdated={(updatedAlerts) => setSOSAlerts(updatedAlerts)}
            />
          </>
        )}

        {activeTab === "complaints" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Crime Reports</h1>
              
              {/* Refresh Button */}
              <button
                onClick={fetchReports}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No crime reports found for your city.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Area
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evidence
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50 rounded">
                          {report.reportId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {report.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.description.substring(0, 50)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.crimeType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.area}</div>
                          <div className="text-sm text-gray-500">{report.city}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityColor(report.priority)}`}
                            style={getPriorityInlineStyle(report.priority)}
                          >
                            {getPriorityStyle(report.priority).label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {report.evidence && report.evidence.length > 0 ? (
                            <div className="flex gap-1">
                              {report.evidence.slice(0, 3).map((ev, index) => (
                                <div key={index} className="relative group">
                                  {ev.fileType === "image" ? (
                                    <img
                                      src={ev.fileUrl}
                                      alt={`Evidence ${index + 1}`}
                                      className="w-10 h-10 object-cover rounded cursor-pointer hover:ring-2 hover:ring-blue-500"
                                      onClick={() => window.open(ev.fileUrl, '_blank')}
                                    />
                                  ) : ev.fileType === "video" ? (
                                    <div 
                                      className="w-10 h-10 rounded bg-purple-100 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-purple-500"
                                      onClick={() => window.open(ev.fileUrl, '_blank')}
                                    >
                                      <span className="text-sm">🎬</span>
                                    </div>
                                  ) : ev.fileType === "audio" ? (
                                    <div 
                                      className="w-10 h-10 rounded bg-green-100 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-green-500"
                                      onClick={() => window.open(ev.fileUrl, '_blank')}
                                    >
                                      <span className="text-sm">🎤</span>
                                    </div>
                                  ) : (
                                    <div 
                                      className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-gray-500"
                                      onClick={() => window.open(ev.fileUrl, '_blank')}
                                    >
                                      <span className="text-sm">📎</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {report.evidence.length > 3 && (
                                <span className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded text-xs font-medium text-gray-600">
                                  +{report.evidence.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">NA</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        
        {/* Map Tab */}
        {activeTab === "map" && (
          <>
            {loading ? (
              <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <div className="text-gray-500">Loading map data...</div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : (
                <CityMap 
                  key={selectedSOS ? selectedSOS._id : 'default'}
                  city={adminCity}
                  reports={reports}
                  sosAlerts={sosAlerts}
                  liveLocation={liveLocation}
                  onViewMore={handleViewMore}
                  selectedSOS={selectedSOS}
                />
            )}
            
            {/* SOS Response Panel - Shows when officer needs to respond */}
            {showResponsePanel && selectedSOS && (
              <SOSResponsePanel 
                sos={selectedSOS}
                onDispatchTeam={handleDispatchTeam}
                onStatusUpdate={handleSOSStatusUpdate}
                onClose={handleCloseResponsePanel}
              />
            )}
          </>
        )}
      </main>

      {/* Report Details Modal - rendered outside main to avoid stacking context issues */}
      <ModalPortal 
        selectedReport={selectedReport} 
        onClose={() => setSelectedReport(null)}
        handleStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}

// Modal Portal - renders outside the main content area
const ModalPortal = ({ selectedReport, onClose, handleStatusUpdate }) => {
  if (!selectedReport) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ zIndex: 10000 }}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{selectedReport.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Crime Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Crime Type</label>
              <p className="font-medium">{selectedReport.crimeType}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <p className="font-medium capitalize">{selectedReport.status}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Date of Crime</label>
              <p className="font-medium">
                {selectedReport.dateOfCrime ? new Date(selectedReport.dateOfCrime).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Approx Time of Crime</label>
              <p className="font-medium">{selectedReport.approxTimeOfCrime || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Priority</label>
              <p className="font-medium capitalize">{selectedReport.priority}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Division/City</label>
              <p className="font-medium">{selectedReport.division} / {selectedReport.city}</p>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm text-gray-500">Location</label>
            <p className="font-medium">
              {selectedReport.area}, {selectedReport.city}
            </p>
            {selectedReport.address && (
              <p className="text-sm text-gray-600">{selectedReport.address}</p>
            )}
            {selectedReport.location && (
              <p className="text-xs text-gray-400 mt-1">
                📍 Coordinates: {selectedReport.location.coordinates[1]}, {selectedReport.location.coordinates[0]}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-500">Description</label>
            <p className="mt-1">{selectedReport.description}</p>
          </div>

          {/* Evidence */}
          {selectedReport.evidence && selectedReport.evidence.length > 0 && (
            <div>
              <label className="text-sm text-gray-500">Evidence ({selectedReport.evidence.length} files)</label>
              <div className="flex gap-3 mt-2 flex-wrap">
                {selectedReport.evidence.map((ev, index) => (
                  <div key={index} className="relative group">
                    {ev.fileType === "image" ? (
                      <div className="relative">
                        <img
                          src={ev.fileUrl}
                          alt={`Evidence ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500"
                          onClick={() => window.open(ev.fileUrl, '_blank')}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1 rounded-b-lg text-center">
                          Image {index + 1}
                        </div>
                      </div>
                    ) : ev.fileType === "video" ? (
                      <div 
                        className="w-24 h-24 rounded-lg border border-gray-200 bg-purple-100 flex flex-col items-center justify-center cursor-pointer hover:ring-2 hover:ring-purple-500"
                        onClick={() => window.open(ev.fileUrl, '_blank')}
                      >
                        <span className="text-3xl">🎬</span>
                        <span className="text-xs text-purple-700 font-medium">Video {index + 1}</span>
                      </div>
                    ) : ev.fileType === "audio" ? (
                      <div 
                        className="w-24 h-24 rounded-lg border border-gray-200 bg-green-100 flex flex-col items-center justify-center cursor-pointer hover:ring-2 hover:ring-green-500"
                        onClick={() => window.open(ev.fileUrl, '_blank')}
                      >
                        <span className="text-3xl">🎤</span>
                        <span className="text-xs text-green-700 font-medium">Audio {index + 1}</span>
                      </div>
                    ) : (
                      <div 
                        className="w-24 h-24 rounded-lg border border-gray-200 bg-gray-100 flex flex-col items-center justify-center cursor-pointer hover:ring-2 hover:ring-gray-500"
                        onClick={() => window.open(ev.fileUrl, '_blank')}
                      >
                        <span className="text-3xl">📎</span>
                        <span className="text-xs text-gray-700 font-medium">File {index + 1}</span>
                      </div>
                    )}
                    {ev.fileSize && (
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        {(ev.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reporter Info */}
          {!selectedReport.isAnonymous && selectedReport.reportedBy && (
            <div>
              <label className="text-sm text-gray-500">Reported By</label>
              <p className="font-medium">
                {selectedReport.reportedBy.firstName} {selectedReport.reportedBy.lastName}
              </p>
              <p className="text-sm text-gray-600">
                Email: {selectedReport.reportedBy.email}
              </p>
              <p className="text-sm text-gray-600">
                Phone: {selectedReport.reportedBy.mobile}
              </p>
            </div>
          )}

          {selectedReport.isAnonymous && (
            <div className="text-gray-500 italic">
              Reported anonymously
            </div>
          )}

          {/* Status Update */}
          <div className="border-t pt-4 mt-4">
            <label className="text-sm text-gray-500 mb-2 block">
              Update Status
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleStatusUpdate(selectedReport._id, "under_review")}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                Under Review
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedReport._id, "approved")}
                className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedReport._id, "rejected")}
                className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedReport._id, "closed")}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                Close
              </button>
          </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// SOS Response Panel - Officer response options for SOS alerts
const SOSResponsePanel = ({ sos, onDispatchTeam, onStatusUpdate, onClose }) => {
  const [selectedResponse, setSelectedResponse] = useState("");
  const [dispatchedTeam, setDispatchedTeam] = useState("");
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  if (!sos) return null;

  const responseOptions = [
    { value: "dispatch_team", label: "🚔 Dispatch Team", color: "bg-blue-600 hover:bg-blue-700" },
    { value: "patrol_vehicle", label: "🚓 Patrol Vehicle", color: "bg-indigo-600 hover:bg-indigo-700" },
    { value: "ambulance", label: "🚑 Ambulance", color: "bg-red-600 hover:bg-red-700" },
    { value: "fire_brigade", label: "🚒 Fire Brigade", color: "bg-orange-600 hover:bg-orange-700" },
    { value: "other", label: "📋 Other", color: "bg-gray-600 hover:bg-gray-700" },
  ];

  const handleDispatch = () => {
    if (selectedResponse) {
      onDispatchTeam(selectedResponse, dispatchedTeam);
    }
  };

  const handleResolved = () => {
    setShowResolutionModal(true);
  };

  const handleConfirmResolved = () => {
    onStatusUpdate("resolved", resolutionNotes);
    setShowResolutionModal(false);
  };

  const handleFalseAlert = () => {
    onStatusUpdate("false_alert", "Marked as false alert");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9998 }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ zIndex: 9999 }}>
        {/* Header */}
        <div className="bg-red-600 text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              🚨 SOS Response Panel
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:bg-red-700 rounded-full p-1"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* SOS Details */}
          <div className="bg-red-50 p-3 rounded-lg mb-4">
            <h4 className="font-semibold text-red-800">{sos.name || "Unknown"}</h4>
            {sos.phoneNumber && (
              <p className="text-sm text-red-700">📞 {sos.phoneNumber}</p>
            )}
            <p className="text-sm text-red-700">📍 {sos.area || "Unknown Area"}, {sos.city}</p>
            <p className="text-xs text-red-600">🕐 {new Date(sos.timestamp).toLocaleString()}</p>
            <p className="text-xs text-red-600">🌐 {sos.latitude?.toFixed(6)}, {sos.longitude?.toFixed(6)}</p>
          </div>

          {/* Current Status */}
          <div className="mb-4">
            <span className="text-sm font-semibold text-gray-600">Current Status: </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              sos.status === "acknowledged" ? "bg-yellow-100 text-yellow-800" :
              sos.status === "team_dispatched" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {sos.status?.replace("_", " ").toUpperCase() || "ACTIVE"}
            </span>
          </div>

          {/* Status Update Buttons */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Update Status:</h4>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onStatusUpdate("responding", "Team is responding")}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-medium"
              >
                🔄 Responding
              </button>
              <button
                onClick={() => onStatusUpdate("team_dispatched", "Team has been dispatched")}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
              >
                🚔 Team Dispatched
              </button>
              <button
                onClick={handleResolved}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
              >
                ✅ Situation Resolved
              </button>
              <button
                onClick={handleFalseAlert}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm font-medium"
              >
                ❌ False Alert
              </button>
            </div>
          </div>
        </div>

        {/* Resolution Modal */}
        {showResolutionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 10000 }}>
            <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
              <h4 className="text-lg font-bold mb-4">Situation Resolved</h4>
              <p className="text-sm text-gray-600 mb-4">
                Please provide resolution notes:
              </p>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how the situation was resolved..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResolutionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmResolved}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

