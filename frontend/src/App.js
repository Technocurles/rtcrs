import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "./components/PublicLayout";
import Home from "./pages/Home";
import CrimeMap from "./pages/CrimeMap";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPasswordForm from "./pages/ForgotPassword";
import Awareness from "./pages/Awareness";
import AuthForms from "./components/AuthForms";

import Dashboard from "./pages/citizen/Dashboard";
import CompleteProfilePage from "./pages/citizen/CompleteProfilePage";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddAdmin from "./pages/admin/components/AddAdmin";
import "leaflet/dist/leaflet.css";
import AdminAccess from "./pages/AdminAccess";
import SubAdminLogin from "./pages/subAdmin/SubAdminLogin";
import SubAdminDashboard from "./pages/subAdmin/SubAdminDashboard";

// Protected route for CompleteProfile
const CompleteProfileRoute = () => {
  // CRITICAL FIX: Use sessionStorage for tab-specific user data
  const userData = JSON.parse(sessionStorage.getItem("userData") || localStorage.getItem("userData") || "null");
  if (!userData) return <Navigate to="/login" />;
  return userData.profileCompleted ? <Navigate to="/dashboard" /> : <CompleteProfilePage />;
};

function App() {
  // State to force re-render when subadmin logs in (to reset dashboard state)
  const [subAdminLoginKey, setSubAdminLoginKey] = useState(0);
  
  // State to force re-render when citizen logs in
  const [citizenLoginKey, setCitizenLoginKey] = useState(0);

  // Listen for subadmin login events to reset dashboard
  useEffect(() => {
    const handleSubAdminLogin = () => {
      // Increment key to force SubAdminDashboard to remount
      setSubAdminLoginKey(prev => prev + 1);
    };

    // Listen for custom event dispatched after successful login
    window.addEventListener('subadmin-logged-in', handleSubAdminLogin);
    
    return () => {
      window.removeEventListener('subadmin-logged-in', handleSubAdminLogin);
    };
  }, []);

  // Listen for citizen login events to reset dashboard
  useEffect(() => {
    const handleCitizenLogin = () => {
      // Increment key to force Dashboard to remount with fresh state
      setCitizenLoginKey(prev => prev + 1);
    };

    window.addEventListener('citizen-logged-in', handleCitizenLogin);
    
    return () => {
      window.removeEventListener('citizen-logged-in', handleCitizenLogin);
    };
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/crimemap" element={<PublicLayout><CrimeMap /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordForm /></PublicLayout>} />
        <Route path="/auth" element={<PublicLayout><AuthForms /></PublicLayout>} />
        <Route path="/awareness" element={<PublicLayout><Awareness /></PublicLayout>} />

        {/* Citizen Routes */}
        {/* CRITICAL FIX: Use key prop to force remount when citizen logs in - this ensures fresh state */}
        <Route path="/dashboard" element={<Dashboard key={citizenLoginKey} />} />
        <Route path="/complete-profile" element={<CompleteProfileRoute />} />

        {/* Admin Routes */}
        <Route path="/admin-access" element={<AdminAccess />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/add" element={<AddAdmin />} />
        <Route path="/subadmin/login" element={<SubAdminLogin />} />
        {/* Use key prop to force remount when subadmin logs in - this ensures fresh state */}
        <Route path="/subadmin/dashboard" element={<SubAdminDashboard key={subAdminLoginKey} />} />
        
      
      </Routes>
    </Router>
  );
}

export default App;
