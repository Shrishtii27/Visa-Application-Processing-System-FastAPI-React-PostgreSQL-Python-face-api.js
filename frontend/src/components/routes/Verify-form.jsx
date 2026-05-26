import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SplitLayout } from "@/components/SplitLayout";
import img from "@/assets/passport-closeup.jpg";
import { Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/upload")({ component: UploadPage });

function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);

  const onPick = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const scan = () => {
    setScanning(true);
    setTimeout(() => navigate({ to: "/scan-result" }), 1800);
  };

  return (
    <>
      <SplitLayout image={img} imageAlt="Passport close-up" eyebrow="Step 2" title="Upload Your Passport" subtitle="We'll scan and extract data automatically.">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files?.[0] ?? null); }}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background/50 p-10 text-center transition hover:border-accent hover:bg-accent/5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent">
              <Upload className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Drag & drop your passport</p>
              <p className="text-xs text-muted-foreground">or click to browse · JPG, PNG, PDF</p>
            </div>
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
          </label>
          {preview && (
            <div className="overflow-hidden rounded-xl border border-border">
              <img src={preview} alt="Preview" className="max-h-64 w-full object-cover" />
              <div className="border-t border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                {file?.name}
              </div>
            </div>
          )}
          <button
            disabled={!file || scanning}
            onClick={scan}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
          >
            {scanning ? (<><Loader2 className="h-4 w-4 animate-spin" /> Scanning passport for verification...</>) : "Scan Passport"}
          </button>
        </div>
      </SplitLayout>
    </>
  );
}