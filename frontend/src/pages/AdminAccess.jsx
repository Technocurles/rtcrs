import { useNavigate } from "react-router-dom";

export default function AdminAccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-10">
      <div className="max-w-5xl w-full">

        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Administrative Access Portal
        </h2>

        <div className="grid md:grid-cols-2 gap-10">

          {/* Super Admin Card */}
          <div
            onClick={() => navigate("/admin/login")}
            className="cursor-pointer bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition transform hover:-translate-y-2 border-t-4 border-blue-600"
          >
            <h3 className="text-2xl font-semibold text-blue-700 mb-4">
              Super Admin
            </h3>

            <p className="text-gray-600">
              State-level administrative access. Manage sub-admins, monitor
              statewide reports, and oversee system operations.
            </p>
          </div>

          {/* Sub Admin Card */}
          <div
            onClick={() => navigate("/subadmin/login")}
            className="cursor-pointer bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition transform hover:-translate-y-2 border-t-4 border-green-600"
          >
            <h3 className="text-2xl font-semibold text-green-700 mb-4">
              Sub Admin
            </h3>

            <p className="text-gray-600">
              City-level administrative access. Manage complaints, monitor
              local activity, and coordinate field operations.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}