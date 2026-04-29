
import { useState, useEffect } from "react";
import axios from "axios";
import { onCrimeStatusUpdate, removeStatusUpdateListener } from "../../../utils/socket";
import { getMySOSAlerts } from "../../admin/services/sosService";
import { getPriorityLabel, getPriorityStyle, normalizePriority } from "../../../utils/priorityStyles";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(true);
  const [error, setError] = useState("");
  const [sosError, setSosError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sosStatusFilter, setSosStatusFilter] = useState("");
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("reports"); // "reports" or "sos"

  // Fetch citizen's reports
  useEffect(() => {
    fetchMyReports();
    fetchMySOSAlerts();

    // Initialize socket for status updates
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      // Listen for status updates
      onCrimeStatusUpdate((data) => {
        setNotification(data);
        
        // Refresh reports to get updated status
        fetchMyReports();
        
        // Auto-dismiss notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      });
    }

    return () => {
      removeStatusUpdateListener();
    };
  }, []);

  // Fetch reports
  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      
      if (!token) {
        setError("Please log in to view your reports");
        setLoading(false);
        return;
      }
      
      const response = await axios.get("/api/crime/my-reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: statusFilter ? { status: statusFilter } : {}
      });
      
      setReports(response.data.reports || []);
      setError("");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "";
      
      if (err.response?.status === 401 || errorMessage.includes("expired") || errorMessage.includes("Invalid token")) {
        // Token is expired or invalid
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setError("Your session has expired. Please log in again.");
        // Optionally redirect to login
        setTimeout(() => {
          window.location.href = "/login?reason=session_expired";
        }, 2000);
      } else if (err.response?.status === 403) {
        setError("You are not authorized to view these reports");
      } else {
        setError(err.response?.data?.message || "Failed to fetch your reports");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch citizen's SOS alerts
  const fetchMySOSAlerts = async () => {
    try {
      setSosLoading(true);
      const response = await getMySOSAlerts();
      setSosAlerts(response.alerts || []);
      setSosError("");
    } catch (err) {
      setSosError(err.message || "Failed to fetch your SOS alerts");
    } finally {
      setSosLoading(false);
    }
  };

  // Handle status filter change
  useEffect(() => {
    fetchMyReports();
  }, [statusFilter]);

  // Filter SOS alerts by status
  const filteredSOSAlerts = sosStatusFilter 
    ? sosAlerts.filter(alert => alert.status === sosStatusFilter)
    : sosAlerts;

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

  // Get SOS status color
  const getSOSStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800";
      case "acknowledged":
        return "bg-blue-100 text-blue-800";
      case "responding":
        return "bg-purple-100 text-purple-800";
      case "team_dispatched":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "false_alert":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="font-bold">Status Update!</div>
          <div className="text-sm">{notification.message}</div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Reports</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === "reports"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("reports")}
        >
          Crime Reports ({reports.length})
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === "sos"
              ? "border-b-2 border-red-600 text-red-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("sos")}
        >
          SOS Alerts ({sosAlerts.length})
        </button>
      </div>

      {/* Error Message */}
      {error && activeTab === "reports" && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {sosError && activeTab === "sos" && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {sosError}
        </div>
      )}

      {/* Crime Reports Tab */}
      {activeTab === "reports" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchMyReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-10">
              <div className="text-gray-500">Loading your reports...</div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-gray-500 mb-4">You haven't submitted any crime reports yet.</div>
              <a
                href="/citizen/report-crime"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Report a Crime
              </a>
            </div>
          ) : (
            /* Reports List */
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {report.description?.substring(0, 100)}...
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Type: {report.crimeType}</span>
                        <span>Location: {report.area}, {report.city}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                          report.priority
                        )}`}
                        style={getPriorityInlineStyle(report.priority)}
                      >
                        {getPriorityLabel(report.priority)}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {report.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Evidence Column - Mini Display */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <label className="text-xs text-gray-500 font-medium">Evidence</label>
                    <div className="mt-1">
                      {/* Debug: Show evidence data structure */}
                      {report.evidence && Array.isArray(report.evidence) && report.evidence.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {/* Show first 3 evidence items */}
                          {report.evidence.slice(0, 3).map((ev, index) => (
                            <div key={index} className="relative group">
                              {ev.fileType === "image" ? (
                                <img
                                  src={ev.fileUrl}
                                  alt={`Evidence ${index + 1}`}
                                  className="w-12 h-12 object-cover rounded cursor-pointer border border-gray-200 hover:border-blue-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReport(report);
                                  }}
                                />
                              ) : ev.fileType === "video" ? (
                                <div 
                                  className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center cursor-pointer border border-purple-200 hover:border-purple-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReport(report);
                                  }}
                                >
                                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                  </svg>
                                </div>
                              ) : (
                                <div 
                                  className="w-12 h-12 bg-green-100 rounded flex items-center justify-center cursor-pointer border border-green-200 hover:border-green-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReport(report);
                                  }}
                                >
                                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              <span className="absolute -bottom-1 -right-1 text-[10px] bg-gray-800 text-white px-1 rounded">
                                {ev.fileType === "image" ? "IMG" : ev.fileType === "video" ? "VID" : "AUD"}
                              </span>
                            </div>
                          ))}
                          {/* Show count if more than 3 */}
                          {report.evidence.length > 3 && (
                            <div 
                              className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReport(report);
                              }}
                            >
                              +{report.evidence.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          {report.evidence === undefined ? "⚠️ Evidence field missing" : 
                           report.evidence === null ? "⚠️ Evidence is null" :
                           report.evidence.length === 0 ? "No evidence uploaded" : 
                           "⚠️ Evidence format unexpected"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* SOS Alerts Tab */}
      {activeTab === "sos" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              {/* SOS Status Filter */}
              <select
                value={sosStatusFilter}
                onChange={(e) => setSosStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="responding">Responding</option>
                <option value="team_dispatched">Team Dispatched</option>
                <option value="resolved">Resolved</option>
                <option value="false_alert">False Alert</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchMySOSAlerts}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Refresh
            </button>
          </div>

          {/* Loading State */}
          {sosLoading ? (
            <div className="text-center py-10">
              <div className="text-gray-500">Loading your SOS alerts...</div>
            </div>
          ) : filteredSOSAlerts.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-gray-500 mb-4">You haven't submitted any SOS alerts yet.</div>
              <p className="text-sm text-gray-600">
                Use the SOS button on your dashboard to send an emergency alert.
              </p>
            </div>
          ) : (
            /* SOS Alerts List */
            <div className="space-y-4">
              {filteredSOSAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-red-500"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">SOS Alert</span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                            alert.priority
                          )}`}
                          style={getPriorityInlineStyle(alert.priority)}
                        >
                          {getPriorityLabel(alert.priority)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Location: {alert.area || "Unknown Area"}, {alert.city}
                      </p>
                      {alert.address && (
                        <p className="text-sm text-gray-500 mt-1">
                          Address: {alert.address}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        {alert.phoneNumber && <span>Phone: {alert.phoneNumber}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getSOSStatusColor(
                          alert.status
                        )}`}
                      >
                        {alert.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedReport.title}</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
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
                  <p className="font-medium capitalize">
                    {selectedReport.status.replace("_", " ")}
                  </p>
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
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-500">Description</label>
                <p className="mt-1">{selectedReport.description}</p>
              </div>

              {/* Evidence */}
              {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                <div>
                  <label className="text-sm text-gray-500">
                    Evidence Submitted ({selectedReport.evidence.length} files)
                  </label>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {selectedReport.evidence.map((ev, index) => (
                      <div key={index} className="relative group">
                        {ev.fileType === "image" ? (
                          <a
                            href={ev.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={ev.fileUrl}
                              alt={`Evidence ${index + 1}`}
                              className="w-20 h-20 object-cover rounded cursor-pointer border border-gray-200 hover:border-blue-400 transition-colors"
                            />
                          </a>
                        ) : ev.fileType === "video" ? (
                          <a
                            href={ev.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <div className="w-20 h-20 bg-purple-100 rounded flex items-center justify-center cursor-pointer border border-purple-200 hover:border-purple-400 transition-colors">
                              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </a>
                        ) : (
                          <a
                            href={ev.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <div className="w-20 h-20 bg-green-100 rounded flex items-center justify-center cursor-pointer border border-green-200 hover:border-green-400 transition-colors">
                              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </a>
                        )}
                        <div className="mt-1 text-xs text-center text-gray-500 capitalize">
                          {ev.fileType}
                        </div>
                        <div className="text-xs text-center text-gray-400">
                          {(ev.fileSize / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anonymous Status */}
              {selectedReport.isAnonymous && (
                <div className="text-gray-500 italic">
                  You submitted this report anonymously
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4 mt-4 text-sm text-gray-500">
                <p>Submitted: {new Date(selectedReport.createdAt).toLocaleString()}</p>
                {selectedReport.updatedAt && (
                  <p>Last Updated: {new Date(selectedReport.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOS Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-red-600">SOS Alert Details</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Alert Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Alert Type</label>
                  <p className="font-medium">{selectedAlert.alertType}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSOSStatusColor(
                      selectedAlert.status
                    )}`}
                  >
                    {selectedAlert.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Priority</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                      selectedAlert.priority
                    )}`}
                    style={getPriorityInlineStyle(selectedAlert.priority)}
                  >
                    {getPriorityLabel(selectedAlert.priority)}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm text-gray-500">Location</label>
                <p className="font-medium">
                  {selectedAlert.area || "Unknown Area"}, {selectedAlert.city}
                </p>
                {selectedAlert.address && (
                  <p className="text-sm text-gray-600">{selectedAlert.address}</p>
                )}
              </div>

              {/* Contact Info */}
              {selectedAlert.phoneNumber && (
                <div>
                  <label className="text-sm text-gray-500">Phone Number</label>
                  <p className="font-medium">{selectedAlert.phoneNumber}</p>
                </div>
              )}

              {/* Officer Response */}
              {selectedAlert.officerResponse && (
                <div>
                  <label className="text-sm text-gray-500">Officer Response</label>
                  <p className="font-medium">{selectedAlert.officerResponse}</p>
                </div>
              )}

              {/* Dispatched Team */}
              {selectedAlert.dispatchedTeam && (
                <div>
                  <label className="text-sm text-gray-500">Dispatched Team</label>
                  <p className="font-medium">{selectedAlert.dispatchedTeam}</p>
                </div>
              )}

              {/* Response Time */}
              {selectedAlert.responseTime && (
                <div>
                  <label className="text-sm text-gray-500">Response Time</label>
                  <p className="font-medium">{selectedAlert.responseTime} minutes</p>
                </div>
              )}

              {/* Resolution Notes */}
              {selectedAlert.resolutionNotes && (
                <div>
                  <label className="text-sm text-gray-500">Resolution Notes</label>
                  <p className="font-medium">{selectedAlert.resolutionNotes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4 mt-4 text-sm text-gray-500">
                <p>Submitted: {new Date(selectedAlert.createdAt).toLocaleString()}</p>
                {selectedAlert.acknowledgedAt && (
                  <p>Acknowledged: {new Date(selectedAlert.acknowledgedAt).toLocaleString()}</p>
                )}
                {selectedAlert.resolvedAt && (
                  <p>Resolved: {new Date(selectedAlert.resolvedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

