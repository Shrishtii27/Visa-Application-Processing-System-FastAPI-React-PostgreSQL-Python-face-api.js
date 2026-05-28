import { ShieldCheck, Lock, FileCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto w-full px-6 py-8 sm:px-10 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="flex items-center gap-2 text-[#18246f]">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-lg font-bold tracking-tight">Visa Verification</span>
            </div>
            <p className="max-w-sm text-center text-sm text-slate-500 md:text-left">
              Advanced applicant processing powered by AI document analysis and biometric matching.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-slate-600 md:justify-end">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-[#22348f]">
              <Lock className="h-4 w-4 text-[#22348f]" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-[#22348f]">
              <FileCheck className="h-4 w-4 text-[#22348f]" />
              <span>100% Compliant</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Application Processing System. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-[#18246f]">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-[#18246f]">Terms of Service</a>
            <a href="#" className="transition-colors hover:text-[#18246f]">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
