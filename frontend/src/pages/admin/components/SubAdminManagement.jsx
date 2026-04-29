import { useEffect, useState } from "react";
import GujaratMap from "./GujaratMap";
import SubAdminTable from "./SubAdminTable";
import adminService from "../services/adminService";

export default function SubAdminManagement({ setActiveTab, setPreselectedCity }) {
  const [subAdmins, setSubAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllSubAdmins();
      setSubAdmins(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCityClick = (city) => {
    if (!city) {
      setFiltered(subAdmins);
      return;
    }

    const filteredData = subAdmins.filter(
      (admin) => admin.city && admin.city === city
    );

    setFiltered(filteredData);
  };

  if (loading) {
    return <div className="p-6">Loading admins...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Sub Admin Management
        </h1>
        <button
          onClick={() => {
            setActiveTab("addAdmin");
            setPreselectedCity("");
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
        >
          + Add Sub Admin
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 flex-shrink-0">
          <GujaratMap
            subAdmins={subAdmins}
            onCityClick={handleCityClick}
            setActiveTab={setActiveTab}
            setPreselectedCity={setPreselectedCity}
          />
        </div>

        <div className="lg:w-2/3 flex-1">
          <SubAdminTable
            data={filtered}
            refresh={fetchAdmins}
          />
        </div>
      </div>
    </div>
  );
}