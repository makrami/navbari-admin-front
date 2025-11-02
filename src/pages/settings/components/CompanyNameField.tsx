import { useTranslation } from "react-i18next";

type CompanyNameFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CompanyNameField({ value, onChange }: CompanyNameFieldProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-xs  text-slate-900 mb-2">
        {t("settings.sections.general.companyName")}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("settings.sections.general.companyNamePlaceholder")}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
      />
    </div>
  );
}
