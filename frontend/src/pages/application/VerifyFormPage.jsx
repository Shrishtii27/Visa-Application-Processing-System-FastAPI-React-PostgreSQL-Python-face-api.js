import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";
import { PageLoader } from "../../components/shared/PageLoader";
import { api } from "../../services/api";
import { useApplication } from "../../context/ApplicationContext";
import { CustomSelect } from "../../components/shared/CustomSelect";

const PASSPORT_FIELD_NAMES = [
  "full_name",
  "date_of_birth",
  "passport_number",
  "passport_expiry",
  "expiry_date",
  "nationality",
  "gender",
  "sex"
];

export function VerifyFormPage() {
  const navigate = useNavigate();
  const { applicationId, countryCode, visaTypeId, setRequirements } = useApplication();
  
  const [fields, setFields] = useState([]);
  const [form, setForm] = useState({});
  const [mrzFields, setMrzFields] = useState({});
  const [countries, setCountries] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const visibleFields = fields.filter((f) => !PASSPORT_FIELD_NAMES.includes(f.field_name));

  useEffect(() => {
    if (!applicationId || !countryCode || !visaTypeId) {
      setError("Active application session missing. Please start over.");
      setIsLoading(false);
      return;
    }

    const loadFormInfo = async () => {
      try {
        // 1. Fetch form field config
        const fieldsConfig = await api.get(`/countries/${countryCode}/visa-types/${visaTypeId}/form-fields`);
        setFields(fieldsConfig);

        // 2. Fetch existing form data to prefill if user is resuming
        const savedData = await api.get(`/applications/${applicationId}/form-data`);
        const savedFields = savedData.form_data || {};

        // 3. Fetch passport scan data for prefilling & merging
        let fetchedMrz = {};
        try {
          const appStatus = await api.get(`/applications/${applicationId}/status`);
          fetchedMrz = appStatus.passport_mrz_data?.fields || {};
          setMrzFields(fetchedMrz);
        } catch (err) {
          console.error("Failed to fetch application status for prefill:", err);
        }

        // 4. Fetch country list for dynamic options
        try {
          const countryData = await api.get("/countries");
          setCountries(countryData);
        } catch (err) {
          console.error("Failed to fetch countries list:", err);
        }

        // Initialize form state
        const initialForm = {};
        fieldsConfig.forEach((f) => {
          let val = savedFields[f.field_name];
          
          // Prefill from passport scan if empty or undefined
          if (val === undefined || val === "") {
            if (f.field_name === "full_name") {
              const given = fetchedMrz.given_names || "";
              const sur = fetchedMrz.surname || "";
              val = `${given} ${sur}`.trim();
            } else if (f.field_name === "passport_number") {
              val = fetchedMrz.passport_number;
            } else if (f.field_name === "date_of_birth") {
              val = fetchedMrz.date_of_birth;
            } else if (f.field_name === "passport_expiry" || f.field_name === "expiry_date") {
              val = fetchedMrz.expiry_date;
            } else if (f.field_name === "nationality") {
              val = fetchedMrz.nationality;
            } else if (f.field_name === "gender" || f.field_name === "sex") {
              val = fetchedMrz.sex === "M" ? "Male" : (fetchedMrz.sex === "F" ? "Female" : fetchedMrz.sex);
            }
          }

          initialForm[f.field_name] = val !== undefined && val !== null ? val : (f.field_type === "boolean" ? false : "");
        });
        setForm(initialForm);

      } catch (err) {
        console.error(err);
        setError("Failed to load application form fields.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFormInfo();
  }, [applicationId, countryCode, visaTypeId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setValidationErrors({});
    try {
      // Merge passport scan data into form before submitting
      const fullPayload = { ...form };
      
      const given = mrzFields.given_names || "";
      const sur = mrzFields.surname || "";
      
      fullPayload.full_name = fullPayload.full_name || `${given} ${sur}`.trim();
      fullPayload.passport_number = fullPayload.passport_number || mrzFields.passport_number || "";
      fullPayload.date_of_birth = fullPayload.date_of_birth || mrzFields.date_of_birth || "";
      fullPayload.passport_expiry = fullPayload.passport_expiry || mrzFields.expiry_date || "";
      fullPayload.expiry_date = fullPayload.expiry_date || mrzFields.expiry_date || "";
      fullPayload.nationality = fullPayload.nationality || mrzFields.nationality || "";
      fullPayload.gender = fullPayload.gender || (mrzFields.sex === "M" ? "Male" : (mrzFields.sex === "F" ? "Female" : mrzFields.sex || ""));
      fullPayload.sex = fullPayload.sex || mrzFields.sex || "";

      const response = await api.patch(`/applications/${applicationId}/form-data`, {
        form_data: fullPayload
      });

      // Update required documents in context
      if (response && response.requirements) {
        setRequirements(response.requirements);
      }

      navigate("/documents");
    } catch (err) {
      console.error(err);
      // If error message is from validation errors dict
      try {
        const parsedError = JSON.parse(err.message);
        if (typeof parsedError === "object") {
          setValidationErrors(parsedError);
        } else {
          setError(err.message || "Validation failed.");
        }
      } catch {
        setError(err.message || "Failed to submit form data.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <StepProgress current={4} />
      <SplitLayout
        image="/assets/indian-passport-closeup.png"
        imageAlt="Verification form with Indian Passport"
        eyebrow="Step 4"
        title="Verification Form"
        subtitle="Add the remaining details needed for the application."
      >
        <form
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
          onSubmit={handleSubmit}
        >
          {error && <div className="text-sm text-red-500">{error}</div>}

          {isLoading ? (
            <PageLoader text="Loading form requirements..." />
          ) : (
            <>
              {visibleFields.map((field) => {
                const hasError = validationErrors[field.field_name];
                
                if (field.field_type === "boolean") {
                  return (
                    <div key={field.field_name} className="block py-1">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!form[field.field_name]}
                          onChange={(e) => setForm({ ...form, [field.field_name]: e.target.checked })}
                          className="h-5 w-5 rounded border-slate-300 text-[#ff7a3d] focus:ring-[#ff7a3d]"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {field.field_label}
                          {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
                        </span>
                      </label>
                      {field.help_text && <p className="mt-1 text-xs text-slate-400">{field.help_text}</p>}
                      {hasError && <p className="mt-1 text-xs text-red-500">{hasError}</p>}
                    </div>
                  );
                }

                return (
                  <label key={field.field_name} className="block">
                    <span className="mb-1.5 block text-sm font-medium">
                      {field.field_label}
                      {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
                    </span>
                    
                    {field.field_type === "dropdown" ? (
                      (() => {
                        let selectOptions = [];
                        if (field.field_name === "nationality") {
                          selectOptions = countries.map((c) => ({
                            value: c.country_code,
                            label: `${c.country_name} ${c.flag_emoji || ""}`.trim()
                          }));
                        } else {
                          const rawOptions = field.options && field.options.length > 0 ? field.options : [];
                          selectOptions = rawOptions.map((opt) => {
                            if (typeof opt === "object" && opt !== null) {
                              return { value: opt.value, label: opt.label };
                            }
                            return { value: opt, label: opt };
                          });
                        }

                        return (
                          <CustomSelect
                            value={form[field.field_name] ?? ""}
                            onChange={(val) => setForm({ ...form, [field.field_name]: val })}
                            placeholder="- Choose Option -"
                            options={selectOptions}
                          />
                        );
                      })()
                    ) : (
                      <input
                        type={field.field_type === "number" ? "number" : field.field_type === "date" ? "date" : "text"}
                        value={form[field.field_name] ?? ""}
                        placeholder={field.placeholder || ""}
                        onChange={(e) => setForm({ ...form, [field.field_name]: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#ff7a3d] focus:ring-2 focus:ring-[#ff7a3d]/30"
                      />
                    )}

                    {field.help_text && <p className="mt-1 text-xs text-slate-400">{field.help_text}</p>}
                    {hasError && <p className="mt-1 text-xs text-red-500">{hasError}</p>}
                  </label>
                );
              })}

              <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="flex h-11 w-1/3 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-2/3 items-center justify-center gap-2 rounded-xl bg-[#22348f] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Continue to Documents"
                )}
              </button>
            </div>
            </>
          )}
        </form>
      </SplitLayout>
    </>
  );
}
