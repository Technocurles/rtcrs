

import React from "react";
import loginVideo from "../assets/login.mp4";
import forgotPassVideo from "../assets/Forgotpass.mp4";
import reportVideo from "../assets/Report.mp4";

function Awareness() {

const awarenessVideos = [
  { title: "Cyber Crime Prevention", desc: "Protect yourself from online fraud, phishing and digital scams.", videoId: "EHqXMxY4_Nk" },
  { title: "UPI & Banking Fraud Safety", desc: "How to stay safe from online payment and banking fraud.", videoId: "UX2FC4d7liw" },
  { title: "Women Safety & Legal Rights", desc: "Understanding rights, helplines and protection laws.", videoId: "SNjA8HIFiOk" },
  { title: "Domestic Violence Awareness", desc: "Recognizing abuse and how to seek help.", videoId: "zuN1wlwQLEA" },
  { title: "Child Protection & Anti-Bullying", desc: "Preventing child abuse and school bullying.", videoId: "fkbfh6MB8Ts" },
  { title: "Human Trafficking Awareness", desc: "Identifying trafficking and reporting suspicious activities.", videoId: "X05nsp2gDAs" },
  { title: "Road Safety Guidelines", desc: "Important traffic rules and accident prevention tips.", videoId: "556-_Cs52ss" },
  { title: "Drug Abuse Prevention", desc: "Understanding risks of substance abuse and prevention.", videoId: "2Z-97VWHaB0" },
  { title: "Senior Citizen Safety", desc: "Protecting elderly citizens from fraud and exploitation.", videoId: "Sgs4K2eAZhg" },
  { title: "Cyberbullying Awareness", desc: "Recognizing and reporting online harassment.", videoId: "0Xo8N9qlJtk" },
  { title: "Online Privacy Protection", desc: "Keeping your data secure on social media platforms.", videoId: "7NQy2AUqgyU" },
  { title: "ATM & Card Skimming Fraud", desc: "How to detect and prevent ATM fraud.", videoId: "tn9RCR9DJbs" },
  { title: "Emergency Helpline Awareness", desc: "Know important emergency numbers and services.", videoId: "_0b7B68swE0" },
  { title: "Workplace Harassment", desc: "Understanding workplace safety and legal rights.", videoId: "uts4F3RHjhM" },
  { title: "Fake Job Offer Scams", desc: "How to identify employment fraud schemes.", videoId: "b20PWjh93oI" },
  { title: "Mobile Phone Safety", desc: "Securing your device from hacking and malware.", videoId: "4hdV74HEscs" },
  { title: "Online Gaming Safety", desc: "Preventing gaming addiction and financial fraud.", videoId: "ahGFrqVK6tI" },
  { title: "Identity Theft Prevention", desc: "Protect yourself from misuse of personal data.", videoId: "Fztuohj3Fck" },
  { title: "Public Transport Safety", desc: "Staying alert and safe while commuting.", videoId: "D8pkfbXxJas" },
  { title: "Anti-Ragging Awareness", desc: "Understanding anti-ragging laws and reporting.", videoId: "RlcUORMqIl0" },
  { title: "Women Self-Defense Awareness", desc: "Basic safety practices and emergency response.", videoId: "x-tD6G_b3UY" },
  { title: "Child Labour Awareness", desc: "Recognizing and reporting child exploitation.", videoId: "NZEE0b_0p8w" },
  { title: "Social Media Scam Alerts", desc: "Identifying fake giveaways and scam pages.", videoId: "c6drRoIGl5Q" },
  { title: "Disaster Emergency Preparedness", desc: "How to stay safe during natural disasters.", videoId: "pXkOscAY8zk" }
];



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF9933]/15 via-white to-[#138808]/15 px-6 py-16">

      {/* HERO SECTION */}
      <div className="text-center max-w-4xl mx-auto mb-20">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6 tracking-wide">
          Safety Awareness & Resources
        </h1>

        <p className="text-gray-600 text-xl leading-relaxed">
          Empowering citizens with knowledge to prevent crimes, understand
          their rights, and take immediate action when necessary.
        </p>
      </div>


        {/* ================= VIDEO LIBRARY CONTAINER ================= */}
<div className="max-w-7xl mx-auto mt-10">

  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-12">

    {/* Main Heading */}
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-800">
        🎥 Video Library
      </h2>
      <div className="w-24 h-1 bg-blue-700 mx-auto mt-4 rounded-full"></div>
    </div>

    {/* -------- Platform Guide Section -------- */}
    <div className="mb-16">

      <h3 className="text-2xl font-semibold text-blue-800 mb-8 text-center">
        Platform Guide Videos
      </h3>

      <div className="grid md:grid-cols-3 gap-8">

        {["How to Register", "Login & Password Recovery", "How to File a Complaint"].map((title, index) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
            id={title === "How to Register" ? "register-video" : title === "Login & Password Recovery" ? "forgot-video" : title === "How to File a Complaint" ? "complaint-video" : undefined}
          >
            {title === "How to Register" ? (
              <video
                className="w-full h-52 rounded-lg object-cover bg-black"
                src={loginVideo}
                controls
                preload="metadata"
              />
            ) : title === "Login & Password Recovery" ? (
              <video
                className="w-full h-52 rounded-lg object-cover bg-black"
                src={forgotPassVideo}
                controls
                preload="metadata"
              />
            ) : title === "How to File a Complaint" ? (
              <video
                className="w-full h-52 rounded-lg object-cover bg-black"
                src={reportVideo}
                controls
                preload="metadata"
              />
            ) : (
              <iframe
                className="w-full h-52 rounded-lg"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title={title}
                allowFullScreen
              ></iframe>
            )}

            <h4 className="mt-4 text-center font-medium text-gray-800">
              {title}
            </h4>
          </div>
        ))}

      </div>
    </div>

    {/* Divider Between Sections */}
    <div className="border-t border-gray-300 my-12"></div>

    {/* -------- Public Awareness Section -------- */}
<div>

  <h3 className="text-2xl font-semibold text-green-800 mb-8 text-center">
    Public Awareness Videos
  </h3>

  <div className="grid md:grid-cols-3 gap-8">

    {awarenessVideos.map((video, index) => (
      <div
        key={index}
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
      >
        <iframe
          className="w-full h-52 rounded-lg"
          src={`https://www.youtube.com/embed/${video.videoId}`}
          title={video.title}
          allowFullScreen
        ></iframe>

        <h4 className="mt-4 text-center font-semibold text-gray-800">
          {video.title}
        </h4>

        <p className="text-sm text-gray-500 text-center mt-2">
          {video.desc}
        </p>
      </div>
    ))}

  </div>

</div>


  </div>

</div>

      

      
    </div>
  );
}

export default Awareness;

