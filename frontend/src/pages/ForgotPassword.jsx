import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import API from "../config/api";
import passwordAnimation from "../assets/password.json"; // ✅ Lottie JSON version of your animation

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generated, setGenerated] = useState(false);
  const [timer, setTimer] = useState(180);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);

  // Countdown timer
  useEffect(() => {
    let interval;
    if (generated && timer > 0 && otp.length === 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [generated, timer, otp]);

  // Password strength checker
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 4) return "bg-yellow-500";
    if (passwordStrength === 5) return "bg-green-500";
  };

  const handleGenerateOtp = async () => {
    if (!email) return alert("Please enter your email");
    try {
      const res = await fetch(`${API}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setGenerated(true);
        setTimer(180);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server error. Try again later.");
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) return alert("OTP must be 6 digits");
    if (password !== confirmPassword) return alert("Passwords do not match");
    if (passwordStrength < 5) return alert("Password is not strong enough");

    try {
      const res = await fetch(`${API}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password reset successful!");
        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        {/* Left side - Lottie Animation */}
        <div className="w-full md:w-1/2 h-48 md:h-auto hidden md:flex items-center justify-center bg-gray-50">
          <Player
            autoplay
            loop
            src={passwordAnimation}
            style={{ height: "100%", width: "100%" }}
          />
        </div>

        {/* Mobile animation - smaller */}
        <div className="w-full h-40 md:hidden flex items-center justify-center bg-gray-50">
          <Player
            autoplay
            loop
            src={passwordAnimation}
            style={{ height: "100%", width: "60%" }}
          />
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-gray-800 text-center">
            Forgot Password
          </h2>

          {!generated && (
            <>
              <input
                type="email"
                placeholder="Enter Email"
                autoComplete="off"
                className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={handleGenerateOtp}
                className="w-full bg-blue-600 text-white p-3.5 rounded-lg hover:bg-blue-700 transition text-base font-medium"
              >
                Generate OTP
              </button>
            </>
          )}

          {generated && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                autoComplete="off"
                maxLength="6"
                className="w-full border p-3 mb-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/[^0-9]/g, ""))
                }
              />
              {otp.length === 0 && (
                <p className="text-sm text-red-500 mb-3 text-center">
                  OTP expires in: {Math.floor(timer / 60)}:
                  {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
                </p>
              )}

              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                autoComplete="off"
                className="w-full border p-3 mb-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="text-xs text-gray-600 mt-2 space-y-1 mb-2">
                <p>• Minimum 8 characters</p>
                <p>• At least 1 uppercase letter</p>
                <p>• At least 1 lowercase letter</p>
                <p>• At least 1 number</p>
                <p>• At least 1 special character (@$!%*?&)</p>
              </div>

              <div className="w-full bg-gray-200 h-2 rounded mb-3 overflow-hidden">
                <div
                  className={`h-2 rounded transition-all duration-500 ${getStrengthColor()}`}
                  style={{ width: `${passwordStrength * 20}%` }}
                />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                autoComplete="off"
                className="w-full border p-3 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <label className="text-sm cursor-pointer block mb-4 flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  onChange={() => setShowPassword(!showPassword)}
                  className="w-4 h-4"
                />
                Show Password
              </label>

              <button
                onClick={handleResetPassword}
                className="w-full bg-purple-600 text-white p-3.5 rounded-lg hover:bg-purple-700 transition text-base font-medium"
                disabled={timer === 0}
              >
                Reset Password
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
