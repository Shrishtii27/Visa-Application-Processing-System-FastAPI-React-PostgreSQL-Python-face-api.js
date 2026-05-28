import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";
import { CustomSelect } from "../../components/shared/CustomSelect";
import { api } from "../../services/api";
import { useApplication } from "../../context/ApplicationContext";
import { Briefcase, Plane, GraduationCap, MapPin, Loader2, ArrowRight } from "lucide-react";

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
        image="/assets/ai_globe_travel.png"
        imageAlt="Global futuristic travel network"
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
                  {visaTypes.map((visa) => {
                    const isSelected = selectedVisaId === visa.id;
                    const nameLower = visa.visa_name.toLowerCase();
                    const Icon = nameLower.includes("business") || nameLower.includes("work") ? Briefcase 
                                : nameLower.includes("student") || nameLower.includes("study") ? GraduationCap 
                                : Plane;
                    
                    return (
                    <button
                      key={visa.id}
                      onClick={() => setSelectedVisaId(visa.id)}
                      className={[
                        "group relative flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200",
                        isSelected
                          ? "border-[#22348f] bg-gradient-to-r from-blue-50 to-[#f8f9ff] shadow-md shadow-blue-900/5 ring-1 ring-[#22348f]/10"
                          : "border-slate-200 bg-white hover:border-[#ff7a3d]/40 hover:bg-slate-50 hover:shadow-sm",
                      ].join(" ")}
                    >
                      <div className={[
                        "flex shrink-0 items-center justify-center rounded-lg p-2.5 transition-colors",
                        isSelected ? "bg-[#22348f] text-white" : "bg-slate-100 text-slate-500 group-hover:bg-[#ff7a3d]/10 group-hover:text-[#ff7a3d]"
                      ].join(" ")}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 pr-6">
                        <div className={[
                          "font-bold transition-colors", 
                          isSelected ? "text-[#18246f]" : "text-slate-700"
                        ].join(" ")}>{visa.visa_name}</div>
                        <div className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed" title={visa.description}>
                          {visa.description || "Select this purpose for your application."}
                        </div>
                      </div>
                      
                      {isSelected && (
                         <div className="absolute right-4 top-1/2 -translate-y-1/2">
                           <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22348f]">
                             <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                               <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                             </svg>
                           </div>
                         </div>
                      )}
                    </button>
                  )})}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-8 border-t border-slate-100 pt-6">
            <button
              onClick={() => navigate(-1)}
              className="flex h-12 w-1/3 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
            >
              Back
            </button>
            <button
              disabled={!selectedCountry || !selectedVisaId || isSubmitting}
              onClick={handleContinue}
              className="group flex h-12 w-2/3 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#22348f] to-[#18246f] text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:from-[#1b2d7b] hover:to-[#121b54] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </SplitLayout>
    </>
  );
}
