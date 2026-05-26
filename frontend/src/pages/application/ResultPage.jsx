import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";

export function ResultPage() {
  const [score, setScore] = useState(null);

  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? window.sessionStorage.getItem("visa.matchScore") : null;
    setScore(raw ? Number(raw) : 87);
  }, []);

  const matched = (score ?? 0) >= 82;

  return (
    <>
      <StepProgress current={8} />
      <SplitLayout
        image="/assets/ai-processing.jpg"
        imageAlt="Verification complete"
        eyebrow="Final Result"
        title={matched ? "Credentials Matched" : "Credentials Not Matched"}
        subtitle="Outcome of your visa verification based on passport, documents and face match."
      >
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div
            className={[
              "flex items-center gap-4 rounded-xl p-4",
              matched ? "bg-[#dcfce7]" : "bg-[#fee2e2]",
            ].join(" ")}
          >
            <span
              className={[
                "grid h-14 w-14 place-items-center rounded-full",
                matched ? "bg-[#15803d] text-white" : "bg-[#b91c1c] text-white",
              ].join(" ")}
            >
              {matched ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
            </span>
            <div>
              <p className="text-xl font-bold text-[#18246f]">
                {matched ? "Credentials Matched" : "Credentials Not Matched"}
              </p>
              <p className="text-sm text-slate-500">
                Face match score: <span className="font-semibold">{score ?? "—"}%</span>
              </p>
            </div>
          </div>

          <dl className="grid gap-3 text-sm">
            {[
              ["Passport Scan", "Verified"],
              ["Document Validation", "Verified"],
              ["Face Match", matched ? "Matched" : "Not Matched"],
              ["Final Status", matched ? "Approved" : "Rejected"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between border-b border-slate-200 pb-2 last:border-0"
              >
                <dt className="text-slate-500">{label}</dt>
                <dd
                  className={[
                    "font-semibold",
                    label === "Final Status"
                      ? matched
                        ? "text-[#15803d]"
                        : "text-[#b91c1c]"
                      : "text-[#18246f]",
                  ].join(" ")}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <Link
            to="/"
            className="block rounded-xl bg-[#22348f] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b]"
          >
            Back to Home
          </Link>
        </div>
      </SplitLayout>
    </>
  );
}
