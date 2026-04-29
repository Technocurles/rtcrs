import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();
  const API = "http://localhost:8080";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availability, setAvailability] = useState({ username: "", email: "" });

  const validators = {
    firstName: /^[A-Z][a-z]{1,29}$/,
    lastName: /^[A-Z][a-z]{1,29}$/,
    username: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_]{4,20}$/,
    email: /^\S+@\S+\.\S+$/,
    mobile: /^[6-9]\d{9}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const validateField = (name, value, updatedData) => {
    let error = "";
    if (name === "confirmPassword") {
      if (value !== updatedData.password) {
        error = "Passwords do not match";
      }
    } else if (validators[name] && !validators[name].test(value)) {
      error = "Invalid " + name;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = async (e) => {
    let { name, value } = e.target;

    if (name === "firstName" || name === "lastName") {
      value = value.replace(/[^A-Za-z]/g, "");
      if (value.length > 0) value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    if (name === "email") value = value.toLowerCase();

    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    validateField(name, value, updatedData);

    if (name === "password") {
      checkPasswordStrength(value);
      validateField("confirmPassword", updatedData.confirmPassword, updatedData);
    }

    // Check availability for username/email (simulate)
    if (name === "username" && validators.username.test(value)) {
      setAvailability((prev) => ({ ...prev, username: value.length > 5 ? "Available" : "" }));
    }
    if (name === "email" && validators.email.test(value)) {
      setAvailability((prev) => ({ ...prev, email: value.includes("@") ? "Available" : "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    
    // Client-side validation
    let newErrors = {};
    for (let key in formData) {
      if (key === "confirmPassword") {
        if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = "Passwords do not match";
      } else if (validators[key] && !validators[key].test(formData[key])) {
        newErrors[key] = "Invalid " + key.replace(/([A-Z])/g, " $1").trim();
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/register`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username.toLowerCase(),
        email: formData.email.toLowerCase(),
        mobile: formData.mobile,
        password: formData.password
      });

      // Success - minimal data storage like login
      sessionStorage.setItem("tempUser", JSON.stringify({ username: formData.username }));
      
      alert("Registered successfully! Please login with your credentials.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_35%,#f8fbff_65%,#ffffff_100%)] px-4 py-6 sm:py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-5xl">
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] shadow-[0_30px_80px_rgba(37,99,235,0.15)] p-5 sm:p-8 md:p-10 lg:p-14 space-y-6 sm:space-y-8 animate-fadeIn border border-blue-100 overflow-hidden"
      >

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="relative">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              autoComplete="off"
              className={`peer w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border text-base bg-slate-50/80 ${
                errors.firstName ? "border-red-500 bg-red-50 hover:border-red-500" : "border-slate-200 hover:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all`}
              required
            />
            <label className="absolute left-4 -top-2 bg-white px-2 text-slate-500 text-xs peer-placeholder-shown:top-3.5 sm:peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm transition-all">
              First Name
            </label>
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div className="relative">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              autoComplete="off"
              className={`peer w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border text-base bg-slate-50/80 ${
                errors.lastName ? "border-red-500 bg-red-50 hover:border-red-500" : "border-slate-200 hover:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all`}
              required
            />
            <label className="absolute left-4 -top-2 bg-white px-2 text-slate-500 text-xs peer-placeholder-shown:top-3.5 sm:peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm transition-all">
              Last Name
            </label>
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email & Mobile */}
        <div className="space-y-4 sm:space-y-5">
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              autoComplete="off"
              className={`peer w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border text-base bg-slate-50/80 ${
                errors.email ? "border-red-500 bg-red-50 hover:border-red-500" : "border-slate-200 hover:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all`}
              required
            />
            <label className="absolute left-4 -top-2 bg-white px-2 text-slate-500 text-xs peer-placeholder-shown:top-3.5 sm:peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm transition-all">
              Email
            </label>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            {availability.email && <p className="text-blue-500 text-xs mt-1">{availability.email}</p>}
          </div>

          <div className="relative">
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile Number"
              autoComplete="off"
              maxLength={10}
              className={`peer w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border text-base bg-slate-50/80 ${
                errors.mobile ? "border-red-500 bg-red-50 hover:border-red-500" : "border-slate-200 hover:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all`}
              required
            />
            <label className="absolute left-4 -top-2 bg-white px-2 text-slate-500 text-xs peer-placeholder-shown:top-3.5 sm:peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm transition-all">
              Mobile Number
            </label>
            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
          </div>
        </div>

        {/* Username & Password */}
        <div className="space-y-4 sm:space-y-5">
          <div className="relative">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              autoComplete="off"
              className={`peer w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border text-base bg-slate-50/80 ${
                errors.username ? "border-red-500 bg-red-50 hover:border-red-500" : "border-slate-200 hover:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all`}
              required
            />
            <label className="absolute left-4 -top-2 bg-white px-2 text-slate-500 text-xs peer-placeholder-shown:top-3.5 sm:peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm transition-all">
              Username
            </label>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            {availability.username && <p className="text-blue-500 text-xs mt-1">{availability.username}</p>}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="off"
              className={`peer w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border text-base bg-slate-50/80 ${
                errors.password ? "border-red-500 bg-red-50 hover:border-red-500" : "border-slate-200 hover:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-sm sm:text-base text-slate-500 hover:text-slate-700 transition px-2 py-1"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            <label className="absolute left-4 -top-2 bg-white px-2 text-slate-500 text-xs peer-placeholder-shown:top-3.5 sm:peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm transition-all">
              Password
            </label>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Password Strength */}
          {passwordStrength > 0 && (
            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:py-4">
              <div className="flex items-center justify-between text-sm text-slate-600 mb-2 sm:mb-3">
                <span>Password Strength</span>
                <span className="font-semibold text-slate-800">{getStrengthText()}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              autoComplete="off"
              className={`peer w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border text-base bg-slate-50/80 ${
                errors.confirmPassword ? "border-red-500 bg-red-50 hover:border-red-500" : "border-slate-200 hover:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-sm sm:text-base text-slate-500 hover:text-slate-700 transition px-2 py-1"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
            <label className="absolute left-4 -top-2 bg-white px-2 text-slate-500 text-xs peer-placeholder-shown:top-3.5 sm:peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm transition-all">
              Confirm Password
            </label>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Submit Button */}
        {submitError && (
          <div className="p-3 sm:p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl sm:rounded-2xl text-sm">
            {submitError}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || Object.values(errors).some((err) => err)}
          className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="border-t border-slate-200 pt-4 sm:pt-5">
        <p className="text-center text-gray-600 text-sm sm:text-base">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in here
          </a>
        </p>
        </div>
      </form>
      </div>
    </div>
  );
}

export default Register;
