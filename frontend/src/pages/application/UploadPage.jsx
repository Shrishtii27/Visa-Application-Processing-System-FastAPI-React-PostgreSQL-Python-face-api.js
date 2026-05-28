import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Upload } from "lucide-react";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";

import { api } from "../../services/api";
import { useApplication } from "../../context/ApplicationContext";

export function UploadPage() {
  const navigate = useNavigate();
  const { applicationId } = useApplication();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onPick = (pickedFile) => {
    if (!pickedFile) return;
    setFile(pickedFile);
    setPreview(URL.createObjectURL(pickedFile));
    setError(null);
  };

  const scan = async () => {
    if (!applicationId) {
      setError("Application session missing. Please start over.");
      return;
    }
    setScanning(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // 1. Upload passport
      await api.fetch(`/applications/${applicationId}/documents/passport`, {
        method: "POST",
        body: formData,
      });

      // 2. Trigger scan
      await api.post(`/applications/${applicationId}/passport/scan`, {});

      navigate("/scan-result");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to scan passport.");
    } finally {
      setScanning(false);
    }
  };


  return (
    <>
      <StepProgress current={2} />
      <SplitLayout
        image="/assets/indian-passport-closeup.png"
        imageAlt="Indian Passport scan"
        eyebrow="Step 2"
        title="Upload Your Passport"
        subtitle="We'll scan and extract data automatically."
      >
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          {error && <div className="text-sm text-red-500">{error}</div>}
          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              onPick(event.dataTransfer.files?.[0] ?? null);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white/50 p-10 text-center transition hover:border-[#ff7a3d] hover:bg-[#ff7a3d]/5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#ff7a3d]/10 text-[#ff7a3d]">
              <Upload className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold text-[#18246f]">Drag and drop your passport</p>
              <p className="text-xs text-slate-500">or click to browse - JPG, PNG, PDF</p>
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(event) => onPick(event.target.files?.[0] ?? null)}
            />
          </label>

          {preview && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <img src={preview} alt="Preview" className="max-h-64 w-full object-cover" />
              <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                {file?.name}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              disabled={scanning}
              className="flex h-11 w-1/3 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Back
            </button>
            <button
              disabled={!file || scanning}
              onClick={scan}
              className="flex h-11 w-2/3 items-center justify-center gap-2 rounded-xl bg-[#ff7a3d] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(255,122,61,0.24)] transition hover:bg-[#ff6a22] disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                "Scan Passport"
              )}
            </button>
          </div>
        </div>
      </SplitLayout>
    </>
  );
}
