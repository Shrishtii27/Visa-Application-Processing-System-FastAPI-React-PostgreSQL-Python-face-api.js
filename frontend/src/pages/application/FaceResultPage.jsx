import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";

export function FaceResultPage() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const final = 87;

  useEffect(() => {
    let value = 0;
    const interval = setInterval(() => {
      value += 2;
      setScore(Math.min(value, final));
      if (value >= final) {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, []);

  const status =
    score >= 82
      ? { label: "Verified", box: "bg-[#dcfce7] border-[#86efac]", text: "text-[#15803d]" }
      : score >= 65
        ? {
            label: "Manual Review",
            box: "bg-[#fef3c7] border-[#fcd34d]",
            text: "text-[#b45309]",
          }
        : { label: "Failed", box: "bg-[#fee2e2] border-[#fca5a5]", text: "text-[#b91c1c]" };

  return (
    <>
      <StepProgress current={7} />
      <SplitLayout
        image="/assets/ai-processing.jpg"
        imageAlt="AI verification"
        eyebrow="Step 7"
        title="Face Match Result"
        subtitle="Comparison between passport photo and live capture."
      >
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-medium text-slate-500">Match Score</span>
              <span className="text-3xl font-bold text-[#18246f]">{score}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ff7a3d] to-[#22348f] transition-[width] duration-300"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${status.box}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Status
            </p>
            <p className={`mt-1 text-xl font-bold ${status.text}`}>{status.label}</p>
            <p className="mt-1 text-xs text-slate-500">
              >= 82% Verified - 65-82% Manual Review - &lt; 65% Failed
            </p>
          </div>

          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.sessionStorage.setItem("visa.matchScore", String(final));
              }
              navigate("/result");
            }}
            className="h-11 w-full rounded-xl bg-[#22348f] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b]"
          >
            View Final Result
          </button>
        </div>
      </SplitLayout>
    </>
  );
}
