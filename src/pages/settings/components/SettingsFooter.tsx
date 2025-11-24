import { useTranslation } from "react-i18next";

type SettingsFooterProps = {
  changeCount: number;
  onRevert: () => void;
  onSave: () => void;
  isLoading?: boolean;
};

export function SettingsFooter({
  changeCount,
  onRevert,
  onSave,
  isLoading = false,
}: SettingsFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
      <p className="text-sm text-slate-900">
        {t("settings.sections.general.changesCount")
          .split("{{count}}")
          .map((part, index, arr) => (
            <span key={index}>
              {part}
              {index < arr.length - 1 && (
                <span className="font-bold">{changeCount}</span>
              )}
            </span>
          ))}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRevert}
          disabled={isLoading || changeCount === 0}
          className="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("settings.sections.general.revert")}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isLoading || changeCount === 0}
          className="px-3 py-2 bg-[#1B54FE] text-white rounded-lg hover:bg-[#1545d4] transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? t("settings.sections.general.saving") || "Saving..."
            : t("settings.sections.general.saveChanges")}
        </button>
      </div>
    </div>
  );
}
