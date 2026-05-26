import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, X } from "lucide-react";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";

function DropZone({ label, onDrop }) {
  return (
    <label
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(event.dataTransfer.files);
      }}
      className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white/50 p-4 transition hover:border-[#ff7a3d] hover:bg-[#ff7a3d]/5"
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#ff7a3d]/10 text-[#ff7a3d]">
        <Upload className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#18246f]">{label}</p>
        <p className="text-xs text-slate-500">Drag and drop or click to upload</p>
      </div>
      <input type="file" multiple className="hidden" onChange={(event) => onDrop(event.target.files)} />
    </label>
  );
}

export function DocumentsPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);

  const add = (list, type) => {
    if (!list) return;
    setFiles((previous) => [
      ...previous,
      ...Array.from(list).map((file) => ({ name: file.name, type })),
    ]);
  };

  return (
    <>
      <StepProgress current={5} />
      <SplitLayout
        image="/assets/documents.jpg"
        imageAlt="Document verification"
        eyebrow="Step 5"
        title="Upload Supporting Documents"
        subtitle="Add a government ID and address proof."
      >
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <DropZone label="Aadhaar / Government ID" onDrop={(pickedFiles) => add(pickedFiles, "ID")} />
          <DropZone label="Address Proof" onDrop={(pickedFiles) => add(pickedFiles, "Address")} />

          {files.length > 0 && (
            <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 bg-white px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 text-[#ff7a3d]" />
                    <span className="truncate">{file.name}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {file.type}
                    </span>
                  </span>
                  <button
                    onClick={() => setFiles(files.filter((_, itemIndex) => itemIndex !== index))}
                    className="text-slate-500 hover:text-[#b91c1c]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            disabled={files.length < 2}
            onClick={() => navigate("/camera")}
            className="h-11 w-full rounded-xl bg-[#22348f] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b] disabled:opacity-50"
          >
            Continue to Face Verification
          </button>
        </div>
      </SplitLayout>
    </>
  );
}
