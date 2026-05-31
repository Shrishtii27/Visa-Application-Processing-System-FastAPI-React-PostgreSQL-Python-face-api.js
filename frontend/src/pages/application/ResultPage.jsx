import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";
import { PageLoader } from "../../components/shared/PageLoader";
import { useApplication } from "../../context/ApplicationContext";
import { api } from "../../services/api";

export function ResultPage() {
  const { applicationId } = useApplication();
  const [appStatus, setAppStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applicationId) {
      setError("No active application found.");
      setLoading(false);
      return;
    }

    api.get(`/applications/${applicationId}/status`)
      .then((data) => {
        setAppStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch status:", err);
        setError("Failed to load final result.");
        setLoading(false);
      });
  }, [applicationId]);

  if (loading) {
    return (
      <>
        <StepProgress current={8} />
        <SplitLayout
          image="/assets/ai-processing.jpg"
          imageAlt="Loading result"
          eyebrow="Final Result"
          title="Loading..."
          subtitle="Fetching your final verification status."
        >
          <PageLoader text="Loading your results..." />
        </SplitLayout>
      </>
    );
  }

  if (error || !appStatus) {
    return (
      <>
        <StepProgress current={8} />
        <SplitLayout
          image="/assets/ai-processing.jpg"
          imageAlt="Error"
          eyebrow="Final Result"
          title="Error Loading Result"
          subtitle="We couldn't retrieve your final status."
        >
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <XCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
            <p className="font-bold text-red-700">{error}</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Back to Home
            </Link>
          </div>
        </SplitLayout>
      </>
    );
  }

  const { status, face_score, passport_mrz_data, step } = appStatus;
  const scorePercent = face_score != null ? Math.round(face_score * 100) : null;

  const config = {
    approved: {
      title: "Credentials Matched",
      bgClass: "bg-[#dcfce7]",
      iconBg: "bg-[#15803d]",
      icon: <CheckCircle2 className="h-8 w-8" />,
      faceMatchText: "Matched",
      finalStatusText: "Approved",
      finalStatusColor: "text-[#15803d]"
    },

    rejected: {
      title: "Credentials Not Matched",
      bgClass: "bg-[#fee2e2]",
      iconBg: "bg-[#b91c1c]",
      icon: <XCircle className="h-8 w-8" />,
      faceMatchText: "Not Matched",
      finalStatusText: "Rejected",
      finalStatusColor: "text-[#b91c1c]"
    }
  }[status] || {
    title: "Status Pending",
    bgClass: "bg-slate-100",
    iconBg: "bg-slate-500",
    icon: <Loader2 className="h-8 w-8 animate-spin" />,
    faceMatchText: "Pending",
    finalStatusText: "Pending",
    finalStatusColor: "text-slate-500"
  };

  // Dynamically determine checklist validations based on backend state
  const passportStatus = passport_mrz_data ? "Verified" : "Pending";
  const documentsStatus = (step === "completed" || step === "package_generation" || step === "face_verification") 
    ? "Verified" 
    : "Pending";

  return (
    <>
      <StepProgress current={8} />
      <SplitLayout
        image="/assets/ai-processing.jpg"
        imageAlt="Verification complete"
        eyebrow="Final Result"
        title={config.title}
        subtitle="Outcome of your visa verification based on passport, documents and face match."
      >
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div
            className={[
              "flex flex-col gap-4 rounded-xl p-6",
              config.bgClass,
            ].join(" ")}
          >
            <div className="flex items-center gap-4">
              <span
                className={[
                  "grid h-14 w-14 place-items-center rounded-full text-white",
                  config.iconBg,
                ].join(" ")}
              >
                {config.icon}
              </span>
              <div>
                <p className="text-xl font-bold text-[#18246f]">
                  {config.title}
                </p>
              </div>
            </div>

            {/* Match score meter */}
            {scorePercent != null && scorePercent > 0 && (
              <div className="rounded-xl border border-white/40 bg-white/50 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Face Match Score
                  </span>
                  <span className="text-2xl font-bold text-[#18246f]">
                    {scorePercent}%
                  </span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-green-500 transition-[width] duration-1000 ease-out"
                    style={{ width: `${scorePercent}%` }}
                  />
                  {/* Threshold markers */}
                  <div
                    className="absolute top-0 h-full w-px bg-red-400"
                    style={{ left: "65%" }}
                    title="65% — Manual Review"
                  />
                  <div
                    className="absolute top-0 h-full w-px bg-emerald-500"
                    style={{ left: "82%" }}
                    title="82% — Approved"
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
                  <span>0%</span>
                  <span className="text-red-500 font-medium">65%</span>
                  <span className="text-emerald-600 font-medium">82%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </div>

          <dl className="grid gap-3 text-sm mb-4">
            {[
              ["Passport Scan", passportStatus],
              ["Document Validation", documentsStatus],
              ["Face Match", config.faceMatchText],
              ["Final Status", config.finalStatusText],
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
                      ? config.finalStatusColor
                      : "text-[#18246f]",
                  ].join(" ")}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="pt-2 border-t border-slate-200 flex flex-col gap-3">
            {status === "approved" ? (
              <div className="block w-full rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)]">
                Approved
              </div>
            ) : status === "rejected" ? (
              <div className="block w-full rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)]">
                Rejected
              </div>
            ) : null}
            <Link
              to="/"
              className="block rounded-xl bg-[#22348f] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </SplitLayout>
    </>
  );
}
