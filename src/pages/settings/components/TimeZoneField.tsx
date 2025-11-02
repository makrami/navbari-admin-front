import { useTranslation } from "react-i18next";

type TimeZoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TimeZoneField({ value, onChange }: TimeZoneFieldProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-xs  text-slate-900 mb-2">
        {t("settings.sections.general.timeZone")}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900"
      >
        <option value="(GMT-05:00) Eastern Time">
          (GMT-05:00) Eastern Time
        </option>
        <option value="(GMT-08:00) Pacific Time">
          (GMT-08:00) Pacific Time
        </option>
        <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
        <option value="(GMT+01:00) Central European Time">
          (GMT+01:00) Central European Time
        </option>
      </select>
    </div>
  );
}
