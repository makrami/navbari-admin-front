import {useRef, useState, useEffect, useMemo} from "react";
import {Search, ChevronUp} from "lucide-react";
import {countries} from "countries-list";
import {cn} from "../../../shared/utils/cn";

type CountrySelectProps = {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export function CountrySelect({
  label,
  value,
  onChange,
  placeholder = "Search countries...",
  className,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get all countries as an array of country names
  const countryOptions = useMemo(() => {
    return Object.entries(countries)
      .map(([code, data]) => ({
        code: code,
        name: data.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return countryOptions;
    }
    const query = searchQuery.toLowerCase();
    return countryOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(query) ||
        option.code.toLowerCase().includes(query)
    );
  }, [countryOptions, searchQuery]);

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

  const handleSelect = (countryName: string) => {
    onChange?.(countryName);
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
    <div className={cn("", className)}>
      <label className="block text-xs text-slate-900 mb-2">{label}</label>
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
            autoComplete="off"
            className={cn(
              "w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 text-sm pl-9 pr-9",
              "hover:border-[#1B54FE]/40",
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
                    key={option.code}
                    onClick={() => handleSelect(option.name)}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer transition-colors duration-150",
                      "hover:bg-slate-50",
                      value === option.name && "bg-[#1B54FE]/10 font-medium"
                    )}
                  >
                    {option.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400 text-center">
                No countries found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
