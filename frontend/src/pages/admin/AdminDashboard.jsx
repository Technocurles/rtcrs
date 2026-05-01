import { useState, useEffect, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import UserManagement from "./components/UserManagement";
import AddAdmin from "./components/AddAdmin";
import SubAdminManagement from "./components/SubAdminManagement";
import CrimeReports from "./components/CrimeReports";
import CitizenManagement from "./components/CitizenManagement";
import GujaratCrimeMap from "./components/GujaratCrimeMap";
import { getAllCrimeReports } from "./services/crimeService";
import { getDashboardStats } from "./services/adminService";
import { RefreshCw, Building2, Clock3, ShieldPlus, Map, AlertTriangle, Users } from "lucide-react";
import { getAllSOSAlerts, updateSOSAlertStatus } from "./services/sosService";
import { initializeSocket, onNewSOSAlert, disconnectSocket } from "../../utils/socket";
import SOSAlerts from "../subAdmin/components/SOSAlerts";
import StatsCards from "./components/StatsCards";
import { matchesPriority } from "../../utils/priorityStyles";
import { playSOSAlertSound, unlockSOSAlertSound } from "../../utils/sosAlertSound";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allReports, setAllReports] = useState([]);
  const [sosAlerts, setSOSAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [preselectedCity, setPreselectedCity] = useState("");

  // City filter for stats and map
  const [selectedCity, setSelectedCity] = useState("all");

  // SOS notification state
  const [showSOSNotification, setShowSOSNotification] = useState(false);
  const [latestSOS, setLatestSOS] = useState(null);

  // Fetch all reports for map view (only for super admin)
  const adminRole = localStorage.getItem("adminRole");
  const adminToken = localStorage.getItem("adminToken");
  const adminName = localStorage.getItem("adminName") || "Super Admin";

  // Prepare SOS alert audio after the first user interaction so browsers allow playback.
  useEffect(() => {
    const unlock = () => unlockSOSAlertSound();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Initialize socket for real-time SOS alerts
  useEffect(() => {
    if (adminToken && adminRole === "super_admin") {
      try {
        initializeSocket(adminToken, "super_admin");

        // Listen for new SOS alerts
        onNewSOSAlert((data) => {
          console.log("New SOS alert received in AdminDashboard:", data);

          if (data.alert) {
            // Add to SOS alerts list in real-time - include status field for proper filtering
            const newAlert = {
              ...data.alert,
              status: data.alert.status || "active"
            };

            setSOSAlerts((prev) => {
              const exists = prev.some(a => a._id === newAlert._id);
              if (exists) return prev;
              console.log("Adding new SOS to state:", newAlert);
              return [newAlert, ...prev];
            });

            // Show notification with sound
            setLatestSOS(newAlert);
            setShowSOSNotification(true);

            playSOSAlertSound();
          }
        });
      } catch (err) {
        console.error("Socket initialization error:", err);
      }
    }

    return () => {
      disconnectSocket();
    };
  }, [adminToken, adminRole]);

  useEffect(() => {
    if (adminRole === "super_admin") {
      // Initial fetch
      fetchAllReports();
      fetchSOSAlerts();
      fetchDashboardStats();
    }
  }, [adminRole]);

  const fetchDashboardStats = async () => {
    try {
      const data = await getDashboardStats();
      setDashboardStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  useEffect(() => {
    if (adminRole === "super_admin" && activeTab === "map") {
      fetchAllReports();
      fetchSOSAlertsForMap(); // Fetch all SOS alerts for map view
    }
  }, [activeTab, adminRole]);

  // Fetch all SOS alerts when SOS tab is clicked
  useEffect(() => {
    if (adminRole === "super_admin" && activeTab === "sos") {
      fetchSOSAlerts(true); // Fetch all alerts for history
    }
  }, [activeTab, adminRole]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const data = await getAllCrimeReports({});
      setAllReports(data.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSOSAlerts = async (fetchAll = false) => {
    try {
      // If fetchAll is true, get all alerts for history view
      // Otherwise, just get active alerts for notifications
      const params = fetchAll ? {} : { status: "active" };
      const data = await getAllSOSAlerts(params);
      setSOSAlerts(data.alerts || []);
    } catch (err) {
      console.error("Failed to fetch SOS alerts:", err);
    }
  };

  // Fetch all SOS alerts for map view (including acknowledged, responding, dispatched, etc.)
  const fetchSOSAlertsForMap = async () => {
    try {
      // Get all alerts except resolved and false_alert for map display
      const data = await getAllSOSAlerts({});
      const allAlerts = data.alerts || [];
      // Filter to show all except resolved and false_alert (same as SubAdmin's CityMap)
      const mapAlerts = allAlerts.filter(alert =>
        alert.status !== "resolved" && alert.status !== "false_alert"
      );
      setSOSAlerts(mapAlerts);
    } catch (err) {
      console.error("Failed to fetch SOS alerts for map:", err);
    }
  };

  // Handle "Received" button click - acknowledge and notify citizen
  const handleSOSReceived = async () => {
    if (latestSOS && latestSOS._id) {
      try {
        // Update SOS status to acknowledged
        await updateSOSAlertStatus(latestSOS._id, { status: "acknowledged" });

        // Update local state
        setSOSAlerts((prev) =>
          prev.map((alert) =>
            alert._id === latestSOS._id ? { ...alert, status: "acknowledged" } : alert
          )
        );
      } catch (err) {
        console.error("Error acknowledging SOS:", err);
      }
    }
    setShowSOSNotification(false);
    setLatestSOS(null);
  };

  // Handle "Dismiss" button click
  const handleSOSDismiss = () => {
    setShowSOSNotification(false);
    setLatestSOS(null);
  };

  const handleViewMore = (report) => {
    setSelectedReport(report);
    setActiveTab("reports");
  };

  // Active SOS count
  const activeSOSCount = sosAlerts.filter(a => a.status === "active").length;

  const dashboardInsights = useMemo(() => {
    const safeReports = allReports || [];
    const safeSOS = sosAlerts || [];

    const pendingCases = safeReports.filter((report) => report.status === "pending").length;
    const underReviewCases = safeReports.filter((report) => report.status === "under_review").length;
    const criticalCases = safeReports.filter((report) => matchesPriority(report.priority, "critical")).length;
    const highCases = safeReports.filter((report) => matchesPriority(report.priority, "high")).length;
    const activeCities = new Set(safeReports.map((report) => report.city).filter(Boolean)).size;

    const topCities = Object.entries(
      safeReports.reduce((acc, report) => {
        const city = report.city || "Unknown";
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([city, count]) => ({ city, count }));

    const recentReports = [...safeReports]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      pendingCases,
      underReviewCases,
      criticalCases,
      highCases,
      activeCities,
      topCities,
      recentReports,
      activeSOS: safeSOS.filter((alert) => alert.status === "active").length,
      acknowledgedSOS: safeSOS.filter((alert) => alert.status === "acknowledged").length,
    };
  }, [allReports, sosAlerts]);

  // Quick action cards data
  const quickActions = [
    {
      id: "addAdmin",
      label: "Add Sub Admin",
      icon: ShieldPlus,
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      onClick: () => setActiveTab("addAdmin"),
    },
    {
      id: "viewMap",
      label: "View Crime Map",
      icon: Map,
      color: "bg-blue-600",
      hoverColor: "hover:bg-emerald-700",
      onClick: () => setActiveTab("map"),
    },
    {
      id: "viewSOS",
      label: "SOS Alerts",
      icon: AlertTriangle,
      color: activeSOSCount > 0 ? "bg-red-600 animate-pulse" : "bg-orange-500",
      hoverColor: activeSOSCount > 0 ? "hover:bg-red-700" : "hover:bg-orange-600",
      onClick: () => setActiveTab("sos"),
      badge: activeSOSCount > 0 ? activeSOSCount : null,
    },
    {
      id: "refresh",
      label: "Refresh Data",
      icon: RefreshCw,
      color: "bg-blue-600",
      hoverColor: "hover:bg-slate-700",
      onClick: () => {
        fetchDashboardStats();
        fetchAllReports();
        fetchSOSAlerts(true);
      },
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sosAlerts={sosAlerts}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ml-0">
        <Topbar sosAlerts={sosAlerts} onSOSClick={() => setActiveTab("sos")} />

        <main className="flex-1 overflow-auto p-4 md:p-6">

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Welcome back, {adminName}
                  </h1>
                  <p className="mt-1 text-gray-500">
                    Here's what's happening across Gujarat today.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                  <Building2 size={16} className="text-blue-500" />
                  <span>Gujarat State Dashboard</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.onClick}
                      disabled={action.id === "refresh" && loading}
                      className={`relative ${action.color} ${action.hoverColor} text-white rounded-xl p-4 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 disabled:opacity-60`}
                    >
                      {action.badge && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-red-600 text-xs font-bold rounded-full flex items-center justify-center shadow">
                          {action.badge}
                        </span>
                      )}
                      <Icon size={24} className={action.id === "refresh" && loading ? "animate-spin" : ""} />
                      <span className="text-sm font-semibold">{action.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Stats Cards Component */}
              <StatsCards
                reports={allReports}
                sosAlerts={sosAlerts}
                selectedCity={selectedCity}
                onSOSClick={() => setActiveTab("sos")}
              />

              {/* Two Column Layout: Top Cities + Recent Reports */}
              <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
                {/* Most Active Cities */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">City Pressure</p>
                      <h3 className="text-xl font-bold text-gray-800 mt-2">Most Active Cities</h3>
                    </div>
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    {dashboardInsights.topCities.length > 0 ? dashboardInsights.topCities.map((cityStat, index) => (
                      <div key={cityStat.city} className="flex items-center gap-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 hover:bg-slate-100 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{cityStat.city}</p>
                          <p className="text-sm text-gray-500">Registered reports</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{cityStat.count}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-xl bg-slate-50 p-6 text-center text-gray-500">
                        No city activity available yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Reports */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Latest Reports</p>
                      <h3 className="text-xl font-bold text-gray-800 mt-2">Recent Intake</h3>
                    </div>
                    <Clock3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    {dashboardInsights.recentReports.length > 0 ? dashboardInsights.recentReports.map((report) => (
                      <button
                        key={report._id}
                        onClick={() => {
                          setSelectedCity(report.city || "all");
                          setActiveTab("reports");
                        }}
                        className="w-full text-left rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-800">{report.title}</p>
                            <p className="text-sm text-gray-500 mt-1">{report.crimeType} in {report.city}</p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    )) : (
                      <div className="rounded-xl bg-slate-50 p-6 text-center text-gray-500">
                        No recent reports available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <UserManagement setActiveTab={setActiveTab} />
          )}
          {activeTab === "addAdmin" && <AddAdmin setActiveTab={setActiveTab} preselectedCity={preselectedCity} />}
          {activeTab === "viewAdmins" && <SubAdminManagement setActiveTab={setActiveTab} setPreselectedCity={setPreselectedCity} />}
          {activeTab === "reports" && <CrimeReports />}
          {activeTab === "citizens" && <CitizenManagement />}

          {/* SOS Alerts Tab - For Super Admin */}
          {activeTab === "sos" && adminRole === "super_admin" && (
            <div>
              <div className="mb-4">
                <h1 className="text-2xl font-bold">SOS Alerts & History</h1>
                <p className="text-gray-500">View and manage all SOS alerts across all cities</p>
              </div>
              <SOSAlerts
                sosAlerts={sosAlerts}
                adminCity={null} // Super admin sees all cities
                onSOSUpdated={(updatedAlerts) => setSOSAlerts(updatedAlerts)}
              />
            </div>
          )}

          {/* Map View - Only for Super Admin */}
          {activeTab === "map" && adminRole === "super_admin" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Gujarat Crime Map</h2>

                {/* City Filter for Map */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-600">Filter by City:</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Gujarat</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Surat">Surat</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Rajkot">Rajkot</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                    <option value="Jamnagar">Jamnagar</option>
                    <option value="Junagadh">Junagadh</option>
                    <option value="Bhavnagar">Bhavnagar</option>
                    <option value="Anand">Anand</option>
                    <option value="Bharuch">Bharuch</option>
                    <option value="Navsari">Navsari</option>
                    <option value="Valsad">Valsad</option>
                    <option value="Patan">Patan</option>
                    <option value="Mehsana">Mehsana</option>
                  </select>
                  {selectedCity !== "all" && (
                    <button
                      onClick={() => setSelectedCity("all")}
                      className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-gray-500">Loading map data...</div>
                </div>
              ) : (
                <GujaratCrimeMap
                  reports={allReports}
                  sosAlerts={sosAlerts}
                  onViewMore={handleViewMore}
                  selectedCity={selectedCity}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* SOS Emergency Notification Modal - Rendered at root level to escape stacking contexts */}
      {showSOSNotification && latestSOS && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 pointer-events-auto"
          style={{ zIndex: 99999, backgroundColor: 'rgba(220, 38, 38, 0.4)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-[fadeIn_0.3s_ease-out] pointer-events-auto"
            style={{ zIndex: 999999 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleSOSDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>

            <div className="text-center">
              {/* Emergency Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse ring-4 ring-red-200">
                <AlertTriangle size={40} className="text-red-600" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-red-600 mb-1">
                SOS ALERT
              </h3>
              <p className="text-sm text-red-500 font-medium mb-4">EMERGENCY RESPONSE REQUIRED</p>

              {/* Alert Details */}
              <div className="bg-red-50 p-4 rounded-xl mb-5 text-left space-y-2 border border-red-100">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-red-500 shrink-0" />
                  <span className="font-semibold text-gray-800">{latestSOS.name || "Unknown"}</span>
                </div>
                {latestSOS.phoneNumber && (
                  <div className="flex items-center gap-2 text-red-700">
                    <span className="text-sm">📞</span>
                    <span className="text-sm">{latestSOS.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-red-700">
                  <Map size={16} className="text-red-500 shrink-0" />
                  <span className="text-sm">{latestSOS.area || "Unknown Area"}, {latestSOS.city}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock3 size={16} className="shrink-0" />
                  <span className="text-sm">{new Date(latestSOS.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSOSDismiss}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-semibold"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleSOSReceived}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                >
                  <RefreshCw size={18} />
                  <span>Received</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

