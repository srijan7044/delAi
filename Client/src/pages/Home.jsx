import React from "react";
import { useNavigate } from "react-router-dom";
import AssistantPreview from "../Components/AssistantPreview";
import logo from "../assets/logo.png";
const STEPS = [
  {
    step: "01",
    title: "Sign up free",
    desc: "Continue with Google and create your assistant instantly.",
  },

  {
    step: "02",
    title: "Customize assistant",
    desc: "Set your business name, tone, voice and theme.",
  },

  {
    step: "03",
    title: "Train your assistant",
    desc: "Add business details and personalize responses.",
  },

  {
    step: "04",
    title: "Embed anywhere",
    desc: "Copy one script tag and add it to your website.",
  },
];

function Home({ user }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen app-bg overflow-hidden">
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-20">
        <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-black via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 bg-[rgba(255,255,255,0.03)] border border-transparent shadow-sm text-muted text-xs sm:text-sm font-semibold px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-[rgba(14,165,164,0.8)] rounded-full" />
              Voice AI for modern websites
            </span>
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <h1 className="max-w-5xl mx-auto text-[42px] leading-[52px] sm:text-6xl sm:leading-[72px] lg:text-7xl lg:leading-[88px] font-black tracking-[-0.04em] text-main">
              Add a{" "}
              <span className="inline-block px-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-emerald-500">
                  Virtual Assistant
                </span>
              </span>
              <br className="hidden sm:block" />
              to your website
            </h1>
            <p className="max-w-2xl mx-auto mt-7 text-sm sm:text-lg lg:text-xl text-muted leading-relaxed px-2">
              Create a smart voice-enabled assistant that talks to visitors,
              answers questions and helps users navigate your website instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <button
                onClick={() => navigate("/builder")}
                className="w-full sm:w-auto btn-primary text-sm sm:text-base font-semibold shadow-[0_12px_40px_rgba(168,85,247,0.18)]"
              >
                Build Your Assistant
              </button>
            </div>

            <p className="mt-5 text-xs sm:text-sm text-muted">
              Free plan includes 200 AI responses
            </p>
          </div>
          <AssistantPreview />
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-main">
              Get started in minutes
            </h2>

            <p className="text-muted mt-3 text-sm sm:text-base">
              Simple setup. No complicated integration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="group surface hover:shadow-[0_15px_50px_rgba(0,0,0,0.4)] border border-transparent rounded-[28px] p-7 transition-all"
              >
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-emerald-500">
                  {s.step}
                </span>

                <h3 className="mt-5 text-lg font-semibold text-main">
                  {s.title}
                </h3>

                <p className="mt-3 text-sm text-muted leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="app-footer px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div>
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5"
            >
              <img
                src={logo}
                alt="logo"
                className="h-9 w-auto object-contain"
              />

              <h1 className="font-bold text-xl text-main leading-none">
                del
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-emerald-500">
                  Ai
                </span>
              </h1>
            </div>

            <p className="text-muted text-sm mt-1">
              Voice AI assistant for websites
            </p>
          </div>

          <p className="text-muted text-sm">
            © {new Date().getFullYear()} delAi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
