import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className="bg-[#f4f7fb] text-[#16235f]">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,61,0.10),_transparent_28%),radial-gradient(circle_at_right,_rgba(34,52,143,0.08),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#f4f7fb_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-slate-200/80" />

        <div className="relative mx-auto max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 lg:pb-20 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[0.98fr_1.02fr] lg:gap-16">
            <div className="max-w-[660px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#ff7a3d] shadow-sm">
                Login
              </span>

              <h1 className="mt-6 text-5xl font-extrabold leading-[0.95] tracking-tight text-[#18246f] sm:text-6xl lg:text-[4.25rem]">
                <span className="block">Login to Continue</span>
                <span className="block">Verification</span>
              </h1>

              <p className="mt-6 max-w-[620px] text-lg leading-8 text-slate-600 sm:text-xl">
                Access your account to pick up where you left off.
              </p>

              <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
                <form
                  className="space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    navigate("/welcome");
                  }}
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[1.05rem] font-medium text-[#18246f]"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-5 text-base outline-none transition placeholder:text-slate-400 focus:border-[#22348f] focus:ring-4 focus:ring-[#22348f]/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[1.05rem] font-medium text-[#18246f]"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-5 text-base outline-none transition placeholder:text-slate-400 focus:border-[#22348f] focus:ring-4 focus:ring-[#22348f]/10"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#22348f] px-7 text-base font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.25)] transition hover:-translate-y-0.5 hover:bg-[#1b2d7b]"
                  >
                    Login for Verification
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </form>

                <p className="mt-5 text-center text-[1.05rem] text-slate-500">
                  New here?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-[#ff7a3d] transition hover:text-[#ff6a22]"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="pointer-events-none absolute -left-8 top-10 h-28 w-28 rounded-full bg-[#ff7a3d]/20 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 bottom-6 h-32 w-32 rounded-full bg-[#22348f]/20 blur-3xl" />

              <div className="w-full max-w-[740px] overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
                <img
                  src="/assets/login.png"
                  alt="Login verification illustration"
                  className="h-[720px] w-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
