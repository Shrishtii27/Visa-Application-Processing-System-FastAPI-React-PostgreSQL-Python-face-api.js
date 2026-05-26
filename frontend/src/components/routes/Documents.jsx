import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SplitLayout } from "@/components/SplitLayout";
import img from "@/assets/documents.jpg";
import { Upload, FileText, X } from "lucide-react";

export const Route = createFileRoute("/documents")({ component: DocumentsPage });

function DocumentsPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);

  const add = (list, type) => {
    if (!list) return;
    setFiles((p) => [...p, ...Array.from(list).map((f) => ({ name: f.name, type }))]);
  };

  return (
    <>
      <SplitLayout image={img} imageAlt="Document verification" eyebrow="Step 5" title="Upload Supporting Documents" subtitle="Add a government ID and address proof.">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
          <DropZone label="Aadhaar / Government ID" onDrop={(f) => add(f, "ID")} />
          <DropZone label="Address Proof" onDrop={(f) => add(f, "Address")} />
          {files.length > 0 && (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-3 bg-background px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 text-accent" />
                    <span className="truncate">{f.name}</span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{f.type}</span>
                  </span>
                  <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            disabled={files.length < 2}
            onClick={() => navigate({ to: "/camera" })}
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
          >
            Continue to Face Verification
          </button>
        </div>
      </SplitLayout>
    </>
  );
}

function DropZone({ label, onDrop }) {
  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDrop(e.dataTransfer.files); }}
      className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background/50 p-4 transition hover:border-accent hover:bg-accent/5"
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
        <Upload className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">Drag & drop or click to upload</p>
      </div>
      <input type="file" multiple className="hidden" onChange={(e) => onDrop(e.target.files)} />
    </label>
  );
}