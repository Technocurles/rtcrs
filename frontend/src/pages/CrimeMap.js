import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HomeCrimeMap from "./components/HomeCrimeMap";
import CrimeStatistics from "./components/CrimeStatistics";
import { getPublicCrimeReports } from "./admin/services/crimeService";

function CrimeMap() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCrimeData = async () => {
      try {
        setLoading(true);
        const data = await getPublicCrimeReports();
        if (data.success) {
          setReports(data.reports || []);
        }
      } catch (err) {
        console.error("Error fetching crime data:", err);
        setError("Failed to load crime data");
      } finally {
        setLoading(false);
      }
    };

    fetchCrimeData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            🗺️ Gujarat Crime Map & Statistics
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Real-time visualization of registered crimes across Gujarat.
            View crime statistics and hotspot areas to stay informed about public safety.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 md:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-blue-600 mx-auto mb-4 md:mb-6"></div>
              <p className="text-lg md:text-2xl font-semibold text-gray-600">Loading crime data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 md:py-20">
            <div className="text-5xl md:text-6xl mb-6">⚠️</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{error}</h2>
            <p className="text-gray-600">Please try refreshing the page.</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 md:py-20 bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl max-w-4xl mx-auto p-6 md:p-12">
            <div className="text-6xl md:text-8xl mb-8">🛡️</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              No Crime Data Available
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              There are no approved crime reports to display yet.
              This is a positive sign for the region's safety!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Map Section */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-8 h-[50vh] md:h-[60vh] lg:h-[70vh]">
              <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-3 md:mb-6 flex items-center gap-2 md:gap-3">
                <span className="text-2xl md:text-3xl">🗺️</span>
                Interactive Crime Map
              </h3>
              <HomeCrimeMap reports={reports} />
            </div>

            {/* Statistics Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-8">
              <CrimeStatistics reports={reports} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CrimeMap;

