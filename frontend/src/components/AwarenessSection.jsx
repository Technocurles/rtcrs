import { Link } from "react-router-dom";

const awarenessCards = [
  {
    id: 1,
    icon: "👩",
    title: "Women Safety",
    description: "Essential tips and resources to help women stay safe in daily life. Learn self-defense techniques, safety apps, and emergency contacts.",
    link: "/awareness",
    color: "bg-pink-100 hover:bg-pink-200",
  },
  {
    id: 2,
    icon: "💻",
    title: "Cyber Crime Prevention",
    description: "Protect yourself from online fraud, phishing, and identity theft. Learn how to secure your digital presence and report cyber crimes.",
    link: "/awareness",
    color: "bg-blue-100 hover:bg-blue-200",
  },
  {
    id: 3,
    icon: "📞",
    title: "Emergency Contacts",
    description: "Quick access to emergency helpline numbers including police, ambulance, fire department, and women's helpline services.",
    link: "/awareness",
    color: "bg-green-100 hover:bg-green-200",
  },
];

function AwarenessSection() {
  return (
    <section className="py-16 px-4 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Stay Informed & Safe
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Important safety information and resources to help you and your family stay protected.
          </p>
        </div>

        {/* Awareness Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {awarenessCards.map((card) => (
            <div
              key={card.id}
              className={`${card.color} rounded-[15px] p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <span className="text-3xl">{card.icon}</span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {card.description}
              </p>

              {/* Learn More Link */}
              <Link
                to={card.link}
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200"
              >
                Learn More
                <span className="ml-1">→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AwarenessSection;

