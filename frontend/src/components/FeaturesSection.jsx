import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import reportCrimeImg from "../assets/report_crime.jpg";
import sosImg from "../assets/sos_alert.png";
import mapImg from "../assets/map.jpg";
import policeImg from "../assets/f_police.jpg";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.6 }
  }
};

const cardHover = {
  scale: 1.05,
  y: -10,
  transition: { duration: 0.3, ease: "easeOut" }
};

const features = [
  {
    title: "Report Crime Instantly",
    description: "Citizens can quickly submit crime reports with location and evidence.",
    id: 1,
    image: reportCrimeImg
  },
  {
    title: "Emergency SOS Alert",
    description: "Send an instant SOS alert to authorities during emergencies.",
    id: 2,
    image: sosImg
  },
  {
    title: "Interactive Crime Map",
    description: "View reported crimes and alerts across Gujarat in real time.",
    id: 3,
    image: mapImg
  },
  {
    title: "Secure & Trusted Platform",
    description: "Authentication and verification ensure reliable reporting.",
    id: 4,
    image: policeImg
  }
];

const FeaturesSection = () => {
  return (
    <motion.section
      className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Section Title */}
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-gray-800 via-blue-600 to-amber-600 bg-clip-text text-transparent leading-tight">
            Key Features of <nbsp></nbsp>
            <span className="text-amber-500 block lg:inline">JanRakshak</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Empowering citizens and authorities to build safer communities.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              className="group"
              variants={itemVariants}
              whileHover={cardHover}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-white/50 h-full transition-all duration-300 hover:bg-white group-hover:shadow-blue-200/50">
                
                {/* Feature Image */}
                <div className="w-24 h-24 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto mb-6 overflow-hidden rounded-full ring-4 ring-blue-100/50 group-hover:ring-amber-200/70 transition-all duration-500 group-hover:scale-110">
                  <img 
                    src={feature.image}
                    alt={`${feature.title} feature`}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* Feature Title */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Feature Description */}
                <p className="text-gray-600 text-center leading-relaxed text-sm md:text-base px-2">
                  {feature.description}
                </p>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.section>
  );
};

export default FeaturesSection;

