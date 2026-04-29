import { useMemo } from "react";
import { getPriorityLabel, getPriorityStyle, matchesPriority } from "../../utils/priorityStyles";

// Crime type icons and colors
const crimeTypeConfig = {
  "Theft": { icon: "💰", color: "bg-amber-100 text-amber-700", borderColor: "border-amber-300" },
  "Robbery": { icon: "🔫", color: "bg-red-100 text-red-700", borderColor: "border-red-300" },
  "Assault": { icon: "👊", color: "bg-orange-100 text-orange-700", borderColor: "border-orange-300" },
  "Burglary": { icon: "🏠", color: "bg-gray-100 text-gray-700", borderColor: "border-gray-300" },
  "Fraud": { icon: "🎭", color: "bg-purple-100 text-purple-700", borderColor: "border-purple-300" },
  "Cyber Crime": { icon: "💻", color: "bg-blue-100 text-blue-700", borderColor: "border-blue-300" },
  "Domestic Violence": { icon: "🏠", color: "bg-pink-100 text-pink-700", borderColor: "border-pink-300" },
  "Child Abuse": { icon: "👶", color: "bg-rose-100 text-rose-700", borderColor: "border-rose-300" },
  "Molestation": { icon: "🚫", color: "bg-red-100 text-red-700", borderColor: "border-red-300" },
  "Rape": { icon: "🚫", color: "bg-red-100 text-red-700", borderColor: "border-red-300" },
  "Murder": { icon: "🔪", color: "bg-red-200 text-red-800", borderColor: "border-red-400" },
  "Kidnapping": { icon: "⛓️", color: "bg-indigo-100 text-indigo-700", borderColor: "border-indigo-300" },
  "Accident": { icon: "🚗", color: "bg-slate-100 text-slate-700", borderColor: "border-slate-300" },
  "Missing Person": { icon: "🔍", color: "bg-yellow-100 text-yellow-700", borderColor: "border-yellow-300" },
  "Default": { icon: "⚠️", color: "bg-slate-100 text-slate-700", borderColor: "border-slate-300" }
};

// Get config for crime type
const getCrimeTypeConfig = (crimeType) => {
  return crimeTypeConfig[crimeType] || crimeTypeConfig["Default"];
};

// Priority badge component
const PriorityBadge = ({ priority }) => {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityStyle(priority).badgeSolid}`}>
      {getPriorityLabel(priority)}
    </span>
  );
};

export default function CrimeStatistics({ reports = [] }) {
  // Calculate statistics by city
  const cityStats = useMemo(() => {
    const stats = {};
    
    reports.forEach(report => {
      const city = report.city || "Unknown";
      if (!stats[city]) {
        stats[city] = {
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          byType: {}
        };
      }
      
      stats[city].total++;
      if (matchesPriority(report.priority, "critical")) stats[city].critical++;
      else if (matchesPriority(report.priority, "high")) stats[city].high++;
      else if (matchesPriority(report.priority, "medium")) stats[city].medium++;
      else if (matchesPriority(report.priority, "low")) stats[city].low++;
      
      const crimeType = report.crimeType || "Other";
      if (!stats[city].byType[crimeType]) {
        stats[city].byType[crimeType] = 0;
      }
      stats[city].byType[crimeType]++;
    });
    
    return Object.entries(stats)
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [reports]);
  
  // Overall statistics
  const overallStats = useMemo(() => {
    const stats = {
      total: reports.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      byType: {}
    };
    
    reports.forEach(report => {
      if (matchesPriority(report.priority, "critical")) stats.critical++;
      else if (matchesPriority(report.priority, "high")) stats.high++;
      else if (matchesPriority(report.priority, "medium")) stats.medium++;
      else if (matchesPriority(report.priority, "low")) stats.low++;
      
      const crimeType = report.crimeType || "Other";
      if (!stats.byType[crimeType]) {
        stats.byType[crimeType] = 0;
      }
      stats.byType[crimeType]++;
    });
    
    return stats;
  }, [reports]);
  
  // Get top crime types
  const topCrimeTypes = useMemo(() => {
    return Object.entries(overallStats.byType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [overallStats]);
  
  // Get most affected city
  const mostAffectedCity = cityStats[0]?.city || "N/A";
  
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Crime Statistics</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📈</div>
          <p>No crime data available yet</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📊</span> Crime Statistics - Gujarat
        </h2>
        <p className="text-blue-100 text-sm mt-1">Registered crimes across different regions</p>
      </div>
      
      {/* Overall Summary */}
      <div className="p-4 border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{overallStats.total}</div>
            <div className="text-xs text-gray-500">Total Crimes</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{overallStats.critical}</div>
            <div className="text-xs text-red-500">Critical</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{overallStats.high}</div>
            <div className="text-xs text-orange-500">High</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{overallStats.medium}</div>
            <div className="text-xs text-yellow-500">Medium</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{overallStats.low}</div>
            <div className="text-xs text-green-500">Low</div>
          </div>
        </div>
      </div>
      
      {/* Top Crime Types */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>🔥</span> Most Common Crimes
        </h3>
        <div className="space-y-2">
          {topCrimeTypes.map(({ type, count }, index) => {
            const config = getCrimeTypeConfig(type);
            const percentage = ((count / overallStats.total) * 100).toFixed(1);
            return (
              <div key={type} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                <div className={`flex-1 p-2 rounded-lg ${config.color} border ${config.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{config.icon} {type}</span>
                    <span className="text-xs font-bold">{count} ({percentage}%)</span>
                  </div>
                  <div className="mt-1 bg-white bg-opacity-50 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${config.color.replace('bg-', 'bg-').replace('100', '400')}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* City-wise Breakdown */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>🗺️</span> Region-wise Analysis
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {cityStats.slice(0, 10).map((cityData) => {
            const percentage = ((cityData.total / overallStats.total) * 100).toFixed(1);
            return (
              <div 
                key={cityData.city} 
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span className="font-semibold text-gray-800">{cityData.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority="critical" />
                    <span className="text-sm font-bold text-gray-700">{cityData.total}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                  <div className="text-center">
                    <div className="font-bold text-red-600">{cityData.critical}</div>
                    <div className="text-gray-500">Critical</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-orange-600">{cityData.high}</div>
                    <div className="text-gray-500">High</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-yellow-600">{cityData.medium}</div>
                    <div className="text-gray-500">Medium</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">{cityData.low}</div>
                    <div className="text-gray-500">Low</div>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">{percentage}% of total</div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 p-3 text-center">
        <p className="text-xs text-gray-500">
          🔴 High Priority: {overallStats.critical + overallStats.high} cases require immediate attention
        </p>
      </div>
    </div>
  );
}

