import { Check } from "lucide-react";

const STEPS = [
  "Country",
  "Upload Passport",
  "Scan Result",
  "Verification Form",
  "Documents",
  "Camera",
  "Face Match",
  "Result",
];

export function StepProgress({ current }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
      <ol className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-card p-3 shadow-card">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <li key={label} className="flex shrink-0 items-center gap-2">
              <span
                className={[
                  "grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition",
                  done
                    ? "bg-success text-success-foreground"
                    : active
                      ? "bg-accent text-accent-foreground shadow-soft"
                      : "bg-secondary text-muted-foreground",
                ].join(" ")}
              >
                {done ? <Check className="h-4 w-4" /> : step}
              </span>
              <span
                className={[
                  "whitespace-nowrap text-xs font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {label}
              </span>
              {step < STEPS.length && (
                <span className="mx-1 hidden h-px w-6 bg-border md:inline-block" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}