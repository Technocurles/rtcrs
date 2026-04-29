import React from "react";

function About() {
  const [openFaq, setOpenFaq] = React.useState(0);

  const impactStats = [
    { value: "24/7", label: "Always available", detail: "Citizens can report incidents whenever they need help." },
    { value: "Secure", label: "Protected reporting", detail: "Sensitive details are handled through controlled access." },
    { value: "Fast", label: "Quicker escalation", detail: "Reports can move to the right authority without unnecessary delay." },
  ];

  const platformHighlights = [
    {
      title: "Real-Time Reporting",
      description: "Citizens can submit incidents as they happen with location details, descriptions, and supporting evidence.",
    },
    {
      title: "Safer Digital Access",
      description: "A guided reporting flow helps people raise complaints without navigating complex offline processes first.",
    },
    {
      title: "Actionable Dashboards",
      description: "Authorities can review, organize, and respond to reports through role-based operational views.",
    },
    {
      title: "Emergency Support",
      description: "Integrated SOS functionality helps route urgent alerts quickly when immediate attention is needed.",
    },
    {
      title: "Citizen Transparency",
      description: "Users can stay informed through complaint history, status visibility, and structured updates.",
    },
    {
      title: "Evidence-Friendly Design",
      description: "Photos, videos, audio, and supporting details can be attached to improve the quality of reporting.",
    },
  ];

  const reportingAreas = [
    "Women and child safety incidents",
    "Cybercrime and online fraud",
    "Property crimes and theft",
    "Violent offenses and public threats",
    "Traffic, nuisance, and community safety issues",
    "Drug-related and organized crime concerns",
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Report",
      description: "Citizens submit a complaint with relevant details, location, and evidence.",
    },
    {
      step: "02",
      title: "Route",
      description: "The platform helps direct reports to the appropriate administrative layer.",
    },
    {
      step: "03",
      title: "Review",
      description: "Authorities assess, verify, and manage reports from their dashboard.",
    },
    {
      step: "04",
      title: "Respond",
      description: "The case can then be tracked, updated, and progressed with better visibility.",
    },
  ];

  const emergencyContacts = [
    { service: "Police Emergency", number: "100" },
    { service: "Women Helpline", number: "181" },
    { service: "Cyber Crime Helpline", number: "1930" },
    { service: "Ambulance", number: "108" },
    { service: "Fire Brigade", number: "101" },
    { service: "Child Helpline", number: "1098" },
  ];

  const faqs = [
    {
      question: "Is complaint information kept confidential?",
      answer: "JanRakshak is designed to limit access to complaint data to authorized personnel and system flows that require it.",
    },
    {
      question: "Can users track complaint progress?",
      answer: "Yes. The platform experience is built to give citizens better visibility into the status of their submitted reports.",
    },
    {
      question: "What kind of evidence can be attached?",
      answer: "Users can provide supporting material such as photos, videos, audio, and written descriptions when available.",
    },
    {
      question: "Is JanRakshak only for emergency situations?",
      answer: "No. It supports both structured crime reporting and urgent SOS use cases depending on the incident.",
    },
    {
      question: "Who is this platform built for?",
      answer: "It is intended for citizens, super admins, and sub admins who each interact with the platform in different ways.",
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_35%,#ffffff_100%)] text-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.18),transparent_30%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-slate-950">
                A modern public safety platform built for faster reporting and better response.
              </h1>
              <p className="mt-6 max-w-2xl text-lg md:text-xl leading-8 text-slate-600">
                JanRakshak connects citizens with digital reporting tools, authority workflows, and emergency support in one blue-focused, accessible experience.
              </p>
            </div>

            <div className="grid gap-4">
              {impactStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.75rem] border border-blue-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(37,99,235,0.08)]"
                >
                  <div className="text-4xl font-bold text-blue-700">{stat.value}</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{stat.label}</div>
                  <p className="mt-2 text-slate-600 leading-7">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="rounded-[2rem] bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-8 md:p-10 shadow-[0_25px_70px_rgba(37,99,235,0.18)]">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Our Mission</p>
              <h2 className="mt-3 text-3xl font-bold">Make reporting safer, simpler, and more responsive.</h2>
              <p className="mt-4 text-blue-50 leading-8">
                The goal of JanRakshak is to reduce friction between a citizen noticing an incident and the right authority receiving a clear, actionable report.
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Our Vision</p>
              <h2 className="mt-3 text-3xl font-bold">A more confident public safety experience for every community.</h2>
              <p className="mt-4 text-blue-50 leading-8">
                We aim to support a system where digital access, structured reporting, and visible response workflows help build trust between people and institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-600 font-semibold">Platform Strengths</p>
          <h2 className="mt-3 text-4xl font-bold text-slate-950">Designed to feel practical, secure, and ready for real use.</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {platformHighlights.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.75rem] border border-blue-100 bg-white p-7 shadow-[0_18px_50px_rgba(37,99,235,0.06)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(37,99,235,0.12)]"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600" />
              <h3 className="mt-5 text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-slate-600 leading-7">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-50/70 border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-start">
            <div className="rounded-[1.75rem] bg-white p-8 shadow-[0_18px_50px_rgba(37,99,235,0.06)] border border-blue-100">
              <p className="text-sm uppercase tracking-[0.25em] text-blue-600 font-semibold">Coverage</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">What citizens can report</h2>
              <div className="mt-6 space-y-3">
                {reportingAreas.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-blue-600 font-semibold">How It Works</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">A simple flow from incident to action.</h2>
              <div className="mt-8 grid gap-4">
                {workflowSteps.map((item) => (
                  <div
                    key={item.step}
                    className="flex gap-4 rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-[0_14px_35px_rgba(37,99,235,0.05)]"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-slate-600 leading-7">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-10">
          <div className="rounded-[1.75rem] bg-white border border-blue-100 p-8 shadow-[0_18px_50px_rgba(37,99,235,0.06)]">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-600 font-semibold">Emergency Access</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">Important numbers in one place.</h2>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.service}
                  className="rounded-2xl bg-blue-50 border border-blue-100 px-5 py-5"
                >
                  <div className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                    {contact.service}
                  </div>
                  <div className="mt-2 text-3xl font-bold text-slate-950">{contact.number}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-gradient-to-br from-blue-700 to-indigo-700 text-white p-8 shadow-[0_22px_65px_rgba(37,99,235,0.18)]">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-100 font-semibold">Why It Matters</p>
            <h2 className="mt-3 text-3xl font-bold">Modern tools can reduce hesitation in reporting.</h2>
            <p className="mt-5 text-blue-50 leading-8">
              A platform like JanRakshak helps make crime reporting more approachable, especially when clarity, urgency, and evidence all matter at once.
            </p>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                Structured complaint flow for citizens
              </div>
              <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                Role-based handling for authorities
              </div>
              <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                Better visibility into reporting and response
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-600 font-semibold">FAQ</p>
          <h2 className="mt-3 text-4xl font-bold text-slate-950">Questions people commonly ask.</h2>
        </div>
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="rounded-[1.5rem] border border-blue-100 bg-white shadow-[0_14px_35px_rgba(37,99,235,0.05)] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between gap-4 hover:bg-blue-50 transition"
              >
                <span className="text-lg font-semibold text-slate-900">{faq.question}</span>
                <span className="text-2xl font-light text-blue-700">
                  {openFaq === index ? "-" : "+"}
                </span>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-6 text-slate-600 leading-8">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto rounded-[2rem] bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-8 py-12 md:px-12 md:py-14 shadow-[0_28px_80px_rgba(37,99,235,0.18)]">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-blue-100 font-semibold">Get Started</p>
              <h2 className="mt-3 text-4xl font-bold">Join the platform built to make reporting more accessible.</h2>
              <p className="mt-4 max-w-2xl text-blue-50 leading-8">
                Create your account, stay informed, and use JanRakshak when you need a clearer path to action.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-7 py-4 text-blue-700 font-semibold transition hover:bg-blue-50"
              >
                Register Now
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-7 py-4 text-white font-semibold transition hover:bg-white/20"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto rounded-[1.75rem] border border-blue-100 bg-white px-8 py-8 text-center shadow-[0_18px_50px_rgba(37,99,235,0.06)]">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-600 font-semibold">
            Made With Care
          </p>
          <h3 className="mt-3 text-2xl font-bold text-slate-950">
            Crafted with love by Dhyana
          </h3>
          <p className="mt-3 text-slate-600 leading-7">
            This platform was shaped with care to make reporting feel clearer, safer, and more accessible for every citizen who needs it.
          </p>
        </div>
      </section>
    </div>
  );
}

export default About;
