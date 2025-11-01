import { useTranslation } from "react-i18next";

export function VehiclesPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("vehicles.header.title")}</h1>
      <p className="text-slate-600">{t("vehicles.header.subtitle")}</p>
    </div>
  );
}
