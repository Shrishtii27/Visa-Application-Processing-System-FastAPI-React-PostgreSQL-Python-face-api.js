import { useEffect, useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function WelcomePage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <h1 className="text-3xl font-bold text-[#18246f] sm:text-4xl">
        Welcome to your verification dashboard
      </h1>
      <p className="mt-3 text-slate-600">A quick question to get you started.</p>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#16235f]/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#22348f]/10 text-[#22348f]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-center text-xl font-bold text-[#18246f]">
              Do you have an existing passport?
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              We&apos;ll tailor the next steps based on your answer.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => navigate("/country")}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#22348f] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b]"
              >
                <ShieldCheck className="h-4 w-4" /> Yes, Verify Passport
              </button>
              <button
                onClick={() => navigate("/country")}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#18246f] transition hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" /> No, Apply for New Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
