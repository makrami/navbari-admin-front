import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui/Button";
import { registerDemo } from "../../services/auth.service";

export function SignUpPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("auth.signUp.errors.mismatch"));
      return;
    }
    setLoading(true);
    try {
      await registerDemo(username, password);
      navigate("/dashboard");
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
        <h1 className="text-xl font-semibold mb-1">{t("auth.signUp.title")}</h1>
        <p className="text-sm text-slate-600 mb-6">
          {t("auth.signUp.subtitle")}
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="username" className="text-sm font-medium">
              {t("auth.signUp.usernameLabel")}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder={t("auth.signUp.usernamePlaceholder")}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              {t("auth.signUp.passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder={t("auth.signUp.passwordPlaceholder")}
              required
              minLength={4}
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="confirm" className="text-sm font-medium">
              {t("auth.signUp.confirmLabel")}
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder={t("auth.signUp.confirmPlaceholder")}
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
              ? t("auth.signUp.submit.loading")
              : t("auth.signUp.submit.label")}
          </Button>
        </form>
        <div className="text-sm text-slate-600 mt-4">
          {t("auth.signUp.haveAccount")}{" "}
          <Link className="underline" to="/login">
            {t("auth.signUp.loginLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
