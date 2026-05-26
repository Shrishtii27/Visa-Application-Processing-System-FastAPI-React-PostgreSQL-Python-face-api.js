import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SplitLayout } from "@/components/SplitLayout";
import img from "@/assets/globe-passport.jpg";

export const Route = createFileRoute("/country")({ component: CountryPage });

const COUNTRIES = ["India", "Bangladesh", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan"];

const PURPOSES = [
  { id: "kyc", label: "Banking KYC", desc: "Open accounts, comply with regulations." },
  { id: "travel", label: "Travel Verification", desc: "Cross-border travel & visa workflows." },
  { id: "auth", label: "Identity Authentication", desc: "Secure access for digital services." },
];

function CountryPage() {
  const navigate = useNavigate();
  const [country, setCountry] = useState("");
  const [purpose, setPurpose] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customCountry, setCustomCountry] = useState("");

  return (
    <>
      <SplitLayout image={img} imageAlt="Globe with passport" eyebrow="Step 1" title="Country & Purpose" subtitle="Tell us where and why you need verification.">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Select Country</span>
            <select
              value={customMode ? "__other__" : country}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__other__") { setCustomMode(true); setCountry(""); }
                else { setCustomMode(false); setCountry(v); setCustomCountry(""); }
              }}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            >
              <option value="">— Choose —</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="__other__">Other (not listed)</option>
            </select>
            {customMode && (
              <input
                value={customCountry}
                onChange={(e) => { setCustomCountry(e.target.value); setCountry(e.target.value.trim()); }}
                placeholder="Enter your country name"
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
            )}
          </label>
          <div>
            <span className="mb-2 block text-sm font-medium">Select Purpose</span>
            <div className="grid gap-3">
              {PURPOSES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPurpose(p.id)}
                  className={[
                    "rounded-xl border p-4 text-left transition",
                    purpose === p.id ? "border-accent bg-accent/5 shadow-soft" : "border-border bg-background hover:border-accent/50",
                  ].join(" ")}
                >
                  <div className="font-semibold text-foreground">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <button
            disabled={!country || !purpose}
            onClick={() => navigate({ to: "/upload" })}
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </SplitLayout>
    </>
  );
}