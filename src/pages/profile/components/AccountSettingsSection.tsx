import { useState } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormInput } from "./FormInput";
import { ActionButtons } from "./ActionButtons";

type PasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type AccountSettingsSectionProps = {
  passwordForm: PasswordForm;
  changesCount: number;
  passwordError?: string | null;
  isSaving?: boolean;
  isLoggingOut?: boolean;
  onPasswordChange: (field: keyof PasswordForm, value: string) => void;
  onRevert: () => void;
  onSave: () => void;
  onLogoutAll: () => void;
};

export function AccountSettingsSection({
  passwordForm,
  changesCount,
  passwordError,
  isSaving = false,
  isLoggingOut = false,
  onPasswordChange,
  onRevert,
  onSave,
  onLogoutAll,
}: AccountSettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <CollapsibleSection
      title="Account Settings"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      className="p-6"
    >
      {/* Password Fields - Three Columns */}
      <div className="grid grid-cols-3 gap-4">
        <FormInput
          label="Old Password"
          type="password"
          placeholder="********"
          value={passwordForm.oldPassword}
          onChange={(value) => onPasswordChange("oldPassword", value)}
        />
        <FormInput
          label="New Password"
          type="password"
          placeholder="********"
          value={passwordForm.newPassword}
          onChange={(value) => onPasswordChange("newPassword", value)}
        />
        <FormInput
          label="Confirm Password"
          type="password"
          placeholder="********"
          value={passwordForm.confirmPassword}
          onChange={(value) => onPasswordChange("confirmPassword", value)}
        />
      </div>

      {/* Error Message */}
      {passwordError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{passwordError}</p>
        </div>
      )}

      <div className="inline-flex justify-start bg-red-300/10 p-3 rounded-lg">
        <button
          type="button"
          onClick={onLogoutAll}
          disabled={isLoggingOut}
          className={`text-sm font-medium transition-colors ${
            isLoggingOut
              ? "text-red-400 cursor-not-allowed"
              : "text-red-600 hover:text-red-700"
          }`}
        >
          {isLoggingOut ? "Logging out..." : "Log out from All other Devices"}
        </button>
      </div>

      {/* Action Buttons */}
      <ActionButtons
        changesCount={changesCount}
        onRevert={onRevert}
        onSave={onSave}
        isSaving={isSaving}
      />
    </CollapsibleSection>
  );
}
