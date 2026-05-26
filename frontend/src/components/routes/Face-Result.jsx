import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SplitLayout } from "@/components/SplitLayout";
import img from "@/assets/ai-processing.jpg";

export const Route = createFileRoute("/face-result")({ component: FaceResultPage });

function FaceResultPage() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const final = 87;

  useEffect(() => {
    let v = 0;
    const id = setInterval(() => { v += 2; setScore(Math.min(v, final)); if (v >= final) clearInterval(id); }, 25);
    return () => clearInterval(id);
  }, []);

  const status =
    score >= 82
      ? { label: "Verified", box: "bg-success/10 border-success/30", text: "text-success" }
      : score >= 65
        ? { label: "Manual Review", box: "bg-warning/10 border-warning/40", text: "text-warning" }
        : { label: "Failed", box: "bg-destructive/10 border-destructive/30", text: "text-destructive" };

  return (
    <>
      <SplitLayout image={img} imageAlt="AI verification" eyebrow="Step 7" title="Face Match Result" subtitle="Comparison between passport photo and live capture.">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-medium text-muted-foreground">Match Score</span>
              <span className="text-3xl font-bold text-foreground">{score}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-[width] duration-300" style={{ width: `${score}%` }} />
            </div>
          </div>
          <div className={`rounded-xl border p-4 ${status.box}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
            <p className={`mt-1 text-xl font-bold ${status.text}`}>{status.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              ≥ 82% Verified · 65–82% Manual Review · &lt; 65% Failed
            </p>
          </div>
          <button
            onClick={() => {
              if (typeof window !== "undefined") sessionStorage.setItem("visa.matchScore", String(final));
              navigate({ to: "/result" });
            }}
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
          >
            View Final Result
          </button>
        </div>
      </SplitLayout>
    </>
  );
}