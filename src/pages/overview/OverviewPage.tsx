import { useTranslation } from "react-i18next";

export function OverviewPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("overview.header.title")}</h1>
      <p className="text-slate-600">{t("overview.header.subtitle")}</p>
    </div>
  );
}
