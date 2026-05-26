import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";

export function ScanResultPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "ARYAN SHARMA",
    passport: "P1234567",
    dob: "1995-04-12",
    expiry: "2031-08-20",
    nationality: "Indian",
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
      <StepProgress current={3} />
      <SplitLayout
        image="/assets/ai-processing.jpg"
        imageAlt="AI processing passport data"
        eyebrow="Step 3"
        title="Scan Result"
        subtitle="Review extracted data. Highlighted fields have low confidence - please verify."
      >
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          {fields.map((field) => {
            const low = lowConfidence.has(field.key);
            return (
              <label key={field.key} className="block">
                <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
                  {field.label}
                  {low && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#b45309]">
                      <AlertCircle className="h-3 w-3" />
                      Low confidence
                    </span>
                  )}
                </span>
                <input
                  value={data[field.key]}
                  onChange={(event) =>
                    setData({ ...data, [field.key]: event.target.value })
                  }
                  className={[
                    "h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:border-[#ff7a3d] focus:ring-2 focus:ring-[#ff7a3d]/30",
                    low ? "border-[#f59e0b]/60 bg-[#fef3c7]/20" : "border-slate-200",
                  ].join(" ")}
                />
              </label>
            );
          })}
          <button
            onClick={() => navigate("/verify-form")}
            className="h-11 w-full rounded-xl bg-[#22348f] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b]"
          >
            Confirm and Continue
          </button>
        </div>
      </SplitLayout>
    </>
  );
}
