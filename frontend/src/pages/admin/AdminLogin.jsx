import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../../config/api";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // CRITICAL: Clear any existing admin sessions on mount to prevent unauthorized access
  // This ensures a clean login state and prevents using old tokens from previous sessions
  useEffect(() => {
    // Clear all admin-related storage to ensure clean authentication
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminCity");
    localStorage.removeItem("adminName");
    sessionStorage.removeItem("subAdminToken");
    localStorage.removeItem("subAdminToken");
    localStorage.removeItem("subAdminId");
  }, []);

  // Real-time validation for Super Admin
  useEffect(() => {
    const emailError = email && !/^\S+@\S+\.\S+$/.test(email)
      ? "Invalid email format"
      : "";
    const passwordError = password && password.length < 6
      ? "Password must be at least 6 characters"
      : "";
    setErrors({ email: emailError, password: passwordError });
  }, [email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitError("");

    // Validate before submit for Super Admin
    if (!email) return setErrors((prev) => ({ ...prev, email: "Email is required" }));
    if (!password) return setErrors((prev) => ({ ...prev, password: "Password is required" }));
    if (errors.email || errors.password) return; // don't submit if there are errors

    setLoading(true);

try {
      // Hardcoded for super admin login
      const loginRole = "super_admin";
      const res = await axios.post(
        `${API}/api/admin/login`,
        { email, password, role: loginRole }
      );

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminRole", res.data.role);
      localStorage.setItem("adminCity", res.data.city);

      // Redirect to Admin Dashboard
      navigate("/admin/dashboard");
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
          <p className="text-sm text-gray-500 mt-1">Authorized access only</p>
        </div>

        {submitError && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4">
            {submitError}
          </div>
        )}

        <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onInput={(e) => e.target.value = e.target.value.toLowerCase()}
              autoComplete="off"
              className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-orange-400"
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onInput={(e) => e.target.value = e.target.value.toLowerCase()}
              autoComplete="off"
              className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-orange-400"
              }`}
              required
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-4 rounded-lg text-white font-semibold transition duration-200 ${
              loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
