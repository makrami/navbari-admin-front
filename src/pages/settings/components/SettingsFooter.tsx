import { useTranslation } from "react-i18next";

type SettingsFooterProps = {
  changeCount: number;
  onRevert: () => void;
  onSave: () => void;
};

export function SettingsFooter({
  changeCount,
  onRevert,
  onSave,
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
          className="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
        >
          {t("settings.sections.general.revert")}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-3 py-2 bg-[#1B54FE] text-white rounded-lg hover:bg-[#1545d4] transition-colors text-sm font-bold"
        >
          {t("settings.sections.general.saveChanges")}
        </button>
      </div>
    </div>
  );
}
