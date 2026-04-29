import { Link } from "react-router-dom";
import policeImage from "../assets/pic2.jpg";

function InformationSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image */}
          <div className="order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={policeImage} 
                alt="Police helping citizens" 
                className="w-full h-auto object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          </div>

          {/* Right Column - Text Content */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
              Our Police Department Is Dedicated To Serving & Protecting You
            </h2>
            
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The Real-Time Crime Reporting System (RTCRS) is an innovative platform designed to bridge the gap between citizens and law enforcement. Our mission is to create a safer community by enabling quick and efficient crime reporting.
              </p>
              <p>
                With RTCRS, you can report crimes instantly from anywhere using your smartphone or computer. The system automatically forwards your report to the nearest police station, ensuring faster response times and better coordination between authorities.
              </p>
              <p>
                We believe that every citizen deserves to feel safe. By working together, we can reduce crime rates and build a more secure environment for everyone. Your contribution matters - report incidents promptly and help us protect our community.
              </p>
            </div>

            {/* Learn More Button */}
            <div className="mt-8">
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 bg-[#1E3A8A] hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Learn More
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InformationSection;

