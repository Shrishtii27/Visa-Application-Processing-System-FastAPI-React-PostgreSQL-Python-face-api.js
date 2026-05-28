import { Check, Globe2, FileUp, ScanSearch, FileSignature, FolderOpen, Camera, ScanFace, FileCheck2 } from "lucide-react";

const STEPS = [
  { label: "Country", icon: Globe2 },
  { label: "Passport", icon: FileUp },
  { label: "Scan Result", icon: ScanSearch },
  { label: "Verify Form", icon: FileSignature },
  { label: "Documents", icon: FolderOpen },
  { label: "Camera", icon: Camera },
  { label: "Face Match", icon: ScanFace },
  { label: "Result", icon: FileCheck2 },
];

export function StepProgress({ current }) {
  return (
    <div className="w-full px-4 pt-6 sm:px-8 lg:px-12 z-50">
      {/* Premium Glassmorphic Container */}
      <div className="relative mx-auto overflow-x-auto rounded-[2rem] border border-white/60 bg-white/50 p-4 pb-10 sm:p-5 sm:pb-12 shadow-[0_20px_40px_-15px_rgba(34,52,143,0.08)] backdrop-blur-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <ol className="flex items-center justify-between min-w-max w-full gap-2 px-2 sm:px-4">
          {STEPS.map((stepData, i) => {
            const step = i + 1;
            const done = step < current;
            const active = step === current;
            const Icon = stepData.icon;

            return (
              <li key={stepData.label} className={`flex items-center ${step !== STEPS.length ? "flex-1" : ""}`}>
                
                {/* Step Item */}
                <div className={`relative flex flex-col items-center gap-2.5 transition-all duration-500 ease-out group ${active ? "scale-110" : "hover:scale-105"}`}>
                  
                  {/* Icon Square/Circle */}
                  <div className={`relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 ${
                    done
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_8px_16px_-6px_rgba(16,185,129,0.6)]"
                      : active
                        ? "bg-gradient-to-br from-[#22348f] to-[#3a54d6] text-white shadow-[0_12px_24px_-8px_rgba(34,52,143,0.7)] ring-4 ring-[#22348f]/15"
                        : "bg-white text-slate-400 border border-slate-200/60 shadow-sm"
                  }`}>
                    {done ? (
                      <Check className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3] animate-in zoom-in duration-300" />
                    ) : (
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${active ? "stroke-[2.5]" : "stroke-2"}`} />
                    )}
                    
                    {/* Active Soft Pulse Animation */}
                    {active && (
                      <span className="absolute inset-0 -z-10 animate-ping rounded-2xl bg-[#22348f]/20 opacity-75 duration-1000" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`absolute -bottom-7 sm:-bottom-8 w-max text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 ${
                      done ? "text-emerald-600" : active ? "text-[#22348f]" : "text-slate-400/80 font-bold"
                    }`}
                  >
                    {stepData.label}
                  </span>
                </div>

                {/* Connector Line */}
                {step < STEPS.length && (
                  <div className="flex-1 mx-3 sm:mx-5 h-[3px] rounded-full overflow-hidden bg-slate-200/50 relative">
                     {/* Filled gradient line */}
                     <div className={`absolute inset-0 h-full transition-all duration-1000 ease-out ${
                       done ? "w-full bg-gradient-to-r from-teal-400 to-emerald-400" : "w-0"
                     }`} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}