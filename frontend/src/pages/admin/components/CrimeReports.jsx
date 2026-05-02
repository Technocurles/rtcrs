import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAllCrimeReports,
  getReportsByCity,
  getAllCities,
  updateCrimeStatus,
} from "../services/crimeService";
import { initializeSocket, onNewCrimeReport, disconnectSocket } from "../../../utils/socket";
import CityMap from "../../subAdmin/components/CityMap";
import { getPriorityLabel, getPriorityStyle, matchesPriority, normalizePriority } from "../../../utils/priorityStyles";

export default function CrimeReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [cities, setCities] = useState([]);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("table"); // "table" or "map"

  // Get admin info from localStorage
  const adminRole = localStorage.getItem("adminRole");
  const adminToken = localStorage.getItem("adminToken");

  // Fetch cities for super admin
  useEffect(() => {
    if (adminRole === "super_admin") {
      fetchCities();
    }
  }, [adminRole]);

  const fetchCities = async () => {
    try {
      const data = await getAllCities();
      setCities(data.cities || []);
    } catch (err) {
      console.error("Failed to fetch cities:", err);
    }
  };

// Initialize socket and fetch reports
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchReports();

    // Initialize socket connection for real-time notifications
    if (adminToken && adminRole) {
      try {
        initializeSocket(adminToken, adminRole, cityFilter);

        // Listen for new crime reports
        onNewCrimeReport((data) => {
          console.log("New crime report received:", data);
          setNotification(data);
          
          // Add new report to the list
          setReports((prev) => [data.data, ...prev]);
          
          // Auto-dismiss notification after 5 seconds
          setTimeout(() => setNotification(null), 5000);
        });
      } catch (err) {
        console.error("Socket initialization error:", err);
      }
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  // Fetch reports based on role and filters
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      let data;
      
      if (adminRole === "super_admin") {
        data = await getAllCrimeReports({ status: statusFilter, city: cityFilter });
      } else {
        data = await getReportsByCity({ status: statusFilter });
      }
      
      setReports(data.reports || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      
      // Check for token expiration
      if (err.response?.status === 401 || err.message?.includes("Invalid or expired token")) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRole");
        window.location.href = "/admin/login";
        return;
      }
      
      setError(err.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  // Handle status filter change
  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  // Handle city filter change (for super admin)
  useEffect(() => {
    if (adminRole === "super_admin") {
      fetchReports();
    }
  }, [cityFilter]);

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

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === "pending").length,
      underReview: reports.filter(r => r.status === "under_review").length,
      approved: reports.filter(r => r.status === "approved").length,
      rejected: reports.filter(r => r.status === "rejected").length,
      closed: reports.filter(r => r.status === "closed").length,
    };
  }, [reports]);

  // Calculate priority stats
  const priorityStats = useMemo(() => {
    return {
      critical: reports.filter(r => matchesPriority(r.priority, "critical")).length,
      high: reports.filter(r => matchesPriority(r.priority, "high")).length,
      medium: reports.filter(r => matchesPriority(r.priority, "medium")).length,
      low: reports.filter(r => matchesPriority(r.priority, "low")).length,
    };
  }, [reports]);

  // Get status color
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

  // Get priority color
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

// Handle "View More" from map popup
  const handleViewMore = useCallback((report) => {
    setSelectedReport(report);
    setActiveTab("table");
  }, []);

  return (
    <div className="p-6">
      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="font-bold">New Crime Report!</div>
          <div className="text-sm">{notification.message}</div>
        </div>
      )}

      {/* Header with Tabs and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Crime Reports</h2>
          
          <div className="flex gap-2">
            {/* View Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("table")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "table"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                📋 Table View
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "map"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                🗺️ Map View
              </button>
            </div>

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

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          {/* City Filter - Only for Super Admin */}
          {adminRole === "super_admin" && (
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-600 text-sm">Total</h3>
          <p className="text-2xl font-bold mt-2 text-blue-600">
            {loading ? "..." : stats.total}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-600 text-sm">Pending</h3>
          <p className="text-2xl font-bold mt-2 text-yellow-500">
            {loading ? "..." : stats.pending}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-600 text-sm">Under Review</h3>
          <p className="text-2xl font-bold mt-2 text-blue-500">
            {loading ? "..." : stats.underReview}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-600 text-sm">Approved</h3>
          <p className="text-2xl font-bold mt-2 text-green-500">
            {loading ? "..." : stats.approved}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-600 text-sm">Rejected</h3>
          <p className="text-2xl font-bold mt-2 text-red-500">
            {loading ? "..." : stats.rejected}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-600 text-sm">Closed</h3>
          <p className="text-2xl font-bold mt-2 text-gray-500">
            {loading ? "..." : stats.closed}
          </p>
        </div>

        {/* Priority Stats - Combined */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-600 text-sm mb-2">Priority</h3>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-red-600">Critical:</span>
              <span className="font-bold">{priorityStats.critical}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-500">High:</span>
              <span className="font-bold">{priorityStats.high}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-500">Medium:</span>
              <span className="font-bold">{priorityStats.medium}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-500">Low:</span>
              <span className="font-bold">{priorityStats.low}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table View */}
      {activeTab === "table" && (
        <>
          {loading ? (
            <div className="text-center py-10">
              <div className="text-gray-500">Loading reports...</div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-gray-500">No crime reports found</div>
            </div>
          ) : (
            /* Reports Table - Responsive scroll on mobile */
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Evidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
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
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.description?.substring(0, 50)}...
                          </div>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.crimeType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.city}, {report.area}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityColor(
                            report.priority
                          )}`}
                          style={getPriorityInlineStyle(report.priority)}
                        >
                          {getPriorityLabel(report.priority)}
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

      {/* Map View */}
      {activeTab === "map" && (
        <div className="bg-white rounded-lg shadow p-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-500">Loading map data...</div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-gray-500">No crime reports to display on map</div>
            </div>
          ) : (
            <>
              {/* Map Header */}
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    🗺️ Crime Map - {cityFilter || "All Gujarat"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {reports.length} crime reports
                  </p>
                </div>
                
                {/* Priority Stats for Map */}
                <div className="flex gap-4 text-sm">
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
              
              {/* Map Component - For Super Admin, show all Gujarat or filtered city */}
              {adminRole === "super_admin" ? (
                cityFilter ? (
                  <CityMap 
                    city={cityFilter}
                    reports={reports}
                    onViewMore={handleViewMore}
                  />
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 mb-2">Please select a city to view the map</p>
                    <p className="text-sm text-gray-400">Use the city filter above to select a specific city</p>
                  </div>
                )
              ) : (
                <CityMap 
                  city={localStorage.getItem("adminCity")}
                  reports={reports}
                  onViewMore={handleViewMore}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedReport.title}</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
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
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                      selectedReport.priority
                    )}`}
                    style={getPriorityInlineStyle(selectedReport.priority)}
                  >
                    {getPriorityLabel(selectedReport.priority)}
                  </span>
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
      )}
    </div>
  );
}

