import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  FileCheck2,
  ScanFace,
  ShieldCheck,
} from "lucide-react";

const stackCards = [
  {
    icon: ShieldCheck,
    title: "Passport Verification",
    description: "Scan and validate MRZ data instantly with anti-tamper checks.",
  },
  {
    icon: FileCheck2,
    title: "Document Validation",
    description: "Cross-verify supporting IDs and address proof with OCR.",
  },
  {
    icon: ScanFace,
    title: "Face Recognition",
    description: "Match live selfie to passport photo with liveness detection.",
  },
];

function Home() {
  return (
    <main className="bg-[#f4f7fb] text-[#16235f]">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,61,0.14),_transparent_28%),radial-gradient(circle_at_right,_rgba(34,52,143,0.10),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#f4f7fb_72%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-slate-200/80" />

        <div className="relative mx-auto max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 lg:pb-24 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
            <div className="max-w-[640px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#243a88] shadow-sm">
                <BadgeCheck className="h-4 w-4 text-[#ff7a3d]" />
                Passport Verification System
              </span>

              <h1 className="mt-6 text-5xl font-extrabold leading-[0.95] tracking-tight text-[#18246f] sm:text-6xl lg:text-[4.5rem]">
                <span className="block">Secure Passport</span>
                <span className="block text-[#ff7a3d]">Verification</span>
                <span className="block">System for Global Identity</span>
              </h1>

              <p className="mt-6 max-w-[630px] text-lg leading-8 text-slate-600 sm:text-xl">
                Verify your identity using advanced passport scanning, document
                validation, and facial recognition technology.
              </p>

              <p className="mt-4 max-w-[620px] text-base leading-7 text-slate-600 sm:text-lg">
                Start your passport verification process with a secure and
                intelligent system designed for fast and reliable identity
                authentication.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href="/register"
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#22348f] px-7 text-base font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.25)] transition hover:-translate-y-0.5 hover:bg-[#1b2d7b]"
                >
                  Start Your Verification
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="/login"
                  className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 text-base font-semibold text-[#22348f] shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Login to Continue
                </a>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="pointer-events-none absolute -left-8 top-10 h-28 w-28 rounded-full bg-[#ff7a3d]/20 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 bottom-6 h-32 w-32 rounded-full bg-[#22348f]/20 blur-3xl" />

              <div className="w-full max-w-[740px] overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
                <img
                  src="/assets/Home.png"
                  alt="Passport verification hero"
                  className="h-[520px] w-full object-cover object-center lg:h-[500px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-6 lg:pb-20">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-[#ff7a3d]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#ff7a3d]">
            Verification Stack
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#18246f] sm:text-4xl">
            Built for trust at every step
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Three layers of intelligent verification protect every identity check.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {stackCards.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-[2rem] border border-slate-200/80 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#22348f] text-white shadow-lg shadow-[#22348f]/20">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-8 text-2xl font-semibold text-[#18246f]">
                {title}
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-8 rounded-[2rem] bg-[linear-gradient(135deg,_#1f2f86_0%,_#2f3f9d_55%,_#243a88_100%)] px-7 py-10 text-white shadow-[0_24px_60px_rgba(34,52,143,0.22)] sm:px-10 lg:flex-row lg:items-center lg:px-14">
          <div>
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to verify?
            </h3>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Create your account and complete passport verification in under 5
              minutes.
            </p>
          </div>
          <a
            href="/register"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#ff7a3d] px-7 text-base font-semibold text-white shadow-[0_14px_34px_rgba(255,122,61,0.32)] transition hover:-translate-y-0.5 hover:bg-[#ff6a22]"
          >
            Start Your Verification
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <Clock3 className="h-4 w-4 text-[#ff7a3d]" />
            Average review time: minutes, not days
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-[#22348f]" />
            Secure identity checks
          </span>
        </div>
      </section>
    </main>
  );
}

export default Home;
