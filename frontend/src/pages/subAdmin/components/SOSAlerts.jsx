import { useState, useEffect, useMemo } from "react";
import { 
  Bell, 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  RefreshCw,
  Filter,
  Eye,
  Send
} from "lucide-react";
import { getSOSAlertsByCity, updateSOSAlertStatus } from "../../admin/services/sosService";

export default function SOSAlerts({ sosAlerts: initialAlerts, onSOSUpdated, adminCity }) {
  const [alerts, setAlerts] = useState(initialAlerts || []);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseType, setResponseType] = useState("");
  const [dispatchedTeam, setDispatchedTeam] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Fetch all SOS alerts (without status filter for history)
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getSOSAlertsByCity({});
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error("Error fetching SOS alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAlerts && initialAlerts.length > 0) {
      setAlerts(initialAlerts);
    } else {
      fetchAlerts();
    }
  }, [initialAlerts]);

  // Filter alerts based on status and search
  const filteredAlerts = useMemo(() => {
    let result = alerts;

    // Apply status filter
    if (filter !== "all") {
      result = result.filter(alert => alert.status === filter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(alert => 
        alert.name?.toLowerCase().includes(query) ||
        alert.phoneNumber?.toLowerCase().includes(query) ||
        alert.area?.toLowerCase().includes(query) ||
        alert.city?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [alerts, filter, searchQuery]);

  // Get status counts
  const statusCounts = useMemo(() => {
    return {
      all: alerts.length,
      active: alerts.filter(a => a.status === "active").length,
      acknowledged: alerts.filter(a => a.status === "acknowledged").length,
      responding: alerts.filter(a => a.status === "responding").length,
      team_dispatched: alerts.filter(a => a.status === "team_dispatched").length,
      resolved: alerts.filter(a => a.status === "resolved").length,
      false_alert: alerts.filter(a => a.status === "false_alert").length,
    };
  }, [alerts]);

  // Get status badge color
  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-red-100 text-red-800 border-red-200",
      acknowledged: "bg-yellow-100 text-yellow-800 border-yellow-200",
      responding: "bg-blue-100 text-blue-800 border-blue-200",
      team_dispatched: "bg-indigo-100 text-indigo-800 border-indigo-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      false_alert: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Format status for display
  const formatStatus = (status) => {
    return status?.replace(/_/g, " ").toUpperCase() || "UNKNOWN";
  };

  // Handle acknowledge
  const handleAcknowledge = async (alertId) => {
    try {
      await updateSOSAlertStatus(alertId, { status: "acknowledged" });
      updateLocalAlert(alertId, { status: "acknowledged" });
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  // Handle dispatch team
  const handleDispatch = async () => {
    if (!selectedAlert || !responseType) return;
    
    try {
      await updateSOSAlertStatus(selectedAlert._id, {
        status: "team_dispatched",
        officerResponse: responseType,
        dispatchedTeam: dispatchedTeam
      });
      updateLocalAlert(selectedAlert._id, {
        status: "team_dispatched",
        officerResponse: responseType,
        dispatchedTeam: dispatchedTeam
      });
      setShowResponseModal(false);
      setSelectedAlert(null);
      setResponseType("");
      setDispatchedTeam("");
    } catch (err) {
      console.error("Error dispatching team:", err);
    }
  };

  // Handle resolve
  const handleResolve = async (alertId) => {
    try {
      await updateSOSAlertStatus(alertId, {
        status: "resolved",
        resolutionNotes: resolutionNotes || "Situation resolved"
      });
      updateLocalAlert(alertId, { status: "resolved" });
    } catch (err) {
      console.error("Error resolving alert:", err);
    }
  };

  // Handle false alert
  const handleFalseAlert = async (alertId) => {
    try {
      await updateSOSAlertStatus(alertId, {
        status: "false_alert",
        resolutionNotes: "Marked as false alert"
      });
      updateLocalAlert(alertId, { status: "false_alert" });
    } catch (err) {
      console.error("Error marking as false alert:", err);
    }
  };

  // Update local state
  const updateLocalAlert = (alertId, updates) => {
    setAlerts(prev => prev.map(alert => 
      alert._id === alertId ? { ...alert, ...updates } : alert
    ));
    if (onSOSUpdated) {
      onSOSUpdated(alerts.map(alert => 
        alert._id === alertId ? { ...alert, ...updates } : alert
      ));
    }
  };

  // Filter tabs
  const filterTabs = [
    { id: "all", label: "All", count: statusCounts.all },
    { id: "active", label: "Active", count: statusCounts.active, color: "text-red-600" },
    { id: "acknowledged", label: "Acknowledged", count: statusCounts.acknowledged, color: "text-yellow-600" },
    { id: "responding", label: "Responding", count: statusCounts.responding, color: "text-blue-600" },
    { id: "team_dispatched", label: "Dispatched", count: statusCounts.team_dispatched, color: "text-indigo-600" },
    { id: "resolved", label: "Resolved", count: statusCounts.resolved, color: "text-green-600" },
    { id: "false_alert", label: "False Alert", count: statusCounts.false_alert, color: "text-gray-600" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="text-red-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">SOS Alerts & History</h2>
            {adminCity && (
              <span className="text-sm text-gray-500 ml-2">- {adminCity}</span>
            )}
          </div>
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone, area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filterTabs.map(tab => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} ({tab.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              <span className={`ml-1 ${tab.color || ""}`}>({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="animate-spin mx-auto text-blue-600" size={32} />
            <p className="text-gray-500 mt-2">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="mx-auto text-gray-300" size={48} />
            <p className="text-gray-500 mt-2">No SOS alerts found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert._id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  alert.status === "active" ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Left - Alert Info */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      {alert.status === "active" && (
                        <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
                      )}
                      <h3 className="font-semibold text-lg">
                        {alert.name || "Unknown"}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(alert.status)}`}>
                        {formatStatus(alert.status)}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      {alert.phoneNumber && (
                        <p className="flex items-center gap-2">
                          <Phone size={14} />
                          {alert.phoneNumber}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <MapPin size={14} />
                        {alert.area || "Unknown Area"}, {alert.city}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock size={14} />
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                      {alert.address && (
                        <p className="text-gray-500 text-xs">{alert.address}</p>
                      )}
                    </div>

                    {/* Response Info */}
                    {(alert.officerResponse || alert.dispatchedTeam) && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        {alert.officerResponse && (
                          <p><strong>Response:</strong> {alert.officerResponse.replace(/_/g, " ")}</p>
                        )}
                        {alert.dispatchedTeam && (
                          <p><strong>Team:</strong> {alert.dispatchedTeam}</p>
                        )}
                      </div>
                    )}

                    {/* Resolution Notes */}
                    {alert.resolutionNotes && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                        <p><strong>Notes:</strong> {alert.resolutionNotes}</p>
                      </div>
                    )}

                    {/* Response Time */}
                    {alert.responseTime && (
                      <p className="mt-2 text-xs text-gray-500">
                        Response time: {alert.responseTime} minutes
                      </p>
                    )}
                  </div>

                  {/* Right - Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                    >
                      <Eye size={16} />
                      View
                    </button>

                    {alert.status === "active" && (
                      <button
                        onClick={() => handleAcknowledge(alert._id)}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        <CheckCircle size={16} />
                        Acknowledge
                      </button>
                    )}

                    {alert.status === "acknowledged" && (
                      <button
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowResponseModal(true);
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        <Send size={16} />
                        Dispatch
                      </button>
                    )}

                    {["acknowledged", "responding", "team_dispatched"].includes(alert.status) && (
                      <>
                        <button
                          onClick={() => handleResolve(alert._id)}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          <CheckCircle size={16} />
                          Resolve
                        </button>
                        <button
                          onClick={() => handleFalseAlert(alert._id)}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                        >
                          <XCircle size={16} />
                          False Alert
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && !showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-red-600 text-white p-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  🚨 SOS Alert Details
                </h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-white hover:bg-red-700 rounded-full p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedAlert.status)}`}>
                  {formatStatus(selectedAlert.status)}
                </span>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="font-medium">{selectedAlert.name || "Unknown"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">{selectedAlert.phoneNumber || "N/A"}</p>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm text-gray-500">Location</label>
                <p className="font-medium">
                  {selectedAlert.area}, {selectedAlert.city}
                </p>
                {selectedAlert.address && (
                  <p className="text-sm text-gray-600">{selectedAlert.address}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  📍 {selectedAlert.latitude?.toFixed(6)}, {selectedAlert.longitude?.toFixed(6)}
                </p>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Alert Time</label>
                  <p className="font-medium">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                </div>
                {selectedAlert.acknowledgedAt && (
                  <div>
                    <label className="text-sm text-gray-500">Acknowledged At</label>
                    <p className="font-medium">{new Date(selectedAlert.acknowledgedAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedAlert.resolvedAt && (
                  <div>
                    <label className="text-sm text-gray-500">Resolved At</label>
                    <p className="font-medium">{new Date(selectedAlert.resolvedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Response Info */}
              {(selectedAlert.officerResponse || selectedAlert.dispatchedTeam || selectedAlert.responseTime) && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Response Details</h4>
                  {selectedAlert.officerResponse && (
                    <p><span className="text-blue-600">Type:</span> {selectedAlert.officerResponse.replace(/_/g, " ")}</p>
                  )}
                  {selectedAlert.dispatchedTeam && (
                    <p><span className="text-blue-600">Team:</span> {selectedAlert.dispatchedTeam}</p>
                  )}
                  {selectedAlert.responseTime && (
                    <p><span className="text-blue-600">Response Time:</span> {selectedAlert.responseTime} minutes</p>
                  )}
                </div>
              )}

              {/* Resolution Notes */}
              {selectedAlert.resolutionNotes && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-800">Resolution Notes</h4>
                  <p className="text-green-700">{selectedAlert.resolutionNotes}</p>
                </div>
              )}

              {/* User Info */}
              {selectedAlert.userId && (
                <div>
                  <label className="text-sm text-gray-500">Reported By (User)</label>
                  <p className="font-medium">
                    {selectedAlert.userId.firstName} {selectedAlert.userId.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedAlert.userId.email}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-gray-200 flex flex-wrap gap-2">
              {selectedAlert.status === "active" && (
                <button
                  onClick={() => {
                    handleAcknowledge(selectedAlert._id);
                    setSelectedAlert(null);
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Acknowledge
                </button>
              )}
              {selectedAlert.status === "acknowledged" && (
                <button
                  onClick={() => {
                    setShowResponseModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Dispatch Team
                </button>
              )}
              {["acknowledged", "responding", "team_dispatched"].includes(selectedAlert.status) && (
                <>
                  <button
                    onClick={() => {
                      handleResolve(selectedAlert._id);
                      setSelectedAlert(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => {
                      handleFalseAlert(selectedAlert._id);
                      setSelectedAlert(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                  >
                    False Alert
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedAlert(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Team Modal */}
      {showResponseModal && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-blue-600 text-white p-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  🚔 Dispatch Team
                </h3>
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseType("");
                    setDispatchedTeam("");
                  }}
                  className="text-white hover:bg-blue-700 rounded-full p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Alert Summary */}
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="font-semibold">{selectedAlert.name}</p>
                <p className="text-sm text-red-700">{selectedAlert.area}, {selectedAlert.city}</p>
              </div>

              {/* Response Type Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Select Response Type:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: "dispatch_team", label: "🚔 Dispatch Team", color: "bg-blue-600" },
                    { value: "patrol_vehicle", label: "🚓 Patrol Vehicle", color: "bg-indigo-600" },
                    { value: "ambulance", label: "🚑 Ambulance", color: "bg-red-600" },
                    { value: "fire_brigade", label: "🚒 Fire Brigade", color: "bg-orange-600" },
                    { value: "other", label: "📋 Other", color: "bg-gray-600" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setResponseType(option.value)}
                      className={`px-4 py-3 rounded-lg text-white font-medium transition-colors ${
                        responseType === option.value
                          ? option.color + " ring-2 ring-offset-2 ring-blue-500"
                          : "bg-gray-400 hover:bg-gray-500"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team Details */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Team Details (Optional):
                </label>
                <input
                  type="text"
                  value={dispatchedTeam}
                  onChange={(e) => setDispatchedTeam(e.target.value)}
                  placeholder="Enter vehicle number or team details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseType("");
                  setDispatchedTeam("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatch}
                disabled={!responseType}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

