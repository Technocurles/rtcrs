import { useEffect, useState } from "react";
import axios from "axios";
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit2, Camera } from "lucide-react";
import API from "../../../config/api";

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setFormData({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        email: res.data.email || "",
        mobile: res.data.mobile || "",
        gender: res.data.gender || "",
        dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.substring(0, 10) : "",
        "address.houseNo": res.data.address?.houseNo || "",
        "address.street": res.data.address?.street || "",
        "address.city": res.data.address?.city || "",
        "address.state": res.data.address?.state || "",
        "address.pincode": res.data.address?.pincode || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {isEditing ? (
        /* Edit Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Address Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">House No.</label>
              <input
                type="text"
                name="address.houseNo"
                value={formData["address.houseNo"]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
              <input
                type="text"
                name="address.street"
                value={formData["address.street"]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="address.city"
                value={formData["address.city"]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="address.state"
                value={formData["address.state"]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                name="address.pincode"
                value={formData["address.pincode"]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={6}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setMessage({ type: "", text: "" });
              }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* View Profile */
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              <div className="relative">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-blue-100">
                    <span className="text-4xl font-bold text-white">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                  <Camera size={16} />
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-500">{user?.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Shield size={14} />
                    Verified Citizen
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="text-blue-600" size={20} />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile Number</p>
                  <p className="font-medium text-gray-800">{user?.mobile}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium text-gray-800">
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-gray-800 capitalize">{user?.gender || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="text-blue-600" size={20} />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MapPin className="text-indigo-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">House No.</p>
                  <p className="font-medium text-gray-800">{user?.address?.houseNo || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MapPin className="text-indigo-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Street</p>
                  <p className="font-medium text-gray-800">{user?.address?.street || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MapPin className="text-indigo-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium text-gray-800">{user?.address?.city || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MapPin className="text-indigo-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <p className="font-medium text-gray-800">{user?.address?.state || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MapPin className="text-indigo-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pincode</p>
                  <p className="font-medium text-gray-800">{user?.address?.pincode || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

