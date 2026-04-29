import { Link } from "react-router-dom";

const features = [
  {
    id: 1,
    icon: "📝",
    title: "Report Crime",
    description: "Submit crime reports quickly and easily. Your information helps authorities take immediate action.",
    link: "/login",
  },
  {
    id: 2,
    icon: "🗺️",
    title: "Crime Map",
    description: "View real-time crime data and hotspot areas in your city to stay informed and safe.",
    link: "/",
  },
  {
    id: 3,
    icon: "🚨",
    title: "SOS Emergency",
    description: "Send instant emergency alerts with your location to get immediate police assistance.",
    link: "#sos",
  },
  {
    id: 4,
    icon: "🛡️",
    title: "Awareness & Safety",
    description: "Learn essential safety tips and preventive measures to protect yourself and your family.",
    link: "/awareness",
  },
];

function FeatureSection() {
  return (
    <section className="py-16 px-4 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools and resources to help you stay safe and connected with law enforcement.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.id}
              to={feature.link}
              className="group bg-white rounded-[15px] p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Circular Icon */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <span className="text-3xl">{feature.icon}</span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm text-center leading-relaxed">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;

