import { ShieldCheck, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="flex h-[76px] items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#22348f] text-white shadow-[0_12px_26px_rgba(34,52,143,0.22)]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-[1.15rem] font-bold tracking-tight text-[#17246f]">
            Visa Verification Application
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={[
                  "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                  pathname === "/login"
                    ? "bg-slate-100 text-[#17246f]"
                    : "text-[#17246f] hover:bg-slate-100",
                ].join(" ")}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={[
                  "rounded-2xl px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(34,52,143,0.2)] transition hover:-translate-y-0.5 hover:bg-[#1b2d7b]",
                  pathname === "/register" ? "bg-[#1b2d7b]" : "bg-[#22348f]",
                ].join(" ")}
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
