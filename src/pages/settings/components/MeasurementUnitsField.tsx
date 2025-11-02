import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

type MeasurementUnitsFieldProps = {
  distanceUnit: string;
  weightUnit: string;
  onDistanceUnitChange: (value: string) => void;
  onWeightUnitChange: (value: string) => void;
};

const distanceOptions = ["Kilometers (KM)", "Miles (MI)"];
const weightOptions = ["Kilograms (KG)", "Pounds (LB)"];

export function MeasurementUnitsField({
  distanceUnit,
  weightUnit,
  onDistanceUnitChange,
  onWeightUnitChange,
}: MeasurementUnitsFieldProps) {
  const { t } = useTranslation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const distanceRef = useRef<HTMLDivElement>(null);
  const weightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        distanceRef.current &&
        !distanceRef.current.contains(event.target as Node) &&
        weightRef.current &&
        !weightRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <label className="block text-xs  text-slate-900 mb-2">
        {t("settings.sections.general.measurementUnits")}
      </label>
      <div className="grid grid-cols-2 gap-4">
        {/* Distance Unit Dropdown */}
        <div ref={distanceRef} className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === "distance" ? null : "distance")
            }
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 flex items-center justify-between"
          >
            <span>{distanceUnit}</span>
            <ChevronDown
              className={`size-4 text-slate-400 transition-transform ${
                openDropdown === "distance" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openDropdown === "distance" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              {distanceOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onDistanceUnitChange(option);
                    setOpenDropdown(null);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${
                    distanceUnit === option ? "bg-slate-100 font-medium" : ""
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Weight Unit Dropdown */}
        <div ref={weightRef} className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === "weight" ? null : "weight")
            }
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 flex items-center justify-between"
          >
            <span>{weightUnit}</span>
            <ChevronDown
              className={`size-4 text-slate-400 transition-transform ${
                openDropdown === "weight" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openDropdown === "weight" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              {weightOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onWeightUnitChange(option);
                    setOpenDropdown(null);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${
                    weightUnit === option ? "bg-slate-100 font-medium" : ""
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
