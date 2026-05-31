import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function PageLoader({ text = "Loading content..." }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-4 p-8"
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-[#22348f]/20" />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <Loader2 className="h-8 w-8 animate-spin text-[#22348f]" />
        </div>
      </div>
      <p className="animate-pulse text-sm font-semibold tracking-wider text-slate-500 uppercase">
        {text}
      </p>
    </motion.div>
  );
}
