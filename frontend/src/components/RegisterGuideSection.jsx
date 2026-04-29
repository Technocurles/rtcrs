import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import registerImg from "../assets/register.jpg";
import complainImg from "../assets/complain.jpg";
import forgotImg from "../assets/forgot.jpg";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 }
  }
};

const RegisterGuideSection = () => {
  return (
    <motion.section
      className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-slate-100 via-blue-50/30 to-slate-50"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.div className="text-center mb-20" initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 leading-tight">
            New to <span className="text-amber-500 block lg:inline">JanRakshak?</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Watch our quick guides to get started with JanRakshak.
          </p>
        </motion.div>

        {/* Three Guide Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Register/Login */}
          <motion.div
            className="group relative cursor-pointer rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white h-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            onClick={() => window.location.href = '/awareness#register-video'}
            style={{cursor: 'pointer'}}
          >


            {/* Thumbnail */}
            <div className="h-48 overflow-hidden">
              <img 
                src={registerImg}
                alt="Register/Login Tutorial"
                className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-500"
              />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            </div>

            {/* Content */}
            <div className="p-8 relative z-10">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">How to Register & Login</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Learn how to create your account and log in securely on JanRakshak platform.</p>
              <span className="text-blue-600 font-semibold text-sm inline-flex items-center gap-1 hover:text-blue-700 transition-colors">
                ▶ Watch Guide 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </motion.div>

          {/* Card 2: Report Complaint */}
          <motion.div
            className="group relative cursor-pointer rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white h-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
            onClick={() => window.location.href = '/awareness#complaint-video'}
            style={{cursor: 'pointer'}}
          >


            {/* Thumbnail */}
            <div className="h-48 overflow-hidden">
              <img 
                src={complainImg}
                alt="Report Complaint Tutorial"
                className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-500"
              />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            </div>

            {/* Content */}
            <div className="p-8 relative z-10">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">How to Report a Complaint</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Step-by-step guide to filing a crime report with location and evidence.</p>
              <span className="text-blue-600 font-semibold text-sm inline-flex items-center gap-1 hover:text-blue-700 transition-colors">
                ▶ Watch Guide 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </motion.div>

          {/* Card 3: Forgot Password */}
          <motion.div
            className="group relative cursor-pointer rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white h-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: true }}
            onClick={() => window.location.href = '/awareness#forgot-video'}
            style={{cursor: 'pointer'}}
          >


            {/* Thumbnail */}
            <div className="h-48 overflow-hidden">
              <img 
                src={forgotImg}
                alt="Forgot Password Tutorial"
                className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-500"
              />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            </div>

            {/* Content */}
            <div className="p-8 relative z-10">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">What if Forgot Password ?</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Quick recovery steps if you forget your password.</p>
              <span className="text-blue-600 font-semibold text-sm inline-flex items-center gap-1 hover:text-blue-700 transition-colors">
                ▶ Watch Guide 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default RegisterGuideSection;

