import React, { useState, useEffect } from "react";
import axios from "axios";
import adminService from "../services/adminService";
import API from "../../../config/api";

const citiesByDivision = {
  "North Gujarat": ["Banaskantha", "Patan", "Mehsana", "Sabarkantha", "Aravalli", "Gandhinagar"],
  "Central Gujarat": ["Ahmedabad", "Vadodara", "Anand", "Kheda", "Chhota Udaipur", "Dahod", "Mahisagar"],
  "South Gujarat": ["Surat", "Bharuch", "Narmada", "Navsari", "Valsad", "Dang", "Tapi"],
  "Saurashtra-Kutch": ["Rajkot", "Jamnagar", "Junagadh", "Porbandar", "Bhavnagar", "Amreli", "Surendranagar", "Morbi", "Botad", "Devbhumi Dwarka", "Gir Somnath", "Kutch"],
};

export default function AddAdmin({ setActiveTab, preselectedCity }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    city: preselectedCity || "",
    name: "",
    email: "",
    password: "",
    officerId: "",
    isActive: true,
  });

  const [existingAdmins, setExistingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const data = await adminService.getAllSubAdmins();
        setExistingAdmins(data);
      } catch (error) {
        console.error("Error fetching admins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  useEffect(() => {
    if (preselectedCity) {
      setFormData((prev) => ({
        ...prev,
        city: preselectedCity,
      }));
    }
  }, [preselectedCity]);

  const assignedCities = existingAdmins
    .filter((admin) => admin.isActive)
    .map((admin) => admin.city);

  const capitalize = (value) =>
    value.replace(/[^a-zA-Z ]/g, "").replace(/\b\w/g, (char) => char.toUpperCase());

  const generatePassword = (city) => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `JR_${city}@${random}`;
  };

  const generateAdminEmail = () => {
    const timestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 1000);
    return `janrakshakadmin_${timestamp}_${randomNumber}@gmail.com`;
  };

  useEffect(() => {
    if (formData.city) {
      const cityLower = formData.city.toLowerCase().replace(/\s/g, "");

      setFormData((prev) => ({
        ...prev,
        name: `Admin_${formData.city}`,
        email: generateAdminEmail(),
        password: generatePassword(cityLower),
      }));
    }
  }, [formData.city]);

  const passwordStrength = () => {
    const pwd = formData.password;
    if (pwd.length > 12) return "Strong";
    if (pwd.length > 8) return "Medium";
    return "Weak";
  };

  const copyCredentials = () => {
    navigator.clipboard.writeText(
      `Email: ${formData.email}\nPassword: ${formData.password}`
    );
    alert("Credentials copied successfully.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      officerName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      role: "sub_admin",
      state: "Gujarat",
      city: formData.city,
      officerId: formData.officerId,
      isActive: formData.isActive,
    };

    try {
      const response = await axios.post(`${API}/api/admin/create`, payload);
      const createdEmail = response.data?.admin?.email || "Auto-generated";

      alert(
        `Sub Admin Created Successfully\n\nEmail: ${createdEmail}\nPassword: ${formData.password}`
      );

      if (setActiveTab) {
        setActiveTab("viewAdmins");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Create Sub Admin
        </h2>

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">Officer Name</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="First Name"
                autoComplete="off"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: capitalize(e.target.value) })
                }
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                required
                placeholder="Last Name"
                autoComplete="off"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: capitalize(e.target.value) })
                }
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-medium">Select City</label>
            <select
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              autoComplete="off"
              className="w-full mt-2 p-3 border rounded-lg"
            >
              <option value="">Choose City</option>
              {Object.keys(citiesByDivision).map((division) => (
                <optgroup key={division} label={division}>
                  {citiesByDivision[division].map((city) => (
                    <option
                      key={city}
                      value={city}
                      disabled={assignedCities.includes(city)}
                    >
                      {city} {assignedCities.includes(city) ? "(Admin Assigned)" : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {assignedCities.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Note: Cities with active admins are disabled. Deactivate existing admin to reassign.
              </p>
            )}
          </div>

          {formData.city && !assignedCities.includes(formData.city) && (
            <div className="bg-blue-50 p-5 rounded-xl space-y-2">
              <p><strong>Admin Name:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Password:</strong> {formData.password}</p>
              <p><strong>Strength:</strong> {passwordStrength()}</p>
              <button
                type="button"
                onClick={copyCredentials}
                className="text-sm text-blue-600 underline"
              >
                Copy Credentials
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <input value="Sub Admin" readOnly className="p-3 bg-gray-200 rounded-lg" />
            <input value="Gujarat" readOnly className="p-3 bg-gray-200 rounded-lg" />
          </div>

          <input
            required
            placeholder="Officer ID"
            value={formData.officerId}
            onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
            autoComplete="off"
            className="w-full p-3 border rounded-lg"
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label>Active</label>
          </div>

          <button
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            disabled={assignedCities.includes(formData.city) || loading}
          >
            Create Admin
          </button>
        </form>
      </div>
    </div>
  );
}
