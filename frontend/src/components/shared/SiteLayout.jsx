import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";
import Navbar from "./Navbar";
import Footer from "./Footer";

export function SiteLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7fb] text-[#16235f]">
      <Navbar />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            {outlet}
          </PageTransition>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}

export default SiteLayout;
