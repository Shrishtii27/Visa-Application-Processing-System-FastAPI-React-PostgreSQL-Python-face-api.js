import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, User, Hash, Calendar, Flag, ScanFace, CheckCircle2, ArrowRight } from "lucide-react";
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
    { key: "surname", label: "Surname", icon: User, colSpan: 1 },
    { key: "given_names", label: "Given Names", icon: User, colSpan: 1 },
    { key: "passport_number", label: "Passport Number", icon: Hash, colSpan: 2 },
    { key: "date_of_birth", label: "Date of Birth", icon: Calendar, colSpan: 1 },
    { key: "expiry_date", label: "Expiry Date", icon: Calendar, colSpan: 1 },
    { key: "nationality", label: "Nationality", icon: Flag, colSpan: 1 },
    { key: "sex", label: "Sex (M/F)", icon: User, colSpan: 1 },
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
        image="/assets/ai_passport_scan.png"
        imageAlt="AI passport data extraction and verification"
        eyebrow="Step 3"
        title="Scan Result"
        subtitle="Review extracted data. Highlighted fields have low confidence - please verify."
      >
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] relative overflow-hidden">
          {/* Decorative background element */}
          <div className="pointer-events-none absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-emerald-50 opacity-60 blur-2xl"></div>

          <div className="relative mb-2 flex items-center justify-between border-b border-slate-100 pb-4">
             <div>
               <h3 className="flex items-center gap-2 text-lg font-bold text-[#18246f]">
                 <ScanFace className="h-5 w-5 text-[#ff7a3d]" />
                 Extracted Data
               </h3>
               <p className="mt-1 text-xs text-slate-500">Please verify the information below before proceeding.</p>
             </div>
             <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
               <CheckCircle2 className="h-3.5 w-3.5" />
               Scanned
             </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
               <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
               <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff7a3d]" />
              <span className="text-sm font-medium">Processing secure data...</span>
            </div>
          ) : (
            <div className="relative space-y-5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {fields.map((field) => {
                  const low = lowConfidenceFields.has(field.key);
                  const Icon = field.icon;
                  return (
                    <div key={field.key} className={["block group", field.colSpan === 2 ? "col-span-2" : "col-span-1"].join(" ")}>
                      <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600 transition-colors group-focus-within:text-[#22348f]">
                        {field.label}
                        {low && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 animate-pulse uppercase tracking-wider">
                            <AlertCircle className="h-3 w-3" />
                            Verify
                          </span>
                        )}
                      </span>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 transition-colors group-focus-within:text-[#ff7a3d]">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <input
                          value={data[field.key]}
                          onChange={(event) =>
                            setData({ ...data, [field.key]: event.target.value })
                          }
                          className={[
                            "h-10 w-full rounded-lg border pl-8 pr-3 text-sm font-medium outline-none transition-all focus:ring-2",
                            low 
                              ? "border-amber-300 bg-amber-50/40 text-amber-900 focus:border-amber-400 focus:ring-amber-200" 
                              : "border-slate-200 bg-slate-50/50 text-slate-800 focus:border-[#ff7a3d] focus:bg-white focus:ring-[#ff7a3d]/20",
                          ].join(" ")}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 border-t border-slate-100 pt-5">
                <button
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  className="flex h-12 w-1/3 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="group flex h-12 w-2/3 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#22348f] to-[#18246f] text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:from-[#1b2d7b] hover:to-[#121b54] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      Confirm and Continue
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </SplitLayout>
    </>
  );
}
