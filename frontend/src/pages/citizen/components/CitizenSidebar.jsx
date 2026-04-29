import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../utils/logout";

import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Eye,
  LogOut,
  User,
  X,
  Menu,
} from "lucide-react";

export default function CitizenSidebar({ setActiveTab, sidebarOpen, setSidebarOpen }) {
  const [active, setActive] = useState("dashboard");
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "myProfile", label: "My Profile", icon: User },
    { id: "report", label: "Report Crime", icon: FilePlus },
    { id: "myReports", label: "My Reports", icon: FileText },
    { id: "viewCrimes", label: "View Crimes", icon: Eye },
  ];

  const handleLogout = () => {
    logoutUser(navigate);
  };

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
        className="fixed top-3 left-3 z-[60] md:hidden bg-indigo-700 text-white p-2.5 rounded-lg shadow-lg"
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
        className={`fixed md:static h-screen bg-gradient-to-b from-indigo-700 via-blue-700 to-cyan-600 text-white transition-all duration-300 shadow-xl z-50
        ${sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-20 md:translate-x-0 overflow-hidden"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 min-h-[60px]">
          {sidebarOpen && (
            <span className="text-lg md:text-xl font-bold tracking-wide truncate">
              JanRakshak
            </span>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-white/20 p-2 rounded transition hidden md:block"
          >
            {sidebarOpen ? "⬅" : "➡"}
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all rounded-lg mx-2 ${
                  isActive
                    ? "bg-white text-blue-700 font-semibold"
                    : "hover:bg-white/20"
                }`}
              >
                <Icon size={22} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </div>
            );
          })}

          {/* Logout */}
          <div
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-red-500/80 rounded-lg mx-2 mt-6 transition"
          >
            <LogOut size={22} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </div>
        </nav>
      </div>
    </>
  );
}

