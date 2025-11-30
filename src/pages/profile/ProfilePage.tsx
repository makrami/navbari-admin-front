import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PersonalInfoSection } from "./components/PersonalInfoSection";
import { AccountSettingsSection } from "./components/AccountSettingsSection";
import {
  useCurrentUser,
  useResetPassword,
  useUpdateProfile,
} from "../../services/user/hooks";
import { useLogoutAll } from "../../services/auth/hooks";
import { getFileUrl } from "../Drivers/utils";

type PersonalInfoForm = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  userRole: string;
  avatarUrl: string | null;
};

type PasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function ProfilePage() {
  const navigate = useNavigate();
  const { data: userData, isLoading, error } = useCurrentUser();
  const resetPasswordMutation = useResetPassword();
  const updateProfileMutation = useUpdateProfile();
  const logoutAllMutation = useLogoutAll();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoForm>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    userRole: "",
    avatarUrl: null,
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [personalInfoChanges, setPersonalInfoChanges] = useState(0);
  const [accountSettingsChanges, setAccountSettingsChanges] = useState(0);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Parse fullName into firstName and lastName
  const parseFullName = (
    fullName: string | null | undefined
  ): { firstName: string; lastName: string } => {
    if (!fullName) return { firstName: "", lastName: "" };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return { firstName: "", lastName: "" };
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  };

  // Get firstName and lastName from user data (prefer direct fields, fallback to parsing fullName)
  const getUserNames = useCallback(
    (user: typeof userData): { firstName: string; lastName: string } => {
      if (!user) return { firstName: "", lastName: "" };

      const userRecord = user as Record<string, unknown>;
      const firstName = userRecord.firstName as string | undefined;
      const lastName = userRecord.lastName as string | undefined;

      // If firstName and lastName exist directly, use them
      if (firstName !== undefined && lastName !== undefined) {
        return {
          firstName: firstName || "",
          lastName: lastName || "",
        };
      }

      // Otherwise, parse from fullName
      return parseFullName(user?.fullName);
    },
    []
  );

  // Get role title from user data
  const getUserRole = useCallback((user: typeof userData): string => {
    if (user?.role?.title) {
      return user.role.title;
    }
    if (user?.role?.name) {
      return user.role.name;
    }
    return "Administrator (Full access to all modules)";
  }, []);

  // Initialize form data when user data is loaded
  const initialPersonalInfo: PersonalInfoForm = useMemo(() => {
    if (!userData) {
      return {
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        userRole: "",
        avatarUrl: null,
      };
    }

    const { firstName, lastName } = getUserNames(userData);
    const userDataRecord = userData as Record<string, unknown>;
    const avatarUrl =
      (userDataRecord.avatarUrl as string | null | undefined) || null;

    return {
      firstName,
      lastName,
      phoneNumber: userData.phoneNumber || "",
      email: userData.email || "",
      userRole: getUserRole(userData),
      avatarUrl: avatarUrl ? getFileUrl(avatarUrl) || null : null,
    };
  }, [userData, getUserRole, getUserNames]);

  const initialPasswordForm: PasswordForm = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  // Update form when user data is loaded
  useEffect(() => {
    if (userData) {
      const { firstName, lastName } = getUserNames(userData);

      // Get avatarUrl from user data
      const userDataRecord = userData as Record<string, unknown>;
      const avatarUrl =
        (userDataRecord.avatarUrl as string | null | undefined) || null;
      const fullAvatarUrl = avatarUrl ? getFileUrl(avatarUrl) || null : null;

      setPersonalInfo({
        firstName,
        lastName,
        phoneNumber: userData.phoneNumber || "",
        email: userData.email || "",
        userRole: getUserRole(userData),
        avatarUrl: fullAvatarUrl,
      });

      // Set profile photo from user data if available
      if (fullAvatarUrl) {
        setProfilePhoto(fullAvatarUrl);
      }

      // Reset avatar file when user data is loaded
      setAvatarFile(null);
      setPersonalInfoChanges(0);
    }
  }, [userData, getUserRole, getUserNames]);

  const handlePersonalInfoChange = (
    field: keyof PersonalInfoForm,
    value: string
  ) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
    // Calculate changes - only count firstName, lastName, and avatar
    const updated = { ...personalInfo, [field]: value };
    const firstNameChanged =
      (field === "firstName" ? value : updated.firstName) !==
      initialPersonalInfo.firstName;
    const lastNameChanged =
      (field === "lastName" ? value : updated.lastName) !==
      initialPersonalInfo.lastName;
    const avatarChanged = avatarFile !== null;

    const changes = [firstNameChanged, lastNameChanged, avatarChanged].filter(
      Boolean
    ).length;
    setPersonalInfoChanges(changes);
  };

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError(null);
    }
    // Calculate changes
    const updated = { ...passwordForm, [field]: value };
    const changes = Object.keys(updated).filter(
      (key) =>
        updated[key as keyof PasswordForm] !==
        initialPasswordForm[key as keyof PasswordForm]
    ).length;
    setAccountSettingsChanges(changes);
  };

  const handleRevertPersonalInfo = () => {
    setPersonalInfo(initialPersonalInfo);
    setProfilePhoto(initialPersonalInfo.avatarUrl);
    setAvatarFile(null);
    setPersonalInfoChanges(0);
  };

  const handleRevertAccountSettings = () => {
    setPasswordForm(initialPasswordForm);
    setAccountSettingsChanges(0);
  };

  const handleSavePersonalInfo = async () => {
    try {
      // Only send firstName, lastName, and avatar (File)
      const updateData = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        avatar: avatarFile || null,
      };

      const updatedUser = await updateProfileMutation.mutateAsync(updateData);

      // Update form with new data from server immediately
      // Prefer firstName and lastName from response, fallback to parsing fullName
      const userRecord = updatedUser as Record<string, unknown>;
      const firstNameFromResponse = userRecord.firstName as string | undefined;
      const lastNameFromResponse = userRecord.lastName as string | undefined;

      const firstName =
        firstNameFromResponse !== undefined
          ? firstNameFromResponse || ""
          : parseFullName(updatedUser.fullName).firstName;
      const lastName =
        lastNameFromResponse !== undefined
          ? lastNameFromResponse || ""
          : parseFullName(updatedUser.fullName).lastName;

      // Get avatarUrl from updated user data
      const userDataRecord = updatedUser as Record<string, unknown>;
      const avatarUrl =
        (userDataRecord.avatarUrl as string | null | undefined) || null;
      const fullAvatarUrl = avatarUrl ? getFileUrl(avatarUrl) || null : null;

      // Update personal info with new data from server
      setPersonalInfo((prev) => ({
        ...prev,
        firstName,
        lastName,
        avatarUrl: fullAvatarUrl,
      }));

      // Update profile photo if avatar changed
      if (fullAvatarUrl) {
        setProfilePhoto(fullAvatarUrl);
      }

      // Reset changes count and avatar file on success
      setPersonalInfoChanges(0);
      setAvatarFile(null);

      // Note: The mutation hook will invalidate and refetch userData,
      // which will trigger useEffect to update everything including initialPersonalInfo
    } catch (error) {
      // Error is handled by mutation
      if (error instanceof Error) {
        console.error("Failed to update profile:", error.message);
        // You can show a toast notification here if needed
      }
    }
  };

  // Password validation regex pattern
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  const handleSaveAccountSettings = async () => {
    // Reset error
    setPasswordError(null);

    // Validate old password is provided
    if (!passwordForm.oldPassword) {
      setPasswordError("Old password is required");
      return;
    }

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    // Validate password length
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    // Validate password pattern (lowercase, uppercase, digit, special character)
    if (!passwordRegex.test(passwordForm.newPassword)) {
      setPasswordError(
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)"
      );
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      // Reset form on success
      setPasswordForm(initialPasswordForm);
      setAccountSettingsChanges(0);
      setPasswordError(null);
    } catch (error) {
      // Error is handled by mutation, but we can set a local error message
      if (error instanceof Error) {
        setPasswordError(error.message);
      } else {
        setPasswordError("Failed to reset password. Please try again.");
      }
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllMutation.mutateAsync();
      // Navigate to login page after successful logout
      navigate("/login", { replace: true });
    } catch (error) {
      // Error is handled by mutation
      if (error instanceof Error) {
        console.error("Failed to logout from all devices:", error.message);
        // You can show a toast notification here if needed
      }
    }
  };

  const handlePhotoChange = (file: File | null, preview: string | null) => {
    setAvatarFile(file);
    setProfilePhoto(preview);
    // Update avatarUrl in personalInfo for display purposes
    setPersonalInfo((prev) => ({ ...prev, avatarUrl: preview }));

    // Calculate changes - check if firstName, lastName, or avatar changed
    const firstNameChanged =
      personalInfo.firstName !== initialPersonalInfo.firstName;
    const lastNameChanged =
      personalInfo.lastName !== initialPersonalInfo.lastName;
    const avatarChanged = file !== null;

    const changes = [firstNameChanged, lastNameChanged, avatarChanged].filter(
      Boolean
    ).length;
    setPersonalInfoChanges(changes);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-200 p-5 w-full overflow-auto min-w-0">
        <div className="w-full max-w-7xl mx-auto space-y-3 pb-5">
          <h1 className="font-bold text-slate-900">Profile</h1>
          <div className="bg-white rounded-lg p-5 text-center text-slate-600">
            Loading profile information...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-slate-200 p-5 w-full overflow-auto min-w-0">
        <div className="w-full max-w-7xl mx-auto space-y-3 pb-5">
          <h1 className="font-bold text-slate-900">Profile</h1>
          <div className="bg-white rounded-lg p-5 text-center text-red-600">
            <p className="font-semibold">Error loading profile</p>
            <p className="text-sm mt-2">
              {error instanceof Error
                ? error.message
                : "Failed to load profile information"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-200 p-5 w-full overflow-auto min-w-0">
      <div className="w-full max-w-7xl mx-auto space-y-3 pb-5">
        <h1 className="font-bold text-slate-900">Profile</h1>

        <PersonalInfoSection
          formData={personalInfo}
          profilePhoto={profilePhoto}
          changesCount={personalInfoChanges}
          isSaving={updateProfileMutation.isPending}
          onFormChange={handlePersonalInfoChange}
          onPhotoChange={handlePhotoChange}
          onRevert={handleRevertPersonalInfo}
          onSave={handleSavePersonalInfo}
        />

        <AccountSettingsSection
          passwordForm={passwordForm}
          changesCount={accountSettingsChanges}
          passwordError={passwordError}
          isSaving={resetPasswordMutation.isPending}
          isLoggingOut={logoutAllMutation.isPending}
          onPasswordChange={handlePasswordChange}
          onRevert={handleRevertAccountSettings}
          onSave={handleSaveAccountSettings}
          onLogoutAll={handleLogoutAll}
        />
      </div>
    </div>
  );
}
