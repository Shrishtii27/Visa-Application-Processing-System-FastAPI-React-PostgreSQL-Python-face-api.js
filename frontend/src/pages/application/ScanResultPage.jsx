import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";
import { api } from "../../services/api";
import { useApplication } from "../../context/ApplicationContext";

export function ScanResultPage() {
  const navigate = useNavigate();
  const { applicationId } = useApplication();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lowConfidenceFields, setLowConfidenceFields] = useState(new Set());

  const [data, setData] = useState({
    surname: "",
    given_names: "",
    passport_number: "",
    date_of_birth: "",
    expiry_date: "",
    nationality: "",
    sex: ""
  });

  const fields = [
    { key: "surname", label: "Surname" },
    { key: "given_names", label: "Given Names" },
    { key: "passport_number", label: "Passport Number" },
    { key: "date_of_birth", label: "Date of Birth (YYYY-MM-DD)" },
    { key: "expiry_date", label: "Expiry Date (YYYY-MM-DD)" },
    { key: "nationality", label: "Nationality (3-Letter Code)" },
    { key: "sex", label: "Sex (M/F)" },
  ];

  useEffect(() => {
    if (!applicationId) {
      setError("No active application session found.");
      setIsLoading(false);
      return;
    }

    const fetchScanData = async () => {
      try {
        const res = await api.get(`/applications/${applicationId}/status`);
        const mrz = res.passport_mrz_data || {};
        const fieldsData = mrz.fields || {};
        
        setData({
          surname: fieldsData.surname || "",
          given_names: fieldsData.given_names || "",
          passport_number: fieldsData.passport_number || "",
          date_of_birth: fieldsData.date_of_birth || "",
          expiry_date: fieldsData.expiry_date || "",
          nationality: fieldsData.nationality || "",
          sex: fieldsData.sex || ""
        });

        if (mrz.low_confidence_fields) {
          setLowConfidenceFields(new Set(mrz.low_confidence_fields));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch scan results.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchScanData();
  }, [applicationId]);

  const handleConfirm = async () => {
    if (!applicationId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(`/applications/${applicationId}/passport/confirm`, {
        surname: data.surname,
        given_names: data.given_names,
        passport_number: data.passport_number,
        date_of_birth: data.date_of_birth,
        expiry_date: data.expiry_date,
        nationality: data.nationality,
        sex: data.sex
      });

      navigate("/verify-form");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to confirm passport details.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {error && <div className="text-sm text-red-500">{error}</div>}

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff7a3d]" />
            </div>
          ) : (
            <>
              {fields.map((field) => {
                const low = lowConfidenceFields.has(field.key);
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
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  className="flex h-11 w-1/3 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex h-11 w-2/3 items-center justify-center gap-2 rounded-xl bg-[#22348f] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm and Continue"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </SplitLayout>
    </>
  );
}
