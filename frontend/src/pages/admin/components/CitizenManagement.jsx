import { useState, useEffect, useMemo } from "react";
import { Users, Search, MapPin, Phone, Filter, RefreshCw } from "lucide-react";
import { getAllUsers } from "../services/adminService";

export default function CitizenManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Gujarat");

  const cities = [
    "All Gujarat", "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar",
    "Jamnagar", "Junagadh", "Bhavnagar", "Anand", "Bharuch", "Navsari",
    "Valsad", "Patan", "Mehsana"
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const params = selectedCity !== "All Gujarat" ? { city: selectedCity } : {};
      const data = await getAllUsers(params);
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching citizens:", err);
      setError(err.message || "Failed to fetch citizens");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.firstName?.toLowerCase().includes(lower) ||
        user.lastName?.toLowerCase().includes(lower) ||
        user.email?.toLowerCase().includes(lower) ||
        user.username?.toLowerCase().includes(lower) ||
        user.mobile?.includes(searchTerm)
      );
    }
    return result;
  }, [users, searchTerm]);

  const getProfileStatus = (user) => {
    if (user.profileCompleted) {
      return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Complete</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Incomplete</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Users size={32} />
              All Citizens of Gujarat
            </h1>
            <p className="text-gray-600 mt-1">
              Manage registered citizens across Gujarat {selectedCity !== "All Gujarat" && ` - Filtered by ${selectedCity}`}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            {/* City Filter */}
            <div className="flex items-center gap-2">
              <MapPin className="text-gray-400" size={20} />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                placeholder="Search citizens by name, email, mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Refresh */}
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 m-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center">
          <RefreshCw className="animate-spin mx-auto text-blue-600 w-12 h-12 mb-4" />
          <p className="text-gray-600">Loading citizens...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          {searchTerm ? "No citizens match your search." : 
           selectedCity === "All Gujarat" ? "No registered citizens found." : 
           `No citizens found in ${selectedCity}.`}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Citizen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        {user.profileImage ? (
                          <img className="h-12 w-12 rounded-full object-cover" src={user.profileImage} alt="" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500 mt-1">📞 {user.mobile}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.address?.city || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.address?.state || "Gujarat"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getProfileStatus(user)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Stats */}
      {!loading && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <span>
              Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> 
              {selectedCity !== "All Gujarat" && ` citizens in ${selectedCity}`}
            </span>
            <button
              onClick={fetchUsers}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 whitespace-nowrap"
            >
              Refresh List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
