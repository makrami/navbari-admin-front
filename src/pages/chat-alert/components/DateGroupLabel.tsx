import type { DateGroup } from "../types/chat";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/fa";
import "dayjs/locale/ar";
import "dayjs/locale/ru";
import "dayjs/locale/zh";

interface DateGroupLabelProps {
  dateGroup: DateGroup;
}

const LOCALE_MAP: Record<string, string> = {
  en: "en",
  fa: "fa",
  ar: "ar",
  ru: "ru",
  zh: "zh",
};

export function DateGroupLabel({ dateGroup }: DateGroupLabelProps) {
  const { t, i18n } = useTranslation();

  // Set dayjs locale based on current i18n language
  const currentLocale = LOCALE_MAP[i18n.language] || "en";
  dayjs.locale(currentLocale);

  const getLabel = () => {
    if (dateGroup === "today") return t("chatAlert.dateGroup.today");
    if (dateGroup === "yesterday") return t("chatAlert.dateGroup.yesterday");

    // For other dates, try to parse and format with locale
    try {
      const parsedDate = dayjs(dateGroup, "DD MMM YYYY", true);
      if (parsedDate.isValid()) {
        // Format with locale-aware month names
        return parsedDate.format("DD MMM YYYY");
      }
    } catch {
      // If parsing fails, return as is
    }

    return dateGroup; // Fallback: use the date string directly
  };

  return (
    <div className="flex justify-center">
      <span className="text-sm font-medium text-slate-600">{getLabel()}</span>
    </div>
  );
}
