const CitizenSOSStats = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800">SOS Stats</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Total Alerts</span>
          <span className="text-2xl font-bold text-gray-900">0</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Active</span>
          <span className="text-2xl font-bold text-blue-600">0</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Resolved</span>
          <span className="text-2xl font-bold text-green-600">0</span>
        </div>
      </div>
    </div>
  );
};

export default CitizenSOSStats;
