import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../config/api";

export default function SubAdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [checkingAuth, setCheckingAuth] = useState(true);

// CRITICAL: Clear any existing subadmin sessions on mount to prevent unauthorized access
  // This ensures a clean login state and prevents using old tokens from previous sessions
  useEffect(() => {
    // Clear ALL admin-related storage to ensure clean authentication
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminCity");
    localStorage.removeItem("adminName");
    sessionStorage.removeItem("subAdminToken");
    localStorage.removeItem("subAdminToken");
    localStorage.removeItem("subAdminId");
    
    // Mark checking as complete - do NOT auto-redirect
    // Users must explicitly login with credentials
    setCheckingAuth(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password.trim()) {
      return setError("All fields are required");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return setError("Please enter a valid email");
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API}/api/admin/login`, {
        email: trimmedEmail,
        password: password.trim(),
      });

      if (res.data.role !== "sub_admin") {
        return setError("This account is not a sub-admin account");
      }

      // CRITICAL FIX: Use sessionStorage instead of localStorage for the token
      // sessionStorage is tab-specific (each tab has its own), so when a user logs in
      // in one tab, it won't overwrite the token in other tabs
      sessionStorage.setItem("subAdminToken", res.data.token);
      // Also keep in localStorage for compatibility but sessionStorage is the source of truth
      localStorage.setItem("subAdminToken", res.data.token);
      // CRITICAL FIX: Do NOT store city in localStorage - it causes cross-tab pollution
      // City must only be fetched from the API using the JWT token
      // Each tab will have its own independent city context from the authenticated user
      if (res.data._id) {
        localStorage.setItem("subAdminId", res.data._id);
      }
      
      // Dispatch custom event to force dashboard remount with fresh state
      window.dispatchEvent(new Event('subadmin-logged-in'));
      
      navigate("/subadmin/dashboard");

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">
          Sub Admin Login
        </h2>

        {error && (
          <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter Email"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />
          </div>

          <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
          />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          

        </form>
      </div>
    </div>
  );
}
