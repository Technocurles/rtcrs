import { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../services/adminService";

export default function SubAdminTable({ data = [], refresh }) {
  const [loadingId, setLoadingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  // Check if there are any active admins in the data
  const hasActiveAdmin = data.some((admin) => admin.isActive);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Sub Admin?"))
      return;

    try {
      setLoadingId(id);
      await adminService.deleteSubAdmin(id);
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggle = async (admin) => {
    try {
      setLoadingId(admin._id);
      await adminService.toggleStatus(admin._id);
      refresh();
    } catch (err) {
      console.error("Toggle failed:", err);
      alert("Toggle failed");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredData =
    filter === "all"
      ? data
      : data.filter((admin) =>
          filter === "active" ? admin.isActive : !admin.isActive
        );

  if (!filteredData.length) {
    return (
      <div className="bg-white p-6 rounded shadow w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Sub Admins</h2>
          {!hasActiveAdmin && (
            <button
              onClick={() => navigate("/admin/add")}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Add Admin
            </button>
          )}
          <FilterButtons filter={filter} setFilter={setFilter} />
        </div>
        <div className="text-gray-500">No Sub Admins Found</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Sub Admins</h2>
        
        {/* Add Admin Button - Only show when no active admins */}
        {!hasActiveAdmin && (
          <button
            onClick={() => navigate("/admin/add")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Add Admin
          </button>
        )}
        
        <FilterButtons filter={filter} setFilter={setFilter} />
      </div>

      <table className="min-w-full border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Officer</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Officer ID</th>
            <th className="p-3 border">State</th>
            <th className="p-3 border">City</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Created</th>
            <th className="p-3 border text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((admin) => (
            <tr key={admin._id} className="hover:bg-gray-50 transition">
              <td className="p-3 border">{admin.name}</td>
              <td className="p-3 border">{admin.officerName}</td>
              <td className="p-3 border">{admin.email}</td>
              <td className="p-3 border">{admin.officerId}</td>
              <td className="p-3 border">{admin.state}</td>
              <td className="p-3 border">{admin.city}</td>

              <td className="p-3 border">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    admin.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {admin.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="p-3 border">
                {new Date(admin.createdAt).toLocaleDateString()}
              </td>

              <td className="p-3 border text-center space-x-2">
                <button
                  onClick={() => handleToggle(admin)}
                  disabled={loadingId === admin._id}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  {admin.isActive ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => handleDelete(admin._id)}
                  disabled={loadingId === admin._id}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>

                {!admin.isActive && !hasActiveAdmin && (
                  <button
                    onClick={() => navigate("/admin/add")}
                    className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    Add Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilterButtons({ filter, setFilter }) {
  return (
    <div className="space-x-2">
      <button
        onClick={() => setFilter("all")}
        className={`px-3 py-1 rounded text-sm ${
          filter === "all"
            ? "bg-gray-800 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        Show All
      </button>

      <button
        onClick={() => setFilter("active")}
        className={`px-3 py-1 rounded text-sm ${
          filter === "active"
            ? "bg-green-600 text-white"
            : "bg-green-100 text-green-700"
        }`}
      >
        Active
      </button>

      <button
        onClick={() => setFilter("inactive")}
        className={`px-3 py-1 rounded text-sm ${
          filter === "inactive"
            ? "bg-red-600 text-white"
            : "bg-red-100 text-red-700"
        }`}
      >
        Inactive
      </button>
    </div>
  );
}
