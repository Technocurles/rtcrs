import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function AuthForms() {
  const navigate = useNavigate();
  const API = "http://localhost:8080";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const validateField = (name, value) => {
    let message = "";
    if (name === "usernameOrEmail" && !value.trim()) message = "Username or Email is required";
    if (name === "password" && !value) message = "Password is required";

    setFieldErrors((prev) => ({ ...prev, [name]: message }));
    return message === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const isUserValid = validateField("usernameOrEmail", formData.usernameOrEmail);
    const isPassValid = validateField("password", formData.password);
    if (!isUserValid || !isPassValid) return;

    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/login`, formData);

      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("role", res.data.role);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      sessionStorage.setItem("userData", JSON.stringify(res.data));
      localStorage.setItem("userData", JSON.stringify(res.data));

      if (!res.data.profileCompleted) {
        navigate("/complete-profile");
      } else {
        window.dispatchEvent(new Event("citizen-logged-in"));
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials or server error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto bg-white/30 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px] lg:min-h-[700px]">
        
        {/* Left Side Animation - Hidden on small mobile, shown on lg+ */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600 items-center justify-center p-8 xl:p-16 relative overflow-hidden">
          <img
            src={require("../assets/Login1.png")}
            alt="Login Background"
            className="w-full max-w-[400px] xl:max-w-[500px] h-auto object-cover rounded-2xl xl:rounded-3xl shadow-2xl opacity-90 hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Mobile-only top image */}
        <div className="lg:hidden h-48 sm:h-56 bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600 flex items-center justify-center p-6 relative overflow-hidden shrink-0">
          <img
            src={require("../assets/Login1.png")}
            alt="Login Background"
            className="h-full w-auto object-contain rounded-xl shadow-lg opacity-90"
            loading="lazy"
          />
        </div>

        {/* Right Side Form */}
        <div className="flex-1 bg-white/90 backdrop-blur-2xl p-6 sm:p-8 lg:p-12 xl:p-16 flex flex-col justify-center">
          {error && (
            <div className="text-red-600 text-center mb-4 sm:mb-6 px-4 font-semibold animate-pulse text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-5 sm:space-y-6 max-w-xl mx-auto w-full">
            {/* Username/Email */}
            <div>
              <input
                type="text"
                name="usernameOrEmail"
                placeholder="Username or Email"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                autoComplete="off"
                className={`w-full px-5 sm:px-8 py-4 sm:py-5 rounded-xl border-2 text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300 shadow-lg sm:shadow-xl text-base ${
                  fieldErrors.usernameOrEmail
                    ? "border-red-400 bg-red-50 focus:ring-red-200"
                    : "border-blue-200 hover:border-blue-300 bg-white/80"
                }`}
              />
              {fieldErrors.usernameOrEmail && (
                <p className="text-red-500 text-sm mt-2">{fieldErrors.usernameOrEmail}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="off"
                className={`w-full px-5 sm:px-8 py-4 sm:py-5 rounded-xl border-2 text-gray-800 pr-14 sm:pr-16 focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300 shadow-lg sm:shadow-xl text-base ${
                  fieldErrors.password
                    ? "border-red-400 bg-red-50 focus:ring-red-200"
                    : "border-blue-200 hover:border-blue-300 bg-white/80"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-xl sm:text-2xl text-gray-600 hover:text-gray-800 transition"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
              {fieldErrors.password && (
                <p className="text-red-500 text-sm mt-2">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 sm:py-5 rounded-xl text-lg sm:text-xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "🔄 Logging in..." : "🚀 Sign In"}
            </button>

            {/* Links */}
            <div className="text-center space-y-3 pt-4">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-800 font-semibold text-base sm:text-lg block hover:underline transition"
              >
                Forgot Password?
              </Link>
              <p className="text-gray-700 text-sm sm:text-base">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 font-bold hover:text-blue-800 hover:underline text-base sm:text-lg"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

