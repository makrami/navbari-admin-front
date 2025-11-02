import { useTranslation } from "react-i18next";

type ETACalculationMethodSectionProps = {
  method: "gps" | "historical";
  onChange: (method: "gps" | "historical") => void;
};

export function ETACalculationMethodSection({
  method,
  onChange,
}: ETACalculationMethodSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-10 rounded-lg p-4 ">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          {t("settings.sections.systemParameters.etaCalculationMethod.title")}
        </h3>
        <p className="text-sm text-slate-400">
          {t(
            "settings.sections.systemParameters.etaCalculationMethod.description"
          )}
        </p>
      </div>
      <div className=" grid grid-cols-2 gap-3">
        <label
          className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${
            method === "gps"
              ? "bg-blue-50 border-[#1B54FE]/5"
              : "bg-white border-none hover:border-slate-300"
          }`}
        >
          <input
            type="radio"
            name="eta-method"
            value="gps"
            checked={method === "gps"}
            onChange={() => onChange("gps")}
            className="size-4 accent-[#1B54FE]"
          />
          <span
            className={`text-sm ${
              method === "gps" ? "text-[#1B54FE] font-medium" : "text-slate-700"
            }`}
          >
            {t(
              "settings.sections.systemParameters.etaCalculationMethod.realtimeGps"
            )}
          </span>
        </label>
        <label
          className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${
            method === "historical"
              ? "bg-blue-50 border-[#1B54FE]/5"
              : "bg-white border-none hover:border-slate-300"
          }`}
        >
          <input
            type="radio"
            name="eta-method"
            value="historical"
            checked={method === "historical"}
            onChange={() => onChange("historical")}
            className="size-4 accent-[#1B54FE]"
          />
          <span
            className={`text-sm ${
              method === "historical"
                ? "text-[#1B54FE] font-medium"
                : "text-slate-700"
            }`}
          >
            {t(
              "settings.sections.systemParameters.etaCalculationMethod.historicalData"
            )}
          </span>
        </label>
      </div>
    </div>
  );
}
