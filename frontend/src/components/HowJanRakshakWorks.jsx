import { motion } from "framer-motion";

const stepVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const HowJanRakshakWorks = () => {
  return (
    <motion.section
className="w-full py-24 px-6 lg:px-12 bg-white"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-700 to-amber-600 bg-clip-text text-transparent mb-6 leading-tight">
            How JanRakshak Works
          </h2>

          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From reporting incidents to authorities taking action, JanRakshak ensures a smooth and transparent process.
          </p>
        </motion.div>

        <div className="space-y-20">

          {/* STEP 1 */}
          <motion.div
            className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14"
            variants={stepVariants}
          >
            <motion.video
              className="w-full lg:w-80 h-56 lg:h-72 object-contain"
              src="https://cdnl.iconscout.com/lottie/premium/thumb/online-communication-concept-with-man-using-laptop-for-social-media-chat-animation-gif-download-13785599.mp4"
              autoPlay
              loop
              muted
              playsInline
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            />

            <div className="lg:w-1/2 text-center lg:text-left">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-5">
                Citizen Reports an Incident
              </h3>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Citizens can quickly report crimes using JanRakshak by submitting
                incident details, location information, and supporting evidence
                through the platform.
              </p>
            </div>
          </motion.div>


          {/* STEP 2 */}
          <motion.div
            className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-14"
            variants={stepVariants}
          >
            <motion.video
              className="w-full lg:w-80 h-56 lg:h-72 object-contain"
              src="https://cdnl.iconscout.com/lottie/premium/thumb/a-girl-is-working-on-customer-services-animation-gif-download-10805815.mp4"
              autoPlay
              loop
              muted
              playsInline
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            />

            <div className="lg:w-1/2 text-center lg:text-left">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-5">
                Complaint Reaches City Authorities
              </h3>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                The system automatically routes the report to the assigned
                city sub-admin who reviews the complaint and verifies the
                submitted information.
              </p>
            </div>
          </motion.div>


          {/* STEP 3 */}
          <motion.div
            className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14"
            variants={stepVariants}
          >
            <motion.video
              className="w-full lg:w-80 h-56 lg:h-72 object-contain"
              src="https://cdnl.iconscout.com/lottie/premium/thumb/female-police-officer-on-duty-animation-gif-download-13273908.mp4"
              autoPlay
              loop
              muted
              playsInline
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            />

            <div className="lg:w-1/2 text-center lg:text-left">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-5">
                Authorities Take Action
              </h3>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                After verification, authorities respond to the incident and
                update the report status so citizens can track the progress
                of their complaint.
              </p>
            </div>
          </motion.div>

          {/* STEP 4 */}
          <motion.div
            className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-14"
            variants={stepVariants}
          >
            <motion.video
              className="w-full lg:w-80 h-56 lg:h-72 object-contain"
              src="https://cdnl.iconscout.com/lottie/premium/thumb/order-tracking-animation-gif-download-12905361.mp4"
              autoPlay
              loop
              muted
              playsInline
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            />

            <div className="lg:w-1/2 text-center lg:text-left">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-5">
                Track your report status
              </h3>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Stay informed about the progress of your reported incident. JanRakshak allows citizens to track the status of their complaints in real time, ensuring transparency and accountability from the authorities.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.section>
  );
};

export default HowJanRakshakWorks;