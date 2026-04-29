
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import CitizenSidebar from "./components/CitizenSidebar";
import CitizenOverview from "./components/CitizenOverview";
import ReportCrime from "./components/ReportCrime";
import MyReports from "./components/MyReports";
import ViewCrimes from "./components/ViewCrimes";
import MyProfile from "./components/MyProfile";
import Settings from "./components/Settings";
import { initializeSocket, onSOSStatusUpdate, disconnectSocket } from "../../utils/socket";
import { createSOSAlert } from "../admin/services/sosService";
import { areaCoordinates } from "../../utils/areaCoordinates";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // SOS status notification state
  const [showSOSStatusNotification, setShowSOSStatusNotification] = useState(false);
  const [sosStatusMessage, setSOSStatusMessage] = useState("");
  
  // SOS Alert State
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  // CRITICAL FIX: Use sessionStorage for tab-specific token to prevent cross-tab pollution
  // sessionStorage is unique per tab - different users can be logged in different tabs
  const citizenToken = sessionStorage.getItem("token") || localStorage.getItem("token");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // CRITICAL FIX: Use sessionStorage for tab-specific token
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:8080/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If profile is incomplete, redirect to CompleteProfile
        if (!res.data.profileCompleted) {
          window.location.href = "/complete-profile"; // first-time users only
          return;
        }

        // Profile complete → show dashboard
        setUser(res.data);
      } catch (error) {
        console.error("Profile fetch error:", error);
        
        // Check for specific error types
        const errorMessage = error.response?.data?.message || error.message || "";
        
        if (error.response?.status === 401 || errorMessage.includes("expired") || errorMessage.includes("Invalid token")) {
          // Token is expired or invalid - clear both sessionStorage and localStorage and redirect to login
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("role");
          sessionStorage.removeItem("userData");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userData");
          window.location.href = "/login?reason=session_expired";
          return;
        }
        
        if (error.response?.status === 404 || errorMessage.includes("User not found")) {
          // User not found - possibly deleted
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("role");
          sessionStorage.removeItem("userData");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userData");
          window.location.href = "/login?reason=user_not_found";
          return;
        }
        
        if (error.response?.status === 403 && errorMessage.includes("blocked")) {
          // Account is blocked
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("role");
          sessionStorage.removeItem("userData");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userData");
          alert("Your account has been blocked. Please contact support.");
          window.location.href = "/login";
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Initialize socket for real-time SOS status updates
  useEffect(() => {
    if (citizenToken && user) {
      try {
        // Pass user ID for proper socket room joining
        const userId = user._id || user.id;
        initializeSocket(citizenToken, "citizen", null, userId);
        
        // Listen for SOS status updates
        onSOSStatusUpdate((data) => {
          console.log("SOS status update received:", data);
          
          if (data.message) {
            setSOSStatusMessage(data.message);
            setShowSOSStatusNotification(true);
            
            // Auto-close after 5 seconds
            setTimeout(() => {
              setShowSOSStatusNotification(false);
            }, 5000);
          }
        });
      } catch (err) {
        console.error("Socket initialization error:", err);
      }
    }

    return () => {
      disconnectSocket();
    };
  }, [citizenToken, user]);

  // Close SOS status notification
  const closeSOSNotification = () => {
    setShowSOSStatusNotification(false);
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
    // Simple reverse geocoding - determines city based on known Gujarat coordinates
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
    let nearestCity = "Ahmedabad"; // Default

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
    // Find the city key in areaCoordinates (handle case differences)
    const cityKey = Object.keys(areaCoordinates).find(
      key => key.toLowerCase() === city.toLowerCase()
    );
    
    if (!cityKey || !areaCoordinates[cityKey]) {
      return ""; // No area data for this city
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

    // Only return area if within reasonable distance (roughly 10km threshold)
    // Using 0.1 degree as threshold (approximately 10km)
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
      // Get current location
      const location = await getCurrentLocation();
      
      // Get city from coordinates
      const city = await getCityFromCoords(location.latitude, location.longitude);
      
      // Get specific area from coordinates
      const area = getAreaFromCoords(location.latitude, location.longitude, city);

      // Prepare SOS data with user info (since citizen is logged in)
      const sosData = {
        latitude: location.latitude,
        longitude: location.longitude,
        city: city,
        area: area, // Include the detected area
        // Include user details since citizen is logged in
        userId: user._id || user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Unknown",
        phoneNumber: user.mobile || "",
      };

      // Send SOS alert
      await createSOSAlert(sosData);

      // Show success screen
      setShowSOSModal(false);
      setShowSuccessScreen(true);

      // Auto-close success screen after 5 seconds
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

  // Add/remove body class for SOS modal
  useEffect(() => {
    if (showSOSModal || showSuccessScreen) {
      document.body.classList.add('sos-modal-open');
    } else {
      document.body.classList.remove('sos-modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('sos-modal-open');
    };
  }, [showSOSModal, showSuccessScreen]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <CitizenOverview user={user} />;
      case "myProfile":
        return <MyProfile />;
      case "report":
        return <ReportCrime />;
      case "myReports":
        return <MyReports />;
      case "viewCrimes":
        return <ViewCrimes />;
      case "settings":
        return <Settings />;
      default:
        return <CitizenOverview user={user} />;
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  // If user is null after loading (e.g., invalid token), show message or redirect
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load user data. Please log in again.</p>
          <button 
            onClick={() => {
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("role");
              sessionStorage.removeItem("userData");
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("userData");
              window.location.href = "/login";
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Global styles for SOS modal */}
      <style>{`
        body.sos-modal-open .leaflet-container {
          z-index: 1 !important;
        }
        body.sos-modal-open .leaflet-pane {
          z-index: 2 !important;
        }
      `}</style>

      {/* SOS Status Notification - Shows when admin acknowledges/responds to SOS */}
      {showSOSStatusNotification && (
        <div 
          className="fixed inset-0 flex items-start justify-center p-4 pointer-events-none"
          style={{ zIndex: 99999 }}
        >
          <div 
            className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl max-w-md w-full pointer-events-auto animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold">SOS Update</p>
                  <p className="text-sm">{sosStatusMessage}</p>
                </div>
              </div>
              <button
                onClick={closeSOSNotification}
                className="text-white hover:text-green-200 text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

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

              {/* User Info - Since citizen is logged in, show their info */}
              <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-left">
                <p className="font-semibold text-blue-800">Your information will be shared:</p>
                <p className="text-blue-600">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-blue-600">{user?.mobile}</p>
              </div>

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
              Authorities have been notified with your location and details.
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
        onClick={handleSOSClick}
        className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-[9998] flex items-center gap-2 animate-pulse"
        style={{
          boxShadow: '0 4px 20px rgba(220, 38, 38, 0.5)'
        }}
      >
        <span className="text-xl">🚨</span>
        <span className="text-lg">SOS</span>
      </button>

      {/* Sidebar */}
      <CitizenSidebar
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col min-h-0 ml-0 md:ml-0">
        {/* Page Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

