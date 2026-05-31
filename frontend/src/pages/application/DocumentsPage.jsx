import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, X, Loader2, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";
import { PageLoader } from "../../components/shared/PageLoader";
import { useApplication } from "../../context/ApplicationContext";
import { api } from "../../services/api";

const DOC_TYPE_TO_PATH = {
  bank_statement: "bank-statement",
  flight_ticket: "flight-ticket",
  hotel_booking: "hotel-booking",
  travel_insurance: "insurance",
  employment_letter: "employment-letter",
  national_id: "national-id",
  photograph: "photograph",
  other: "other"
};

function DropZone({ label, onDrop, disabled }) {
  return (
    <label
      onDragOver={(event) => !disabled && event.preventDefault()}
      onDrop={(event) => {
        if (disabled) return;
        event.preventDefault();
        onDrop(event.dataTransfer.files);
      }}
      className={[
        "flex items-center gap-3 rounded-xl border-2 border-dashed p-4 transition",
        disabled
          ? "border-slate-100 bg-slate-50 cursor-not-allowed"
          : "border-slate-200 bg-white/50 cursor-pointer hover:border-[#ff7a3d] hover:bg-[#ff7a3d]/5"
      ].join(" ")}
    >
      <span className={[
        "grid h-10 w-10 place-items-center rounded-lg",
        disabled ? "bg-slate-200 text-slate-400" : "bg-[#ff7a3d]/10 text-[#ff7a3d]"
      ].join(" ")}>
        <Upload className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#18246f]">{label}</p>
        <p className="text-xs text-slate-500">
          {disabled ? "Document already uploaded" : "Drag and drop or click to upload"}
        </p>
      </div>
      {!disabled && <input type="file" className="hidden" onChange={(event) => onDrop(event.target.files)} />}
    </label>
  );
}

