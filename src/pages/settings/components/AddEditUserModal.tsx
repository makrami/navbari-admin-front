import {X} from "lucide-react";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {CountrySelect} from "./CountrySelect";

/**
 * Validate password according to requirements:
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 */
function validatePassword(
  password: string,
  t: (key: string) => string
): {valid: boolean; error?: string} {
  if (!password) {
    return {
      valid: false,
      error: t("settings.sections.rolesPermissions.passwordRequired"),
    };
  }

  if (password.length < 8) {
    return {
      valid: false,
      error: t("settings.sections.rolesPermissions.passwordMinLength"),
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: t("settings.sections.rolesPermissions.passwordLowercase"),
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: t("settings.sections.rolesPermissions.passwordUppercase"),
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: t("settings.sections.rolesPermissions.passwordNumber"),
    };
  }

  if (!/[@$!%*?&]/.test(password)) {
    return {
      valid: false,
      error: t("settings.sections.rolesPermissions.passwordSpecialChar"),
    };
  }

  return {valid: true};
}

export type AddEditUserModalProps = {
  open: boolean;
  mode: "add" | "edit";
  roleName: string;
  roleId: string | null;
  initialUser?: {
    id?: string;
    name: string;
    email: string;
    country?: string;
  } | null;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    name: string;
    email: string;
    password?: string;
    country?: string;
  }) => void;
  isLoading?: boolean;
};

export function AddEditUserModal({
  open,
  mode,
  roleName,
  initialUser,
  onClose,
  onSubmit,
  isLoading = false,
}: AddEditUserModalProps) {
  const {t} = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });
  const isEdit = mode === "edit";

  useEffect(() => {
    if (open) {
      setName(initialUser?.name ?? "");
      setEmail(initialUser?.email ?? "");
      setCountry(initialUser?.country ?? "");
      setPassword(""); // Reset password on open
      setPasswordError(null);
      setTouched({name: false, email: false, password: false});
    }
  }, [open, initialUser]);

  if (!open) return null;

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      // Only validate if field has been touched
      if (!isEdit || value.trim()) {
        // For edit mode, only validate if password is provided
        const validation = validatePassword(value, t);
        setPasswordError(validation.error || null);
      } else {
        setPasswordError(null);
      }
    }
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({...prev, password: true}));
    if (!isEdit || password.trim()) {
      // For edit mode, only validate if password is provided
      const validation = validatePassword(password, t);
      setPasswordError(validation.error || null);
    } else {
      setPasswordError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({name: true, email: true, password: true});

    // Validate name and email
    if (!name.trim() || !email.trim()) {
      return;
    }

    // Validate password
    if (!isEdit) {
      // Password required for new users
      if (!password.trim()) {
        setPasswordError(
          t("settings.sections.rolesPermissions.passwordRequired")
        );
        return;
      }
      const validation = validatePassword(password, t);
      if (!validation.valid) {
        setPasswordError(validation.error || null);
        return;
      }
    } else {
      // For edit mode, validate password only if provided
      if (password.trim()) {
        const validation = validatePassword(password, t);
        if (!validation.valid) {
          setPasswordError(validation.error || null);
          return;
        }
      }
    }

    // Clear any errors before submitting
    setPasswordError(null);

    onSubmit({
      id: initialUser?.id,
      name: name.trim(),
      email: email.trim(),
      password: password.trim() || undefined, // Only include if provided
      country: country.trim() || undefined, // Only include if provided
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              {isEdit
                ? t("settings.sections.rolesPermissions.editUserIn", {
                    roleName,
                  })
                : t("settings.sections.rolesPermissions.addNewUserTo", {
                    roleName,
                  })}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="size-4 text-slate-400" />
            </button>
          </div>
          <form
            onSubmit={handleSubmit}
            className="px-5 py-4"
            autoComplete="off"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-900 mb-2">
                    {t("settings.sections.rolesPermissions.name")}
                  </label>
                  <input
                    type="text"
                    placeholder={t(
                      "settings.sections.rolesPermissions.namePlaceholder"
                    )}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-900 mb-2">
                    {t("settings.sections.rolesPermissions.email")}
                  </label>
                  <input
                    type="email"
                    placeholder={t(
                      "settings.sections.rolesPermissions.emailPlaceholder"
                    )}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isEdit}
                    autoComplete="off"
                    className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent text-slate-900 text-sm ${
                      isEdit ? "bg-slate-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-900 mb-2">
                  {t("settings.sections.rolesPermissions.password")}
                  {isEdit &&
                    ` (${t(
                      "settings.sections.rolesPermissions.passwordLeaveEmpty"
                    )})`}
                </label>
                <input
                  type="password"
                  placeholder={t(
                    "settings.sections.rolesPermissions.passwordPlaceholder"
                  )}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={handlePasswordBlur}
                  required={!isEdit}
                  autoComplete="new-password"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 text-sm ${
                    passwordError && touched.password
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-200"
                  }`}
                />
                {passwordError && touched.password && (
                  <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                )}
                {!isEdit && !passwordError && touched.password && (
                  <p className="mt-1 text-xs text-slate-500">
                    {t(
                      "settings.sections.rolesPermissions.passwordRequirements"
                    )}
                  </p>
                )}
              </div>
              <div>
                <CountrySelect
                  label={
                    t("settings.sections.rolesPermissions.country") || "Country"
                  }
                  value={country}
                  onChange={setCountry}
                  placeholder={
                    t(
                      "settings.sections.rolesPermissions.countryPlaceholder"
                    ) || "Search countries..."
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("settings.sections.rolesPermissions.cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-[#1B54FE] text-white hover:bg-[#1545d4] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? t("settings.sections.rolesPermissions.saving")
                  : isEdit
                  ? t("settings.sections.rolesPermissions.save")
                  : t("settings.sections.rolesPermissions.add")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
