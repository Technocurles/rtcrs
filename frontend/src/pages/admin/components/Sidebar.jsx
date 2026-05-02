
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Map,
  AlertTriangle,
  Bell,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function Sidebar({ setActiveTab, sidebarOpen, setSidebarOpen, sosAlerts = [] }) {
  const [active, setActive] = useState("dashboard");
  const navigate = useNavigate();

  // Get admin role and city from localStorage
  const adminRole = localStorage.getItem("adminRole") || "";
  const adminCity = localStorage.getItem("adminCity") || "";

  // Determine sidebar title based on role
  const getSidebarTitle = () => {
    if (adminRole === "super_admin") {
      return "Super Admin";
    }
    return adminCity ? `Admin ${adminCity}` : "Admin";
  };

// Calculate active SOS count
  const activeSOSCount = sosAlerts ? sosAlerts.filter(a => a.status === "active").length : 0;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminCity");
    navigate("/");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "map", label: "Crime Map", icon: Map },
    { id: "sos", label: "SOS Alerts", icon: Bell, isSOS: true },
    { id: "users", label: "User Management", icon: Users },
    ...(adminRole === "super_admin" ? [{ id: "citizens", label: "Citizen Management", icon: UserCog }] : []),
    { id: "reports", label: "Crime Reports", icon: FileText },
  ];

  // Close sidebar when clicking a menu item on mobile
  const handleMenuClick = (id) => {
    setActive(id);
    setActiveTab(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Hamburger Toggle - Fixed top left */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-[60] md:hidden bg-gray-900 text-white p-2.5 rounded-lg shadow-lg"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static h-screen bg-gradient-to-b 
        from-gray-900 via-gray-800 to-gray-700 text-white 
        transition-all duration-300 shadow-xl flex flex-col z-50
        ${sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-20 md:translate-x-0 overflow-hidden"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 min-h-[60px]">
          {sidebarOpen && (
            <span className="text-lg md:text-xl font-bold tracking-wide truncate">
              {getSidebarTitle()}
            </span>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-white/20 p-2 rounded transition hidden md:block"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* SOS Alert Badge - Show when sidebar is open */}
        {sidebarOpen && activeSOSCount > 0 && (
          <div className="mx-2 mt-4 bg-red-600/90 rounded-lg p-3 flex items-center gap-3 animate-pulse shrink-0">
            <AlertTriangle size={24} className="text-white shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-white">{activeSOSCount} Active SOS</p>
              <p className="text-xs text-white/80">Emergency alerts</p>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all rounded-lg mx-2 ${
                  isActive
                    ? "bg-white text-gray-900 font-semibold"
                    : "hover:bg-white/20"
                }`}
              >
                <Icon size={22} className="shrink-0" />
                {sidebarOpen && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{item.label}</span>
                    {/* Show SOS badge on Map menu item */}
                    {item.id === "map" && activeSOSCount > 0 && (
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {activeSOSCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Logout */}
          <div
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 cursor-pointer 
                       hover:bg-red-500/80 transition-all mx-2 mt-6 rounded-lg"
          >
            <LogOut size={22} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </div>
        </nav>

        {/* Mini Profile Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/10 mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                {adminRole === "super_admin" ? "SA" : "A"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {adminRole === "super_admin" ? "Super Admin" : adminCity ? `Admin ${adminCity}` : "Admin"}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {adminRole === "super_admin" ? "Gujarat State" : adminCity || "Unknown City"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