export function DocumentsPage() {
  const navigate = useNavigate();
  const { applicationId, requirements } = useApplication();
  
  // uploadStates mapping: requirement_id -> { loading, error, document_id, file_name, status, validation_notes, bs_validation }
  const [uploadStates, setUploadStates] = useState({});
  const [isInitializing, setIsInitializing] = useState(true);

  // Filter out passport document type (already processed in Step 2)
  const filteredRequirements = (requirements || []).filter(
    (req) => req.document_type !== "passport"
  );

  // Fallback defaults if no requirements loaded
  const displayRequirements = filteredRequirements.length > 0 
    ? filteredRequirements 
    : [
        { id: "default-id", document_label: "Government ID", document_type: "national_id", is_mandatory: true },
        { id: "default-address", document_label: "Address Proof", document_type: "other", is_mandatory: true }
      ];

  // Fetch already uploaded documents on load to restore state
  useEffect(() => {
    if (!applicationId) {
      setIsInitializing(false);
      return;
    }

    const fetchUploaded = async () => {
      try {
        const uploadedDocs = await api.get(`/applications/${applicationId}/documents`);
        const initialStates = {};
        
        uploadedDocs.forEach((doc) => {
          // Find matching requirement id
          const req = displayRequirements.find((r) => r.document_type === doc.document_type);
          if (req) {
            initialStates[req.id] = {
              loading: false,
              error: null,
              document_id: doc.id,
              file_name: doc.file_name || "Uploaded File",
              status: doc.status,
              validation_notes: doc.validation_notes,
              bs_validation: doc.extracted_data && doc.is_bank_statement ? {
                name_match: doc.status === "valid",
                name_confidence: doc.extracted_data.ocr_confidence || 1.0,
                statement_period: doc.extracted_data.from_date ? `${doc.extracted_data.from_date} - ${doc.extracted_data.to_date}` : "",
                is_recent_enough: doc.status === "valid",
                balance_detected: doc.bank_statement_min_balance,
                currency: doc.extracted_data.currency || "USD",
                warnings: doc.validation_notes ? [doc.validation_notes] : []
              } : null
            };
          }
        });
        setUploadStates(initialStates);
      } catch (err) {
        console.error("Failed to restore upload states:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchUploaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const handleUpload = async (pickedFiles, req) => {
    if (!pickedFiles || pickedFiles.length === 0) return;
    const file = pickedFiles[0];
    const reqId = req.id;

    setUploadStates((prev) => ({
      ...prev,
      [reqId]: { ...prev[reqId], loading: true, error: null }
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const pathParam = DOC_TYPE_TO_PATH[req.document_type] || "other";
      const response = await api.fetch(`/applications/${applicationId}/documents/${pathParam}`, {
        method: "POST",
        body: formData
      });

      setUploadStates((prev) => ({
        ...prev,
        [reqId]: {
          loading: false,
          error: null,
          document_id: response.document_id,
          file_name: file.name,
          status: response.status,
          validation_notes: response.validation_notes,
          bs_validation: response.bank_statement_validation
        }
      }));
    } catch (err) {
      console.error(err);
      setUploadStates((prev) => ({
        ...prev,
        [reqId]: { ...prev[reqId], loading: false, error: err.message || "Upload failed." }
      }));
    }
  };

  const handleRemove = async (req) => {
    const reqId = req.id;
    const state = uploadStates[reqId];
    if (!state || !state.document_id) return;

    setUploadStates((prev) => ({
      ...prev,
      [reqId]: { ...prev[reqId], loading: true }
    }));

    try {
      await api.delete(`/applications/${applicationId}/documents/${state.document_id}`);
      setUploadStates((prev) => {
        const next = { ...prev };
        delete next[reqId];
        return next;
      });
    } catch (err) {
      console.error(err);
      setUploadStates((prev) => ({
        ...prev,
        [reqId]: { ...prev[reqId], loading: false, error: err.message || "Delete failed." }
      }));
    }
  };

  // Check if all mandatory documents have been uploaded
  const mandatoryRequirements = displayRequirements.filter((req) => req.is_mandatory);
  const canContinue = mandatoryRequirements.length > 0 && mandatoryRequirements.every(
    (req) => uploadStates[req.id]?.document_id && uploadStates[req.id]?.status === "valid"
  );

  return (
    <>
      <StepProgress current={5} />
      <SplitLayout
        image="/assets/indian-passport-closeup.png"
        imageAlt="Document verification"
        eyebrow="Step 5"
        title="Upload Supporting Documents"
        subtitle="Upload the required supporting files for your visa application."
      >
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          {isInitializing ? (
            <PageLoader text="Loading required documents..." />
          ) : (
            <>
              {displayRequirements.map((req) => {
                const state = uploadStates[req.id] || {};
                const isUploaded = !!state.document_id;
                const isBankStatement = req.document_type === "bank_statement";

                return (
                  <div key={req.id} className="space-y-2.5 rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                    <DropZone
                      label={`${req.document_label}${req.is_mandatory ? " *" : ""}`}
                      onDrop={(pickedFiles) => handleUpload(pickedFiles, req)}
                      disabled={isUploaded || state.loading}
                    />

                    {state.loading && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading and validating...
                      </div>
                    )}

                    {state.error && (
                      <div className="text-xs text-red-500 font-medium flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {state.error}
                      </div>
                    )}

                    {isUploaded && !state.loading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm">
                          <span className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 text-[#ff7a3d]" />
                            <span className="truncate font-medium">{state.file_name}</span>
                            <span className={[
                              "rounded-md px-2 py-0.5 text-xs font-semibold uppercase",
                              state.status === "valid" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            ].join(" ")}>
                              {state.status}
                            </span>
                          </span>
                          <button
                            onClick={() => handleRemove(req)}
                            className="text-slate-400 hover:text-[#b91c1c] transition"
                            title="Remove document"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Special Bank Statement OCR Validation Feedback */}
                        {isBankStatement && state.bs_validation && (
                          <div className="rounded-lg bg-slate-100/80 p-3 text-xs space-y-1.5 border border-slate-200/50">
                            <h4 className="font-semibold text-[#18246f] flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                              Bank Statement OCR Analysis
                            </h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
                              <div>Name Match: <span className="font-semibold text-slate-800">{state.bs_validation.name_match ? "Matched" : "Mismatch"}</span></div>
                              <div>Confidence: <span className="font-semibold text-slate-800">{Math.round(state.bs_validation.name_confidence * 100)}%</span></div>
                              <div>Period: <span className="font-semibold text-slate-800">{state.bs_validation.statement_period}</span></div>
                              <div>Min Balance: <span className="font-semibold text-slate-800">{state.bs_validation.balance_detected} {state.bs_validation.currency}</span></div>
                            </div>
                            {state.bs_validation.warnings?.length > 0 && (
                              <div className="mt-1 text-amber-700 font-medium flex flex-col gap-0.5">
                                {state.bs_validation.warnings.map((w, idx) => (
                                  <div key={idx} className="flex items-start gap-1">
                                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                                    <span>{w}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex h-11 w-1/3 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  disabled={!canContinue}
                  onClick={() => navigate("/camera")}
                  className="flex h-11 w-2/3 items-center justify-center gap-2 rounded-xl bg-[#22348f] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b] disabled:opacity-50"
                >
                  Continue to Face Verification
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </SplitLayout>
    </>
  );
}
