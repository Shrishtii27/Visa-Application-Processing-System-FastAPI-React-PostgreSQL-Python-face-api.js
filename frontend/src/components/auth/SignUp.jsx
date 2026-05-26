import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ full_name: fullName, email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7fb] text-[#16235f]">
      {/* ── Main content grows to fill space above footer ── */}
      <main className="flex-1">
        <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:py-20">
          {/* Two-column grid: form | image */}
          <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-14">

            {/* ── LEFT: Form ── */}
            <div className="flex flex-col justify-center">
              {/* Badge */}
              <span className="inline-flex w-fit rounded-full bg-[#ff7a3d]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#ff7a3d]">
                Register
              </span>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-[#18246f] sm:text-5xl">
                Create Your Verification Account
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-500">
                Sign up to start your secure passport verification journey.
              </p>

              {/* Form card */}
              <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-9">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {error && (
                    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                  {/* Full Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#18246f]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm text-[#18246f] placeholder-slate-400 outline-none transition focus:border-[#22348f] focus:ring-2 focus:ring-[#22348f]/15"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#18246f]">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm text-[#18246f] placeholder-slate-400 outline-none transition focus:border-[#22348f] focus:ring-2 focus:ring-[#22348f]/15"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#18246f]">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-slate-200 bg-[#f8faff] px-4 py-3 pr-11 text-sm text-[#18246f] placeholder-slate-400 outline-none transition focus:border-[#22348f] focus:ring-2 focus:ring-[#22348f]/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#22348f]"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#18246f]">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-slate-200 bg-[#f8faff] px-4 py-3 pr-11 text-sm text-[#18246f] placeholder-slate-400 outline-none transition focus:border-[#22348f] focus:ring-2 focus:ring-[#22348f]/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#22348f]"
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#22348f] text-base font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.25)] transition hover:-translate-y-0.5 hover:bg-[#1b2d7b] disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? "Registering..." : "Register for Verification"}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </form>

                <p className="mt-5 text-center text-sm text-slate-500">
                  Already registered?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[#ff7a3d] hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>

            {/* ── RIGHT: Image ── */}
            <div className="relative hidden lg:flex lg:items-center lg:justify-end">
              {/* Glow blobs */}
              <div className="pointer-events-none absolute -left-8 top-10 h-28 w-28 rounded-full bg-[#ff7a3d]/20 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 bottom-6 h-32 w-32 rounded-full bg-[#22348f]/20 blur-3xl" />

              <div className="relative w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
                <img
                  src="/assets/SignUp.png"
                  alt="Passport verification registration"
                  className="h-[600px] w-full object-cover object-center"
                />
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* ── Footer (same as Home) ── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-4 py-5 text-sm text-slate-500 sm:flex-row sm:px-6">
          <span>© 2026 Visa — Application Processing System.</span>
          <span className="flex gap-4">
            <span>Secure</span>
            <span>·</span>
            <span>Encrypted</span>
            <span>·</span>
            <span>Compliant</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default SignUp;