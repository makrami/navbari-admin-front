import {X} from "lucide-react";
import {useEffect, useState} from "react";

/**
 * Validate password according to requirements:
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 */
function validatePassword(password: string): {valid: boolean; error?: string} {
  if (!password) {
    return {valid: false, error: "Password is required"};
  }

  if (password.length < 8) {
    return {valid: false, error: "Password must be at least 8 characters long"};
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one number",
    };
  }

  if (!/[@$!%*?&]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one special character (@$!%*?&)",
    };
  }

  return {valid: true};
}

export type AddEditUserModalProps = {
  open: boolean;
  mode: "add" | "edit";
  roleName: string;
  roleId: string | null;
  initialUser?: {id?: string; name: string; email: string} | null;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    name: string;
    email: string;
    password?: string;
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        const validation = validatePassword(value);
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
      const validation = validatePassword(password);
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
        setPasswordError("Password is required");
        return;
      }
      const validation = validatePassword(password);
      if (!validation.valid) {
        setPasswordError(validation.error || null);
        return;
      }
    } else {
      // For edit mode, validate password only if provided
      if (password.trim()) {
        const validation = validatePassword(password);
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
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              {isEdit ? "Edit User in" : "Add New User to"} “{roleName}”
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="size-4 text-slate-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-5 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-900 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isEdit}
                    className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent text-slate-900 text-sm ${
                      isEdit ? "bg-slate-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-900 mb-2">
                  Password {isEdit && "(leave empty to keep current)"}
                </label>
                <input
                  type="password"
                  placeholder="Password..."
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={handlePasswordBlur}
                  required={!isEdit}
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
                    Must contain: lowercase, uppercase, number, and special
                    character (@$!%*?&)
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-[#1B54FE] text-white hover:bg-[#1545d4] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : isEdit ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
