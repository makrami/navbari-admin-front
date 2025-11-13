import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { login } from "../../services/auth.service";
import { LanguageSelector } from "../../components/Ui/LanguageSelector";
import loginbg from "../../assets/images/loginBg.png";
import imgLogo from "../../assets/images/truck.svg";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Translate error messages
  const translateError = (errorMsg: string): string => {
    const lowerMsg = errorMsg.toLowerCase();
    if (
      lowerMsg.includes("wrong credentials") ||
      lowerMsg.includes("invalid credentials")
    ) {
      return t("auth.login.errors.invalidCredentials");
    }
    if (lowerMsg.includes("network") || lowerMsg.includes("fetch")) {
      return t("auth.login.errors.networkError");
    }
    if (lowerMsg.includes("required") || lowerMsg.includes("missing")) {
      return t("auth.login.errors.required");
    }
    if (lowerMsg.includes("login failed") || lowerMsg.includes("failed")) {
      return t("auth.login.errors.loginFailed");
    }
    return errorMsg;
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Login accepts emailOrPhone, so we can pass email directly
      await login(email, password);
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        "/dashboard";
      navigate(from, { replace: true });
    } catch (err: unknown) {
      // Extract error message - handle both Error objects and normalized API errors
      let errorMessage = t("common.error.unknown");
      if (err instanceof Error) {
        errorMessage = translateError(err.message);
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = translateError(String(err.message));
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`min-h-screen grid place-items-center px-4 ${
        isRTL ? "rtl" : "ltr"
      }`}
      style={{
        backgroundImage: `url(${loginbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className={`fixed top-6 z-10 grid size-16 place-items-center rounded-2xl bg-[#1b54fe] ${
          isRTL ? "right-12" : "left-12"
        }`}
      >
        <img src={imgLogo} alt={t("sidebar.brandAlt")} className="h-9 w-9" />
      </div>
      <div className={`fixed top-6 z-10 ${isRTL ? "left-6" : "right-6"}`}>
        <LanguageSelector />
      </div>
      <div className="w-80 md:w-96 max-w-md rounded-2xl bg-white p-6 md:p-8">
        <h1 className="text-lg font-bold text-center text-slate-900">
          {t("auth.login.title")}
        </h1>
        <p className="text-xs text-center text-slate-500 mt-1 mb-6">
          {t("auth.login.subtitle")}
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                isRTL ? "text-right" : "text-left"
              }`}
              placeholder={t("auth.login.emailPlaceholder")}
              dir={isRTL ? "rtl" : "ltr"}
              required
            />
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                isRTL ? "pl-10 text-right" : "pr-10 text-left"
              }`}
              placeholder={t("auth.login.passwordPlaceholder")}
              dir={isRTL ? "rtl" : "ltr"}
              required
              minLength={4}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className={`absolute top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 ${
                isRTL ? "left-3" : "right-3"
              }`}
              aria-label={
                showPassword
                  ? t("auth.login.hidePassword")
                  : t("auth.login.showPassword")
              }
            >
              {showPassword ? (
                <EyeOff className="size-4 text-slate-400" />
              ) : (
                <Eye className="size-4 text-slate-400" />
              )}
            </button>
          </div>
          {error ? (
            <div
              className={`text-sm text-red-600 ${
                isRTL ? "text-right" : "text-left"
              }`}
              role="alert"
            >
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-md bg-[#1B54FE] text-white text-sm font-medium hover:bg-[#1545d4] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? t("auth.login.submit.loading")
              : t("auth.login.submit.label")}
          </button>
          <label
            className={`mt-1 inline-flex w-full justify-center items-center gap-2 text-xs text-slate-600 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-3 rounded border-slate-300 text-[#1B54FE] focus:ring-[#1B54FE]"
            />
            {t("auth.login.rememberMe")}
          </label>
        </form>
      </div>
    </div>
  );
}
