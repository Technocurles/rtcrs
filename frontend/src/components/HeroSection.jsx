import { Link } from "react-router-dom";
import "./HeroSection.css";
import { motion } from "framer-motion";
import officerImg from "../assets/Officer.png";

const HeroSection = () => {
  return (
    <section className="w-full pt-8 pb-12 md:pt-10 md:pb-20 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center min-h-[400px] md:min-h-[520px]">

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">

        {/* LEFT CONTENT */}
        <motion.div
          className="w-full lg:w-[52%] text-center lg:text-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">

            <span className="text-amber-500">
              Building Safer Cities
            </span>

            <br />

            <span className="text-blue-600">
              With JanRakshak
            </span>

          </h1>

          <p className="mt-4 md:mt-6 text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed max-w-xl mx-auto lg:mx-0">
            JanRakshak empowers citizens to report incidents instantly and
            helps authorities respond faster across
            <span className="font-semibold text-amber-600"> Gujarat</span>.
            Together we build a safer and more secure community.
          </p>

        </motion.div>


        {/* RIGHT SIDE OFFICER */}
        <motion.div
          className="w-full lg:w-[42%] flex justify-center lg:justify-end px-2 md:px-8 lg:px-12 py-4 md:py-8"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
        >

          <motion.img
            src={officerImg}
            alt="Police Officer"
            className="hero-image object-contain max-h-[280px] md:max-h-[400px]"
            animate={{
              y: [0, -18, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;