import { useMemo, useState, useEffect } from "react";
import { cn } from "../../../shared/utils/cn";
import { Save as SaveIcon } from "lucide-react";
import { useUpdateCompany } from "../../../services/company/hooks";
import { useTranslation } from "react-i18next";

type InternalNotesProps = {
  className?: string;
  title?: string;
  companyId: string | null;
  initialValue?: string;
};

export default function InternalNotes({
  className,
  title,
  companyId,
  initialValue = "",
}: InternalNotesProps) {
  const { t } = useTranslation();
  const [note, setNote] = useState<string>(initialValue);
  const updateMutation = useUpdateCompany();

  // Sync with initialValue when it changes
  useEffect(() => {
    setNote(initialValue);
  }, [initialValue]);

  const isDisabled = useMemo(
    () =>
      note.trim().length === 0 ||
      note.trim() === initialValue.trim() ||
      !companyId,
    [note, initialValue, companyId]
  );

  const handleSave = async () => {
    if (!companyId || isDisabled) return;

    try {
      await updateMutation.mutateAsync({
        id: companyId,
        data: { internalNote: note.trim() },
      });
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  if (!companyId) {
    return null;
  }

  return (
    <section className={cn("space-y-3", className)}>
      <h2 className="text-sm font-semibold text-slate-900">
        {title || t("localCompanies.page.internalNotes.title")}
      </h2>

      <div className="rounded-2xl bg-white p-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("localCompanies.page.internalNotes.placeholder")}
          className="w-full min-h-28 rounded-lg bg-slate-100 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        <button
          type="button"
          disabled={isDisabled || updateMutation.isPending}
          onClick={handleSave}
          className={cn(
            "mt-3 inline-flex items-center gap-2 rounded-md bg-blue-600/10 px-3 py-1.5 text-xs font-medium text-blue-600",
            "hover:bg-blue-600/15",
            (isDisabled || updateMutation.isPending) &&
              "opacity-50 cursor-not-allowed"
          )}
        >
          <SaveIcon className="size-4" />
          <span>
            {updateMutation.isPending
              ? t("localCompanies.page.internalNotes.saving")
              : t("localCompanies.page.internalNotes.saveNote")}
          </span>
        </button>
        {updateMutation.isError && (
          <p className="mt-2 text-xs text-red-600">
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : t("localCompanies.page.internalNotes.saveFailed")}
          </p>
        )}
        {updateMutation.isSuccess && (
          <p className="mt-2 text-xs text-green-600">
            {t("localCompanies.page.internalNotes.saveSuccess")}
          </p>
        )}
      </div>
    </section>
  );
}
