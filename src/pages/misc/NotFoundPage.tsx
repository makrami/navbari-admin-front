import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function NotFoundPage() {
  const err = useRouteError();
  const { t } = useTranslation();
  const message = isRouteErrorResponse(err)
    ? `${err.status} ${err.statusText}`
    : t("misc.notFound.title");
  return (
    <div className="min-h-[50vh] grid place-items-center text-center">
      <div>
        <h1 className="text-4xl font-bold mb-2">{message}</h1>
        <p className="text-slate-600 mb-4">{t("misc.notFound.description")}</p>
        <Link className="underline" to="/">
          {t("misc.notFound.link")}
        </Link>
      </div>
    </div>
  );
}
