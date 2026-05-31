import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function CustomSelect({ value, onChange, options, placeholder = "- Select -", disabled = false, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={[
          "flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm transition outline-none text-left",
          disabled ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50" : "bg-white",
          isOpen ? "border-[#ff7a3d] ring-2 ring-[#ff7a3d]/30" : "border-slate-200 hover:border-[#ff7a3d]/50"
        ].join(" ")}
      >
        <span className={selectedOption ? "text-slate-900" : "text-slate-500"} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.1)]">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={[
                  "w-full px-3 py-2.5 text-left text-sm transition-colors",
                  option.value === value 
                    ? "bg-[#ff7a3d]/10 text-[#ff7a3d] font-medium" 
                    : "text-slate-700 hover:bg-slate-50"
                ].join(" ")}
              >
                {option.label}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-3 text-center text-sm text-slate-500">
                No options available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
