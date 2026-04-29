import { useMemo } from "react";
import { 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Shield,
  MapPin
} from "lucide-react";
import { matchesPriority } from "../../../utils/priorityStyles";

export default function StatsCards({ 
  reports = [], 
  sosAlerts = [], 
  selectedCity = "all",
  onSOSClick 
}) {
  // Filter reports by city if selected
  const filteredReports = useMemo(() => {
    if (selectedCity === "all") return reports;
    return reports.filter(report => report.city === selectedCity);
  }, [reports, selectedCity]);

  // Filter SOS alerts by city if selected (for super admin view)
  const filteredSOSAlerts = useMemo(() => {
    if (selectedCity === "all") return sosAlerts;
    return sosAlerts.filter(alert => alert.city === selectedCity);
  }, [sosAlerts, selectedCity]);

  // Calculate active SOS count (only "active" status counts as active emergency)
  const activeSOSCount = useMemo(() => {
    return filteredSOSAlerts.filter(alert => alert.status === "active").length;
  }, [filteredSOSAlerts]);

  // Calculate all non-resolved SOS alerts (for map display)
  const mapSOSCount = useMemo(() => {
    return filteredSOSAlerts.filter(
      alert => alert.status !== "resolved" && alert.status !== "false_alert"
    ).length;
  }, [filteredSOSAlerts]);

  // Calculate report stats
  const reportStats = useMemo(() => {
    return {
      total: filteredReports.length,
      pending: filteredReports.filter(r => r.status === "pending").length,
      underReview: filteredReports.filter(r => r.status === "under_review").length,
      approved: filteredReports.filter(r => r.status === "approved").length,
      rejected: filteredReports.filter(r => r.status === "rejected").length,
      closed: filteredReports.filter(r => r.status === "closed").length,
      critical: filteredReports.filter(r => matchesPriority(r.priority, "critical")).length,
      high: filteredReports.filter(r => matchesPriority(r.priority, "high")).length,
      medium: filteredReports.filter(r => matchesPriority(r.priority, "medium")).length,
      low: filteredReports.filter(r => matchesPriority(r.priority, "low")).length,
    };
  }, [filteredReports]);

  // SOS status breakdown
  const sosStats = useMemo(() => {
    return {
      active: filteredSOSAlerts.filter(a => a.status === "active").length,
      acknowledged: filteredSOSAlerts.filter(a => a.status === "acknowledged").length,
      responding: filteredSOSAlerts.filter(a => a.status === "responding").length,
      teamDispatched: filteredSOSAlerts.filter(a => a.status === "team_dispatched").length,
      resolved: filteredSOSAlerts.filter(a => a.status === "resolved").length,
      falseAlert: filteredSOSAlerts.filter(a => a.status === "false_alert").length,
    };
  }, [filteredSOSAlerts]);

  return (
    <div className="space-y-6">
      {/* SOS Alert Card - Most Prominent */}
      <div className={`rounded-xl shadow-md overflow-hidden ${activeSOSCount > 0 ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gray-200'}`}>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${activeSOSCount > 0 ? 'bg-white/20' : 'bg-gray-300'}`}>
                <AlertTriangle 
                  size={32} 
                  className={activeSOSCount > 0 ? 'text-white animate-pulse' : 'text-gray-500'} 
                />
              </div>
              <div>
                <p className={`text-sm font-medium ${activeSOSCount > 0 ? 'text-red-100' : 'text-gray-500'}`}>
                  Active SOS Alerts
                </p>
                <p className={`text-4xl font-bold ${activeSOSCount > 0 ? 'text-white' : 'text-gray-600'}`}>
                  {activeSOSCount}
                </p>
              </div>
            </div>
            {activeSOSCount > 0 && (
              <button
                onClick={onSOSClick}
                className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <MapPin size={18} />
                View on Map
              </button>
            )}
          </div>
          
          {/* City filter indicator */}
          {selectedCity !== "all" && (
            <div className="mt-3 flex items-center gap-2 text-red-100 text-sm">
              <MapPin size={14} />
              <span>Filtered by: {selectedCity}</span>
            </div>
          )}
        </div>
        
        {/* SOS Quick Stats */}
        {mapSOSCount > 0 && (
          <div className="bg-white/10 px-5 py-3 grid grid-cols-4 gap-2 text-center">
            <div className="text-red-100">
              <p className="text-xs">Active</p>
              <p className="font-bold text-white">{sosStats.active}</p>
            </div>
            <div className="text-yellow-200">
              <p className="text-xs">Acknowledged</p>
              <p className="font-bold text-white">{sosStats.acknowledged}</p>
            </div>
            <div className="text-blue-200">
              <p className="text-xs">Responding</p>
              <p className="font-bold text-white">{sosStats.responding + sosStats.teamDispatched}</p>
            </div>
            <div className="text-green-200">
              <p className="text-xs">Resolved</p>
              <p className="font-bold text-white">{sosStats.resolved}</p>
            </div>
          </div>
        )}
      </div>

      {/* Crime Reports Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Total Reports */}
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-800">{reportStats.total}</p>
            </div>
            <FileText size={24} className="text-blue-500" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{reportStats.pending}</p>
            </div>
            <Clock size={24} className="text-yellow-500" />
          </div>
        </div>

        {/* Under Review */}
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Under Review</p>
              <p className="text-2xl font-bold text-gray-800">{reportStats.underReview}</p>
            </div>
            <Shield size={24} className="text-blue-500" />
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-800">{reportStats.approved}</p>
            </div>
            <CheckCircle size={24} className="text-green-500" />
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-800">{reportStats.rejected}</p>
            </div>
            <XCircle size={24} className="text-red-500" />
          </div>
        </div>
      </div>

      {/* Priority Stats */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Priority Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <div>
              <p className="text-xs text-gray-500">Critical</p>
              <p className="text-lg font-bold text-red-600">{reportStats.critical}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <div>
              <p className="text-xs text-gray-500">High</p>
              <p className="text-lg font-bold text-orange-600">{reportStats.high}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div>
              <p className="text-xs text-gray-500">Medium</p>
              <p className="text-lg font-bold text-yellow-600">{reportStats.medium}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div>
              <p className="text-xs text-gray-500">Low</p>
              <p className="text-lg font-bold text-green-600">{reportStats.low}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

