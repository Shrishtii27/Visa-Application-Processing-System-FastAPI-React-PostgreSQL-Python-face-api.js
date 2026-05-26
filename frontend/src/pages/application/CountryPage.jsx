import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";

const COUNTRIES = [
  "India",
  "Bangladesh",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
];

const PURPOSES = [
  { id: "kyc", label: "Banking KYC", desc: "Open accounts, comply with regulations." },
  { id: "travel", label: "Travel Verification", desc: "Cross-border travel and visa workflows." },
  { id: "auth", label: "Identity Authentication", desc: "Secure access for digital services." },
];

export function CountryPage() {
  const navigate = useNavigate();
  const [country, setCountry] = useState("");
  const [purpose, setPurpose] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customCountry, setCustomCountry] = useState("");

  return (
    <>
      <StepProgress current={1} />
      <SplitLayout
        image="/assets/globe-passport.jpg"
        imageAlt="Globe with passport"
        eyebrow="Step 1"
        title="Country & Purpose"
        subtitle="Tell us where and why you need verification."
      >
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Select Country</span>
            <select
              value={customMode ? "__other__" : country}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "__other__") {
                  setCustomMode(true);
                  setCountry("");
                } else {
                  setCustomMode(false);
                  setCountry(value);
                  setCustomCountry("");
                }
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#ff7a3d] focus:ring-2 focus:ring-[#ff7a3d]/30"
            >
              <option value="">- Choose -</option>
              {COUNTRIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="__other__">Other (not listed)</option>
            </select>
            {customMode && (
              <input
                value={customCountry}
                onChange={(event) => {
                  const value = event.target.value;
                  setCustomCountry(value);
                  setCountry(value.trim());
                }}
                placeholder="Enter your country name"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#ff7a3d] focus:ring-2 focus:ring-[#ff7a3d]/30"
              />
            )}
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium">Select Purpose</span>
            <div className="grid gap-3">
              {PURPOSES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPurpose(item.id)}
                  className={[
                    "rounded-xl border p-4 text-left transition",
                    purpose === item.id
                      ? "border-[#ff7a3d] bg-[#ff7a3d]/5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
                      : "border-slate-200 bg-white hover:border-[#ff7a3d]/50",
                  ].join(" ")}
                >
                  <div className="font-semibold text-[#18246f]">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!country || !purpose}
            onClick={() => navigate("/upload")}
            className="h-11 w-full rounded-xl bg-[#22348f] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b] disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </SplitLayout>
    </>
  );
}
