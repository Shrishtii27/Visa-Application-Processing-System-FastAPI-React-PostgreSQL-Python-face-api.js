import { ShieldCheck, Plus, Sparkles, Globe, FileCheck2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-152px)] overflow-hidden bg-gradient-to-br from-[#f4f7fb] via-white to-[#eef2ff]">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,_rgba(34,52,143,0.08)_0%,_transparent_70%)]" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,_rgba(255,122,61,0.08)_0%,_transparent_70%)]" />

      {/* Floating dots pattern */}
      <div className="pointer-events-none absolute left-[10%] top-[15%] h-2 w-2 rounded-full bg-[#ff7a3d]/30" style={{ animation: "float 6s ease-in-out infinite" }} />
      <div className="pointer-events-none absolute left-[8%] top-[45%] h-3 w-3 rounded-full bg-[#22348f]/20" style={{ animation: "float 8s ease-in-out infinite 1s" }} />
      <div className="pointer-events-none absolute right-[12%] top-[20%] h-2.5 w-2.5 rounded-full bg-[#22348f]/25" style={{ animation: "float 7s ease-in-out infinite 0.5s" }} />
      <div className="pointer-events-none absolute right-[9%] top-[60%] h-2 w-2 rounded-full bg-[#ff7a3d]/20" style={{ animation: "float 5s ease-in-out infinite 2s" }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div className="relative px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
        {/* Header with entrance animation */}
        <div className="text-center" style={{ animation: "fadeSlideUp 0.6s ease-out" }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#ff7a3d] shadow-sm">
            <Sparkles className="h-4 w-4" />
            Getting Started
          </span>
          <h1 className="mt-5 text-3xl font-bold text-[#18246f] sm:text-4xl lg:text-5xl">
            Welcome to your verification dashboard
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            A quick question to get you started.
          </p>
        </div>

        {/* 3-column layout */}
        <div className="mt-10 grid items-center gap-6 lg:grid-cols-[1fr_minmax(380px,420px)_1fr] lg:gap-4">

          {/* Left image with creative framing */}
          <div className="relative flex justify-center lg:justify-end" style={{ animation: "fadeSlideUp 0.8s ease-out 0.2s both" }}>
            <div className="relative">
              {/* Decorative ring */}
              <div className="absolute -left-4 -top-4 h-[calc(100%+32px)] w-[calc(100%+32px)] rounded-[2rem] border-2 border-dashed border-[#22348f]/10" />
              {/* Gradient backing card */}
              <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#22348f]/5 via-white to-[#ff7a3d]/5 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                <img
                  src="/assets/welcome-passport.png"
                  alt="Passport and boarding pass illustration"
                  className="h-auto w-full max-w-[280px]"
                  style={{ animation: "floatSlow 6s ease-in-out infinite" }}
                />
                {/* Mini info badge */}
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm">
                  <Globe className="h-4 w-4 text-[#22348f]" />
                  <span className="text-xs font-semibold text-[#18246f]">Passport Scan & MRZ Check</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center card — hero focus */}
          <div style={{ animation: "scaleIn 0.7s ease-out 0.1s both" }}>
            <div className="relative rounded-[2rem] border border-slate-200/80 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-8">
              {/* Shimmer border top */}
              <div
                className="absolute inset-x-0 top-0 h-1 rounded-t-[2rem]"
                style={{
                  background: "linear-gradient(90deg, transparent, #22348f, #ff7a3d, transparent)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 3s linear infinite",
                }}
              />

              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#22348f] to-[#1b2d7b] text-white shadow-[0_12px_26px_rgba(34,52,143,0.25)]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-center text-xl font-bold text-[#18246f] sm:text-2xl">
                Do you have an existing passport?
              </h2>
              <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
                We&apos;ll tailor the next steps based on your answer.
              </p>
              <div className="mt-7 flex flex-col gap-3">
                <button
                  onClick={() => navigate("/country")}
                  className="group flex items-center justify-center gap-2 rounded-2xl bg-[#22348f] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1b2d7b] hover:shadow-[0_18px_40px_rgba(34,52,143,0.3)]"
                >
                  <ShieldCheck className="h-4 w-4 transition-transform group-hover:scale-110" /> Yes, Verify Passport
                </button>
              </div>
            </div>
          </div>

          {/* Right image with creative framing */}
          <div className="relative flex justify-center lg:justify-start" style={{ animation: "fadeSlideUp 0.8s ease-out 0.4s both" }}>
            <div className="relative">
              {/* Decorative ring */}
              <div className="absolute -right-4 -top-4 h-[calc(100%+32px)] w-[calc(100%+32px)] rounded-[2rem] border-2 border-dashed border-[#ff7a3d]/10" />
              {/* Gradient backing card */}
              <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#ff7a3d]/5 via-white to-[#22348f]/5 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                <img
                  src="/assets/welcome-verify.png"
                  alt="Secure identity verification illustration"
                  className="h-auto w-full max-w-[280px]"
                  style={{ animation: "floatReverse 7s ease-in-out infinite" }}
                />
                {/* Mini info badge */}
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm">
                  <FileCheck2 className="h-4 w-4 text-[#ff7a3d]" />
                  <span className="text-xs font-semibold text-[#18246f]">Face Scan & ID Verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
