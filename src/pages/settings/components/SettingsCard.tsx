import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../shared/utils/cn";

type SettingsCardProps = {
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

const RTL_LANGUAGES = ["fa", "ar"];

export function SettingsCard({
  title,
  description,
  isOpen,
  onToggle,
  children,
}: SettingsCardProps) {
  const { i18n } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="bg-slate-50 rounded-xl overflow-hidden cursor-pointer border border-slate-200 transition-all duration-200"
    >
      <button
        onClick={onToggle}
        className={cn(
          "w-full px-6 py-5 flex items-center justify-between",
          isRTL ? "text-right" : "text-left"
        )}
      >
        <div className="flex-1">
          <h2 className="text-sm font-bold text-slate-900 mb-1">{title}</h2>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <ChevronDown
          className={cn(
            "size-5 text-slate-400 transition-transform duration-300 ease-in-out",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>
      {/* Expanded content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-5 border-t border-slate-100">{children}</div>
      </div>
    </div>
  );
}
