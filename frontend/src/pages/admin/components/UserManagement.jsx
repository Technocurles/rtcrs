import { ShieldPlus, Shield, Users } from "lucide-react";

export default function UserManagement({ setActiveTab }) {

  const flashcards = [
    {
      id: "addAdmin",
      icon: ShieldPlus,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Add Admin",
      description: "Create a new administrator account with elevated permissions.",
    },
    {
      id: "viewAdmins",
      icon: Shield,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "View Admins",
      description: "View and manage existing administrator accounts.",
    },
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-100">

      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          User Management
        </h1>
      </div>

      {/* Flashcards - Single Column Layout with Bigger Size and Increased Height */}
      <div className="flex flex-col gap-6 mt-8 max-w-4xl mx-auto">

        {flashcards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => setActiveTab(card.id)}
              className="bg-white shadow-xl rounded-2xl p-12 cursor-pointer 
                         hover:shadow-2xl transition-all duration-300 border 
                         hover:border-blue-500 hover:-translate-y-1 min-h-[180px]"
            >
              <div className="flex items-center gap-8">

                <div className={`${card.iconBg} p-6 rounded-full`}>
                  <Icon className={card.iconColor} size={48} />
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {card.title}
                  </h2>
                  <p className="text-gray-500 text-lg mt-2">
                    {card.description}
                  </p>
                </div>

              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
}

