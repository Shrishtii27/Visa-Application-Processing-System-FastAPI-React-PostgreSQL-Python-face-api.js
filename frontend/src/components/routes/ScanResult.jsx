import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SplitLayout } from "@/components/SplitLayout";
import img from "@/assets/ai-processing.jpg";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/scan-result")({ component: ScanResultPage });

function ScanResultPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "ARYAN SHARMA", passport: "P1234567", dob: "1995-04-12", expiry: "2031-08-20", nationality: "Indian",
  });
  const lowConfidence = new Set(["passport", "expiry"]);
  const fields = [
    { key: "name", label: "Full Name" },
    { key: "passport", label: "Passport Number" },
    { key: "dob", label: "Date of Birth" },
    { key: "expiry", label: "Expiry Date" },
    { key: "nationality", label: "Nationality" },
  ];

  return (
    <>
      <SplitLayout image={img} imageAlt="AI processing passport data" eyebrow="Step 3" title="Scan Result" subtitle="Review extracted data. Highlighted fields have low confidence — please verify.">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
          {fields.map((f) => {
            const low = lowConfidence.has(f.key);
            return (
              <label key={f.key} className="block">
                <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
                  {f.label}
                  {low && <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning"><AlertCircle className="h-3 w-3" /> Low confidence</span>}
                </span>
                <input
                  value={data[f.key]}
                  onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                  className={[
                    "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30",
                    low ? "border-warning/60 bg-warning/5" : "border-border",
                  ].join(" ")}
                />
              </label>
            );
          })}
          <button
            onClick={() => navigate({ to: "/verify-form" })}
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
          >
            Confirm & Continue
          </button>
        </div>
      </SplitLayout>
    </>
  );
}