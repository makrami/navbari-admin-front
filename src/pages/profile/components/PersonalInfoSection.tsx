import { useState } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormInput } from "./FormInput";
import { ProfilePhotoUpload } from "./ProfilePhotoUpload";
import { ActionButtons } from "./ActionButtons";

type PersonalInfoForm = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  userRole: string;
};

type PersonalInfoSectionProps = {
  formData: PersonalInfoForm;
  profilePhoto: string | null;
  changesCount: number;
  isSaving?: boolean;
  onFormChange: (field: keyof PersonalInfoForm, value: string) => void;
  onPhotoChange: (photo: string | null) => void;
  onRevert: () => void;
  onSave: () => void;
};

export function PersonalInfoSection({
  formData,
  profilePhoto,
  changesCount,
  isSaving = false,
  onFormChange,
  onPhotoChange,
  onRevert,
  onSave,
}: PersonalInfoSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <CollapsibleSection
      title="Personal Info"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      className="p-3"
    >
      {/* Form Fields - Two Columns */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          placeholder="First name..."
          value={formData.firstName}
          onChange={(value) => onFormChange("firstName", value)}
        />
        <FormInput
          label="Last Name"
          placeholder="Last name..."
          value={formData.lastName}
          onChange={(value) => onFormChange("lastName", value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Phone Number"
          placeholder="+12345678"
          value={formData.phoneNumber}
          onChange={(value) => onFormChange("phoneNumber", value)}
        />
        <FormInput
          label="Email"
          type="email"
          placeholder="example@info.com"
          value={formData.email}
          onChange={(value) => onFormChange("email", value)}
        />
      </div>

      {/* User Role */}
      <div>
        <label className="block text-xs text-slate-900 mb-2">User Role</label>
        <div className="px-3 py-2 text-sm bg-white border font-bold border-slate-200 rounded-lg text-slate-700">
          {formData.userRole}
        </div>
      </div>

      {/* Profile Photo Upload */}
      <ProfilePhotoUpload photo={profilePhoto} onPhotoChange={onPhotoChange} />

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
