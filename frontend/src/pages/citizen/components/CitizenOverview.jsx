export default function CitizenOverview({ user }) {
  const quickTips = [
    "Keep your profile details updated so authorities can reach you faster.",
    "Use Report Crime to submit incidents with clear descriptions and evidence.",
    "Use the SOS button only for emergencies that need immediate attention.",
  ];

  const quickActions = [
    {
      title: "Report Safely",
      description: "Share incident details, location, and evidence in one place.",
    },
    {
      title: "Track Updates",
      description: "Open My Reports to follow the latest status of your complaints.",
    },
    {
      title: "Stay Prepared",
      description: "Review your profile and phone details so alerts stay accurate.",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.firstName || "Citizen"}!
            </h1>
            <p className="text-xl opacity-90">
              Your safety dashboard is ready whenever you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 min-w-[260px]">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/75 mb-1">
                Quick Access
              </p>
              <p className="text-lg font-semibold">Report Crime</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/75 mb-1">
                Emergency
              </p>
              <p className="text-lg font-semibold">SOS Support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {quickActions.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-3 text-slate-600 leading-7">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Safety Reminders
        </h2>
        <div className="space-y-3">
          {quickTips.map((tip) => (
            <div
              key={tip}
              className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-700"
            >
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
