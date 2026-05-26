import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";

export function VerifyFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    applicationId: "",
    visaType: "",
    contact: "",
    address: "",
  });

  return (
    <>
      <StepProgress current={4} />
      <SplitLayout
        image="/assets/passport-closeup.jpg"
        imageAlt="Verification form"
        eyebrow="Step 4"
        title="Verification Form"
        subtitle="Add the remaining details needed for the application."
      >
        <form
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
          onSubmit={(event) => {
            event.preventDefault();
            navigate("/documents");
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Application ID</span>
            <input
              value={form.applicationId}
              onChange={(event) => setForm({ ...form, applicationId: event.target.value })}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#ff7a3d] focus:ring-2 focus:ring-[#ff7a3d]/30"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Visa Type</span>
            <select
              value={form.visaType}
              onChange={(event) => setForm({ ...form, visaType: event.target.value })}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#ff7a3d] focus:ring-2 focus:ring-[#ff7a3d]/30"
            >
              <option value="">- Select -</option>
              <option value="tourist">Tourist</option>
              <option value="business">Business</option>
              <option value="student">Student</option>
              <option value="work">Work</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Contact Number</span>
            <input
              value={form.contact}
              onChange={(event) => setForm({ ...form, contact: event.target.value })}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#ff7a3d] focus:ring-2 focus:ring-[#ff7a3d]/30"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Current Address</span>
            <textarea
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              rows="4"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#ff7a3d] focus:ring-2 focus:ring-[#ff7a3d]/30"
            />
          </label>

          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-[#22348f] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b]"
          >
            Continue to Documents
          </button>
        </form>
      </SplitLayout>
    </>
  );
}
