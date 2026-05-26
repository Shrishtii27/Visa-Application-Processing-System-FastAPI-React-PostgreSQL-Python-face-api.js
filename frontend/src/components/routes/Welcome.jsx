import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";

export const Route = createFileRoute("/welcome")({ component: WelcomePage });

function WelcomePage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => { const t = setTimeout(() => setOpen(true), 200); return () => clearTimeout(t); }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Welcome to your verification dashboard</h1>
      <p className="mt-3 text-muted-foreground">A quick question to get you started.</p>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm animate-in fade-in">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft animate-in zoom-in-95">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-center text-xl font-bold text-foreground">
              Do you have an existing passport?
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              We'll tailor the next steps based on your answer.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => navigate({ to: "/country" })}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
              >
                <ShieldCheck className="h-4 w-4" /> Yes, Verify Passport
              </button>
              <button
                onClick={() => navigate({ to: "/country" })}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
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