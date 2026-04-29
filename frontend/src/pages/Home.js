
import { useState, useEffect } from "react";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import RegisterGuideSection from "../components/RegisterGuideSection";
import HowJanRakshakWorks from "../components/HowJanRakshakWorks";

import { createSOSAlert } from "./admin/services/sosService";
import { areaCoordinates } from "../utils/areaCoordinates";

function Home() {
  // Removed unused state vars to fix eslint
  // const [reports, setReports] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  
  // SOS State
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("token");
  
  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user;
    } catch (e) {
      return null;
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Get city from coordinates (reverse geocoding - simplified)
  const getCityFromCoords = async (lat, lng) => {
    const gujaratCities = {
      Ahmedabad: { lat: 23.0225, lng: 72.5714 },
      Surat: { lat: 21.1702, lng: 72.8311 },
      Vadodara: { lat: 22.3072, lng: 73.1812 },
      Rajkot: { lat: 22.3039, lng: 70.8022 },
      Gandhinagar: { lat: 23.2156, lng: 72.6369 },
      Jamnagar: { lat: 22.4707, lng: 70.0692 },
      Bhavnagar: { lat: 21.7645, lng: 72.1519 },
      Junagadh: { lat: 21.5222, lng: 70.4579 },
      Anand: { lat: 22.5645, lng: 72.9289 },
      Navsari: { lat: 20.9467, lng: 72.9520 },
      Valsad: { lat: 20.5992, lng: 72.9342 },
      Bharuch: { lat: 21.7051, lng: 72.9959 },
      Patan: { lat: 23.8490, lng: 72.1266 },
      Mehsana: { lat: 23.5880, lng: 72.3693 },
      Surendranagar: { lat: 22.7271, lng: 71.6480 },
      Morbi: { lat: 22.8173, lng: 70.8377 },
      Narmada: { lat: 21.8763, lng: 73.5020 },
      Tapi: { lat: 21.1276, lng: 73.3890 },
      Dang: { lat: 20.7570, lng: 73.6866 },
      Sabarkantha: { lat: 23.5981, lng: 73.0024 },
      Aravalli: { lat: 23.6047, lng: 73.2980 },
      Banaskantha: { lat: 24.1725, lng: 72.4380 },
      "Chhota Udaipur": { lat: 22.3042, lng: 74.0150 },
      Dahod: { lat: 22.8358, lng: 74.2550 },
      Mahisagar: { lat: 23.1460, lng: 73.6190 },
      Kheda: { lat: 22.7507, lng: 72.6850 },
      Amreli: { lat: 21.6032, lng: 71.2221 },
      Botad: { lat: 22.1696, lng: 71.6667 },
      DevbhumiDwarka: { lat: 22.2442, lng: 68.9685 },
      GirSomnath: { lat: 20.9120, lng: 70.3670 },
      Kutch: { lat: 23.7337, lng: 69.8597 },
      Porbandar: { lat: 21.6417, lng: 69.6293 },
    };

    let minDistance = Infinity;
    let nearestCity = "Ahmedabad";

    Object.entries(gujaratCities).forEach(([city, coords]) => {
      const distance = Math.sqrt(
        Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    });

    return nearestCity.replace(/([A-Z])/g, ' $1').trim();
  };

  // Get specific area from coordinates based on detected city
  const getAreaFromCoords = (lat, lng, city) => {
    const cityKey = Object.keys(areaCoordinates).find(
      key => key.toLowerCase() === city.toLowerCase()
    );
    
    if (!cityKey || !areaCoordinates[cityKey]) {
      return "";
    }

    const cityAreas = areaCoordinates[cityKey];
    let minDistance = Infinity;
    let nearestArea = "";

    cityAreas.forEach((area) => {
      const distance = Math.sqrt(
        Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestArea = area.name;
      }
    });

    return minDistance < 0.1 ? nearestArea : "";
  };

  // Handle SOS button click - show confirmation modal
  const handleSOSClick = () => {
    setShowSOSModal(true);
    setLocationError(null);
  };

  // Handle SOS confirmation
  const handleSOSConfirm = async () => {
    setSosLoading(true);
    setLocationError(null);

    try {
      const location = await getCurrentLocation();
      const city = await getCityFromCoords(location.latitude, location.longitude);
      const area = getAreaFromCoords(location.latitude, location.longitude, city);
      const user = getUserInfo();

      const sosData = {
        latitude: location.latitude,
        longitude: location.longitude,
        city: city,
        area: area,
        ...(isLoggedIn && user && {
          userId: user._id || user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Unknown",
          phoneNumber: user.mobile || "",
        }),
        ...(!isLoggedIn && {
          name: "Unknown",
          phoneNumber: "",
        }),
      };

      await createSOSAlert(sosData);
      setShowSOSModal(false);
      setShowSuccessScreen(true);

      setTimeout(() => {
        setShowSuccessScreen(false);
      }, 5000);

    } catch (error) {
      console.error("SOS Error:", error);
      if (error.code === 1) {
        setLocationError("Location permission denied. Please enable location access.");
      } else if (error.code === 2) {
        setLocationError("Location unavailable. Please try again.");
      } else if (error.code === 3) {
        setLocationError("Location request timed out. Please try again.");
      } else {
        setLocationError(error.message || "Failed to send SOS alert");
      }
    } finally {
      setSosLoading(false);
    }
  };

  // Cancel SOS
  const handleSOSCancel = () => {
    setShowSOSModal(false);
    setLocationError(null);
  };

  // Add/remove body class for SOS modal to lower Leaflet z-index
  useEffect(() => {
    if (showSOSModal || showSuccessScreen) {
      document.body.classList.add('sos-modal-open');
    } else {
      document.body.classList.remove('sos-modal-open');
    }
    
    return () => {
      document.body.classList.remove('sos-modal-open');
    };
  }, [showSOSModal, showSuccessScreen]);

  

  return (
    <div className="relative bg-gray-50">
      <HeroSection />
      <FeaturesSection />
      <RegisterGuideSection />
      <HowJanRakshakWorks />

      {/* Global styles for SOS modal - forces Leaflet to be behind modal */}
      <style>{`
        body.sos-modal-open .leaflet-container {
          z-index: 1 !important;
        }
        body.sos-modal-open .leaflet-pane {
          z-index: 2 !important;
        }
        body.sos-modal-open .leaflet-marker-pane {
          z-index: 3 !important;
        }
        body.sos-modal-open .leaflet-popup-pane {
          z-index: 4 !important;
        }
        body.sos-modal-open .leaflet-control {
          z-index: 5 !important;
        }
        body.sos-modal-open .leaflet-top,
        body.sos-modal-open .leaflet-bottom {
          z-index: 5 !important;
        }
        .leaflet-container {
          z-index: 1 !important;
        }
      `}</style>

      {/* SOS Confirmation Modal */}
      {showSOSModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ 
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)'
          }}
          onClick={handleSOSCancel}
        >
          {/* Modal Container */}
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in"
            style={{ position: 'relative', zIndex: 999999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚨</span>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Send SOS Alert?
              </h3>
              
              {/* Message */}
              <p className="text-gray-600 mb-4">
                This will immediately alert authorities with your current location.
              </p>

              {/* Location Status */}
              {locationError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                  {locationError}
                </div>
              )}

              {/* User Info */}
              {isLoggedIn && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-left">
                  <p className="font-semibold text-blue-800">Your information will be shared:</p>
                  <p className="text-blue-600">
                    {getUserInfo()?.firstName} {getUserInfo()?.lastName}
                  </p>
                  <p className="text-blue-600">{getUserInfo()?.mobile}</p>
                </div>
              )}

              {!isLoggedIn && (
                <div className="bg-yellow-50 p-3 rounded-lg mb-4 text-sm">
                  <p className="font-semibold text-yellow-800">You are not logged in</p>
                  <p className="text-yellow-600">
                    Only your location and timestamp will be shared.
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSOSCancel}
                  disabled={sosLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSOSConfirm}
                  disabled={sosLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sosLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>🚨</span>
                      <span>Send SOS</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOS Success Screen */}
      {showSuccessScreen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ 
            zIndex: 99999,
            backgroundColor: 'rgba(34, 197, 94, 0.9)'
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in"
            style={{ position: 'relative', zIndex: 999999 }}
          >
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              SOS Alert Sent Successfully
            </h3>
            
            {/* Message */}
            <p className="text-gray-600 mb-4">
              Authorities have been notified.
            </p>

            {/* Auto-close notice */}
            <p className="text-sm text-gray-500">
              This window will close automatically...
            </p>
          </div>
        </div>
      )}

      {/* SOS Emergency Button - Fixed at bottom right */}
      <button
        id="sos-floating-button"
        onClick={handleSOSClick}
        className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-[9998] flex items-center gap-2 animate-pulse"
        style={{
          boxShadow: '0 4px 20px rgba(220, 38, 38, 0.5)'
        }}
      >

        <span className="text-xl">🚨</span>
        <span className="text-lg">SOS</span>
      </button>

    </div>
  );
}

export default Home;

