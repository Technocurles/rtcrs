import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../../../config/api";

function CompleteProfile() {
  const navigate = useNavigate();

  // Form data state
  const [formData, setFormData] = useState({
    gender: "",
    dateOfBirth: "",
    houseNo: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  // On mount, check if profile is already completed
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const res = await axios.get(`${API}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.profileCompleted) {
          // Already completed → redirect to dashboard
          navigate("/dashboard");
        } else {
          // Fill form with any existing data
          setFormData({
            gender: res.data.gender || "",
            dateOfBirth: res.data.dateOfBirth?.split("T")[0] || "",
            houseNo: res.data.address?.houseNo || "",
            street: res.data.address?.street || "",
            city: res.data.address?.city || "",
            state: res.data.address?.state || "",
            pincode: res.data.address?.pincode || "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkProfile();
  }, [navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ profileImage: "Only JPG, JPEG, PNG, WEBP allowed" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ profileImage: "File must be < 5MB" });
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setErrors({ ...errors, profileImage: "" });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    const requiredFields = ["gender", "dateOfBirth", "houseNo", "street", "city", "state", "pincode"];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (profileImage) data.append("profileImage", profileImage);

      const token = localStorage.getItem("token");

      await axios.put(`${API}/api/complete-profile`, data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      // After successful completion → redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Complete Your Profile</h2>

      {errors.submit && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errors.submit}</div>}

      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender *</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            autoComplete="off"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.gender ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
            }`}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
              .toISOString()
              .split("T")[0]}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.dateOfBirth ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
            }`}
            autoComplete="off"
          />
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>

        {/* House No */}
        <div>
          <label className="block text-sm font-medium text-gray-700">House No / Building Name *</label>
          <input
            type="text"
            name="houseNo"
            value={formData.houseNo}
            onChange={handleChange}
            autoComplete="off"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.houseNo ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
            }`}
          />
          {errors.houseNo && <p className="text-red-500 text-sm mt-1">{errors.houseNo}</p>}
        </div>

        {/* Street */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Street Address *</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            autoComplete="off"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.street ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
            }`}
          />
          {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700">City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            autoComplete="off"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.city ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
            }`}
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700">State *</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            autoComplete="off"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.state ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
            }`}
          />
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Pincode *</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            maxLength={6}
            autoComplete="off"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.pincode ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
            }`}
          />
          {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
              loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Saving Profile..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompleteProfile;
