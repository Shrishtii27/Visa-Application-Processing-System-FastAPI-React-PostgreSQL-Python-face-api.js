import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SplitLayout } from "@/components/SplitLayout";
import img from "@/assets/ai-processing.jpg";
import { CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/result")({ component: ResultPage });

function ResultPage() {
  const [score, setScore] = useState(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("visa.matchScore") : null;
    setScore(raw ? Number(raw) : 87);
  }, []);

  const matched = (score ?? 0) >= 82;

  return (
    <SplitLayout
      image={img}
      imageAlt="Verification complete"
      eyebrow="Final Result"
      title={matched ? "Credentials Matched" : "Credentials Not Matched"}
      subtitle="Outcome of your visa verification based on passport, documents and face match."
    >
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
        <div
          className={[
            "flex items-center gap-4 rounded-xl p-4",
            matched ? "bg-success/10" : "bg-destructive/10",
          ].join(" ")}
        >
          <span
            className={[
              "grid h-14 w-14 place-items-center rounded-full",
              matched
                ? "bg-success text-success-foreground"
                : "bg-destructive text-destructive-foreground",
            ].join(" ")}
          >
            {matched ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </span>
          <div>
            <p className="text-xl font-bold text-foreground">
              {matched ? "Credentials Matched" : "Credentials Not Matched"}
            </p>
            <p className="text-sm text-muted-foreground">
              Face match score: <span className="font-semibold">{score ?? "—"}%</span>
            </p>
          </div>
        </div>
        <dl className="grid gap-3 text-sm">
          {[
            ["Passport Scan", "Verified"],
            ["Document Validation", "Verified"],
            ["Face Match", matched ? "Matched" : "Not Matched"],
            ["Final Status", matched ? "Approved" : "Rejected"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border pb-2 last:border-0">
              <dt className="text-muted-foreground">{k}</dt>
              <dd
                className={[
                  "font-semibold",
                  k === "Final Status"
                    ? matched
                      ? "text-success"
                      : "text-destructive"
                    : "text-foreground",
                ].join(" ")}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <Link
          to="/"
          className="block rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
        >
          Back to Home
        </Link>
      </div>
    </SplitLayout>
  );
}