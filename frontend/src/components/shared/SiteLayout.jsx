import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7fb] text-[#16235f]">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default SiteLayout;
