import { useState, useEffect } from "react";
import { Bell, Calendar, ShieldCheck, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar({ sosAlerts = [], onSOSClick }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const adminRole = localStorage.getItem("adminRole") || "super_admin";
  const adminName = localStorage.getItem("adminName") || "Super Admin";

  const activeSOSCount = sosAlerts.filter(a => a.status === "active").length;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminCity");
    localStorage.removeItem("adminName");
    navigate("/");
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Date & Time */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-gray-500">
            <Calendar size={18} />
            <span className="text-sm font-medium">{formatDate(currentTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-600 font-mono text-sm font-semibold bg-blue-50 px-3 py-1 rounded-lg">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* SOS Alert Bell */}
          <button
            onClick={onSOSClick}
            className={`relative p-2 rounded-lg transition-colors ${
              activeSOSCount > 0
                ? "bg-red-50 text-red-600 hover:bg-red-100 animate-pulse"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Bell size={20} />
            {activeSOSCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {activeSOSCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                <User size={18} />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{adminName}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-green-500" />
                  {adminRole === "super_admin" ? "Super Admin" : "Admin"}
                </p>
              </div>
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{adminName}</p>
                    <p className="text-xs text-gray-500">{adminRole === "super_admin" ? "Super Administrator" : "Administrator"}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

