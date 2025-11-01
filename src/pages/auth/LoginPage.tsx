import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../shared/components/ui/Button";
import { loginDemo } from "../../services/auth.service";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginDemo(username, password);
      // Redirect to the page they were trying to access, or dashboard
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        "/dashboard";
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("common.error.unknown"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm bg-white rounded-md shadow border border-slate-200 p-6">
        <h1 className="text-xl font-semibold mb-1">{t("auth.login.title")}</h1>
        <p className="text-sm text-slate-600 mb-6">
          {t("auth.login.subtitle")}
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="username" className="text-sm font-medium">
              {t("auth.login.usernameLabel")}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder={t("auth.login.usernamePlaceholder")}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              {t("auth.login.passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder={t("auth.login.passwordPlaceholder")}
              required
              minLength={4}
            />
          </div>
          {error ? (
            <div className="text-sm text-red-600" role="alert">
              {error}
            </div>
          ) : null}
          <Button type="submit" disabled={loading}>
            {loading
              ? t("auth.login.submit.loading")
              : t("auth.login.submit.label")}
          </Button>
        </form>
        <div className="text-sm text-slate-600 mt-4">
          {t("auth.login.noAccount")}{" "}
          <Link className="underline" to="/sign-up">
            {t("auth.login.signUpLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
