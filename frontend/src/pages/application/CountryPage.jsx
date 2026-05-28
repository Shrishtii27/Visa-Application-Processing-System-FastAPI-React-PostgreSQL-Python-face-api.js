import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";
import { CustomSelect } from "../../components/shared/CustomSelect";
import { api } from "../../services/api";
import { useApplication } from "../../context/ApplicationContext";

export function CountryPage() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [visaTypes, setVisaTypes] = useState([]);
  
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedVisaId, setSelectedVisaId] = useState("");
  
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoadingVisas, setIsLoadingVisas] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { 
    setApplicationId, 
    setCountryCode, 
    setVisaTypeId, 
    setApplicantNationality, 
    setRequirements 
  } = useApplication();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await api.get("/countries");
        setCountries(data);
      } catch (err) {
        setError("Failed to load countries");
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      setVisaTypes([]);
      setSelectedVisaId("");
      return;
    }

    const fetchVisaTypes = async () => {
      setIsLoadingVisas(true);
      try {
        const data = await api.get(`/countries/${selectedCountry}/visa-types`);
        setVisaTypes(data);
      } catch (err) {
        setError("Failed to load visa types");
      } finally {
        setIsLoadingVisas(false);
      }
    };
    fetchVisaTypes();
  }, [selectedCountry]);

  const handleContinue = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // 1. Create Application
      const appData = await api.post("/applications", {});
      const appId = appData.id;
      
      setApplicationId(appId);
      setCountryCode(selectedCountry);
      setVisaTypeId(selectedVisaId);
      setApplicantNationality("IND");

      // 2. Update Country & Visa
      // Assuming 'IND' as nationality for now, until OCR extracts it
      const updateData = await api.patch(`/applications/${appId}/country`, {
        country_code: selectedCountry,
        visa_type_id: selectedVisaId,
        applicant_nationality: "IND" 
      });
      
      setRequirements(updateData.requirements);

      
      // 3. Navigate
      navigate("/upload");
    } catch (err) {
      console.error(err);
      setError("Failed to create application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {error && <div className="text-sm text-red-500">{error}</div>}
          
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Select Country</span>
            <CustomSelect
              value={selectedCountry}
              onChange={setSelectedCountry}
              disabled={isLoadingCountries}
              placeholder={isLoadingCountries ? "Loading..." : "- Choose Country -"}
              options={countries.map(c => ({
                value: c.country_code,
                label: `${c.country_name} ${c.flag_emoji || ""}`
              }))}
            />
          </label>

          {selectedCountry && (
            <div>
              <span className="mb-2 block text-sm font-medium">Select Purpose</span>
              {isLoadingVisas ? (
                <div className="text-sm text-slate-500">Loading visa options...</div>
              ) : visaTypes.length === 0 ? (
                <div className="text-sm text-slate-500">No visa options available for this country.</div>
              ) : (
                <div className="grid gap-3">
                  {visaTypes.map((visa) => (
                    <button
                      key={visa.id}
                      onClick={() => setSelectedVisaId(visa.id)}
                      className={[
                        "rounded-xl border p-4 text-left transition",
                        selectedVisaId === visa.id
                          ? "border-[#ff7a3d] bg-[#ff7a3d]/5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
                          : "border-slate-200 bg-white hover:border-[#ff7a3d]/50",
                      ].join(" ")}
                    >
                      <div className="font-semibold text-[#18246f]">{visa.visa_name}</div>
                      <div className="mt-1 text-xs text-slate-500 line-clamp-2" title={visa.description}>
                        {visa.description || "No description available"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate(-1)}
              className="flex h-11 w-1/3 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </button>
            <button
              disabled={!selectedCountry || !selectedVisaId || isSubmitting}
              onClick={handleContinue}
              className="flex h-11 w-2/3 items-center justify-center rounded-xl bg-[#22348f] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b] disabled:opacity-50"
            >
              {isSubmitting ? "Loading..." : "Continue"}
            </button>
          </div>
        </div>
      </SplitLayout>
    </>
  );
}
