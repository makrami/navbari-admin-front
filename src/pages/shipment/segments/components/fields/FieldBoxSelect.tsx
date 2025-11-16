import { useRef, useState, useEffect } from "react";
import { Search, ChevronUp } from "lucide-react";
import { cn } from "../../../../../shared/utils/cn";

type FieldBoxSelectProps = {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  options?: string[];
  placeholder?: string;
};

export default function FieldBoxSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Search cities...",
}: FieldBoxSelectProps) {
  const isEditable = Boolean(options && onChange);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = (options ?? []).filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Select all text when opening if there's a value, so user can start typing immediately
      if (value) {
        inputRef.current.select();
      }
    }
  }, [isOpen, value]);

  const handleSelect = (option: string) => {
    onChange?.(option);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleInputClick = () => {
    if (!isOpen) {
      setSearchQuery("");
      setIsOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const displayValue = isOpen && searchQuery !== "" ? searchQuery : value;

  return (
    <div className="grid gap-1 border-1 border-slate-200 rounded-xl py-5 px-2">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {isEditable ? (
        <div ref={containerRef} className="relative">
          <div
            className="relative cursor-pointer group"
            onClick={handleInputClick}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#1B54FE] transition-colors duration-200 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={displayValue}
              onChange={handleInputChange}
              onFocus={() => {
                if (!isOpen) {
                  setSearchQuery("");
                  setIsOpen(true);
                }
              }}
              placeholder={placeholder}
              className={cn(
                "w-full rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none transition-all duration-200",
                "border border-slate-200 bg-white text-slate-900",
                "hover:border-[#1B54FE]/40 focus:border-[#1B54FE] focus:ring-2 focus:ring-[#1B54FE]/10",
                "placeholder:text-slate-400"
              )}
            />
            <ChevronUp
              className={cn(
                "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 transition-all duration-200",
                isOpen ? "text-[#1B54FE] rotate-0" : "text-slate-400 rotate-180"
              )}
            />
          </div>

          {/* Dropdown List */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredOptions.length > 0 ? (
                <ul className="py-1">
                  {filteredOptions.map((option) => (
                    <li
                      key={option}
                      onClick={() => handleSelect(option)}
                      className={cn(
                        "px-3 py-2 text-sm cursor-pointer transition-colors duration-150",
                        "hover:bg-slate-50",
                        value === option && "bg-[#1B54FE]/10 font-medium"
                      )}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-2 text-sm text-slate-400 text-center">
                  No cities found
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-900">
          {value || <span className="text-slate-400 italic">Not set</span>}
        </div>
      )}
    </div>
  );
}
