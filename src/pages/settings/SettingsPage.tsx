import {useState, useEffect, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {SettingsCard} from "./components/SettingsCard";
import {GeneralSettings} from "./components/GeneralSettings";
import {NotificationSettings} from "./components/NotificationSettings";
import {SystemParametersSettings} from "./components/SystemParametersSettings";
import {RolesPermissionsSettings} from "./components/RolesPermissionsSettings";
import type {Role} from "./components/RolesListPanel";
import type {Permission} from "./components/RoleDetailsPanel";
import {
  useSettings,
  useUpdateGeneralSettings,
  useUpdateNotificationSettings,
  useUpdateSlaSettings,
  useUploadLogo,
} from "../../services/settings/hooks";
import {useRoles, useUpdateRole} from "../../services/roles/hooks";
import {useCreateUser, useUpdateUser} from "../../services/admin/hooks";
import {
  apiDistanceUnitToUi,
  apiWeightUnitToUi,
  uiDistanceUnitToApi,
  uiWeightUnitToApi,
  apiNotificationChannelsToUi,
  uiNotificationChannelsToApi,
} from "./utils";
import {mapApiRoleToUi} from "./utils/roles";

export function SettingsPage() {
  const {t} = useTranslation();
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Fetch settings from API
  const {data: settings} = useSettings();
  const updateGeneralMutation = useUpdateGeneralSettings();
  const updateNotificationMutation = useUpdateNotificationSettings();
  const updateSlaMutation = useUpdateSlaSettings();
  const uploadLogoMutation = useUploadLogo();

  // Fetch roles from API
  const {
    data: apiRoles,
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useRoles();

  // Only show loading if we're loading AND don't have data yet
  const isRolesLoading = isLoadingRoles && apiRoles === undefined;

  // User mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const updateRoleMutation = useUpdateRole();

  // General Settings state
  const [companyName, setCompanyName] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("Kilometers (KM)");
  const [weightUnit, setWeightUnit] = useState("Kilograms (KG)");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);

  // Store original values for change tracking
  const [originalGeneral, setOriginalGeneral] = useState<{
    companyName: string;
    companyLogoUrl: string | null;
    distanceUnit: string;
    weightUnit: string;
  } | null>(null);

  // Notification Settings state
  const [driverGpsAlertEnabled, setDriverGpsAlertEnabled] = useState(true);
  const [driverGpsAlertValue, setDriverGpsAlertValue] = useState(35);
  const [delayAlertEnabled, setDelayAlertEnabled] = useState(true);
  const [delayAlertValue, setDelayAlertValue] = useState(4);
  const [inApp, setInApp] = useState(true);
  const [email, setEmail] = useState(false);
  const [sms, setSms] = useState(false);
  const [mobilePush, setMobilePush] = useState(true);

  const [originalNotification, setOriginalNotification] = useState<{
    gpsOfflineThresholdMin: number | null;
    delayThresholdHr: number | null;
    inApp: boolean;
    email: boolean;
    sms: boolean;
    mobilePush: boolean;
  } | null>(null);

  // System Parameters Settings state (SLA)
  const [loadingTime, setLoadingTime] = useState(4);
  const [customsClearanceTime, setCustomsClearanceTime] = useState(24);
  const [unloadingTime, setUnloadingTime] = useState(3);

  const [originalSla, setOriginalSla] = useState<{
    loadingTimeHours: number | null;
    customsClearanceTimeHours: number | null;
    unloadingTimeHours: number | null;
  } | null>(null);

  // Initialize state from API data
  useEffect(() => {
    if (settings) {
      // General Settings
      const general = settings.general;
      setCompanyName(general.companyName || "");
      setDistanceUnit(apiDistanceUnitToUi(general.distanceUnit));
      setWeightUnit(apiWeightUnitToUi(general.weightUnit));
      setLogoPreview(general.companyLogoUrl || null);
      setOriginalGeneral({
        companyName: general.companyName || "",
        companyLogoUrl: general.companyLogoUrl || null,
        distanceUnit: apiDistanceUnitToUi(general.distanceUnit),
        weightUnit: apiWeightUnitToUi(general.weightUnit),
      });

      // Notification Settings
      const notification = settings.notification;
      const channels = apiNotificationChannelsToUi(
        notification.notificationChannels
      );
      setDriverGpsAlertEnabled(!!notification.gpsOfflineThresholdMin);
      setDriverGpsAlertValue(notification.gpsOfflineThresholdMin || 35);
      setDelayAlertEnabled(!!notification.delayThresholdHr);
      setDelayAlertValue(notification.delayThresholdHr || 4);
      setInApp(channels.inApp);
      setEmail(channels.email);
      setSms(channels.sms);
      setMobilePush(channels.mobilePush);
      setOriginalNotification({
        gpsOfflineThresholdMin: notification.gpsOfflineThresholdMin || null,
        delayThresholdHr: notification.delayThresholdHr || null,
        inApp: channels.inApp,
        email: channels.email,
        sms: channels.sms,
        mobilePush: channels.mobilePush,
      });

      // SLA Settings
      const sla = settings.sla;
      setLoadingTime(sla.loadingTimeHours || 4);
      setCustomsClearanceTime(sla.customsClearanceTimeHours || 24);
      setUnloadingTime(sla.unloadingTimeHours || 3);
      setOriginalSla({
        loadingTimeHours: sla.loadingTimeHours || null,
        customsClearanceTimeHours: sla.customsClearanceTimeHours || null,
        unloadingTimeHours: sla.unloadingTimeHours || null,
      });
    }
  }, [settings]);

  // Roles & Permissions Settings state
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [originalRoles, setOriginalRoles] = useState<
    Map<string, {name: string; description: string}>
  >(new Map());

  // Map API roles to UI roles when data is fetched
  useEffect(() => {
    if (apiRoles !== undefined) {
      const mappedRoles = apiRoles.map(mapApiRoleToUi);
      setRoles(mappedRoles);
      // Store original values for change tracking
      const originalMap = new Map<
        string,
        {name: string; description: string}
      >();
      mappedRoles.forEach((role) => {
        originalMap.set(role.id, {
          name: role.name,
          description: role.description,
        });
      });
      setOriginalRoles(originalMap);
      // Select first role by default if none selected and roles exist
      if (!selectedRoleId && mappedRoles.length > 0) {
        setSelectedRoleId(mappedRoles[0].id);
      }
    }
  }, [apiRoles]);

  // Clear selection if selected role no longer exists
  useEffect(() => {
    if (selectedRoleId && roles.length > 0) {
      const roleExists = roles.find((r) => r.id === selectedRoleId);
      if (!roleExists) {
        setSelectedRoleId(roles.length > 0 ? roles[0].id : null);
      }
    }
  }, [selectedRoleId, roles]);
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      module: "Shipments",
      view: true,
      createEdit: true,
      delete: true,
      approve: true,
    },
    {
      module: "Drivers",
      view: true,
      createEdit: true,
      delete: true,
      approve: true,
    },
    {
      module: "Finance",
      view: true,
      createEdit: true,
      delete: true,
      approve: true,
    },
    {
      module: "Reports",
      view: true,
      createEdit: true,
      delete: true,
      approve: true,
    },
    {
      module: "Settings",
      view: true,
      createEdit: true,
      delete: true,
      approve: true,
    },
  ]);

  // Get users from selected role
  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const users = selectedRole?.users || [];

  // Calculate change counts for each section
  const generalChangeCount = useMemo(() => {
    if (!originalGeneral) return 0;
    let count = 0;
    if (companyName !== originalGeneral.companyName) count++;
    if (
      logoPreview !== originalGeneral.companyLogoUrl ||
      selectedLogoFile !== null
    )
      count++;
    if (distanceUnit !== originalGeneral.distanceUnit) count++;
    if (weightUnit !== originalGeneral.weightUnit) count++;
    return count;
  }, [
    companyName,
    logoPreview,
    selectedLogoFile,
    distanceUnit,
    weightUnit,
    originalGeneral,
  ]);

  const notificationChangeCount = useMemo(() => {
    if (!originalNotification) return 0;
    let count = 0;
    const gpsValue = driverGpsAlertEnabled ? driverGpsAlertValue : null;
    const delayValue = delayAlertEnabled ? delayAlertValue : null;
    if (gpsValue !== originalNotification.gpsOfflineThresholdMin) count++;
    if (delayValue !== originalNotification.delayThresholdHr) count++;
    if (inApp !== originalNotification.inApp) count++;
    if (email !== originalNotification.email) count++;
    if (sms !== originalNotification.sms) count++;
    if (mobilePush !== originalNotification.mobilePush) count++;
    return count;
  }, [
    driverGpsAlertEnabled,
    driverGpsAlertValue,
    delayAlertEnabled,
    delayAlertValue,
    inApp,
    email,
    sms,
    mobilePush,
    originalNotification,
  ]);

  const slaChangeCount = useMemo(() => {
    if (!originalSla) return 0;
    let count = 0;
    if (loadingTime !== (originalSla.loadingTimeHours || 4)) count++;
    if (customsClearanceTime !== (originalSla.customsClearanceTimeHours || 24))
      count++;
    if (unloadingTime !== (originalSla.unloadingTimeHours || 3)) count++;
    return count;
  }, [loadingTime, customsClearanceTime, unloadingTime, originalSla]);

  // Calculate role change count for selected role
  const roleChangeCount = useMemo(() => {
    if (!selectedRoleId || originalRoles.size === 0) return 0;
    const selectedRole = roles.find((r) => r.id === selectedRoleId);
    const originalRole = originalRoles.get(selectedRoleId);
    if (!selectedRole || !originalRole) return 0;
    let count = 0;
    if (selectedRole.name !== originalRole.name) count++;
    if (selectedRole.description !== originalRole.description) count++;
    return count;
  }, [selectedRoleId, roles, originalRoles]);

  const sections = [
    {
      key: "general",
      title: t("settings.sections.general.title"),
      description: t("settings.sections.general.description"),
    },
    {
      key: "notifications",
      title: t("settings.sections.notifications.title"),
      description: t("settings.sections.notifications.description"),
    },
    // {
    //   key: "localization",
    //   title: t("settings.sections.localization.title"),
    //   description: t("settings.sections.localization.description"),
    // },
    {
      key: "systemParameters",
      title: t("settings.sections.systemParameters.title"),
      description: t("settings.sections.systemParameters.description"),
    },
    {
      key: "rolesPermissions",
      title: t("settings.sections.rolesPermissions.title"),
      description: t("settings.sections.rolesPermissions.description"),
    },
  ];

  const handleRoleUpdate = (updates: Partial<Role>) => {
    if (!selectedRoleId) return;
    setRoles(
      roles.map((r) => (r.id === selectedRoleId ? {...r, ...updates} : r))
    );
  };

  const handleUserRemove = (userId: string) => {
    if (!selectedRoleId) return;
    setRoles(
      roles.map((r) =>
        r.id === selectedRoleId
          ? {
              ...r,
              users: r.users.filter((u) => u.id !== userId),
              userCount: r.users.filter((u) => u.id !== userId).length,
            }
          : r
      )
    );
  };

  const handleUserAdd = async (user: {
    name: string;
    email: string;
    password: string;
  }) => {
    if (!selectedRoleId) return;

    try {
      await createUserMutation.mutateAsync({
        email: user.email,
        fullName: user.name,
        password: user.password,
        roleId: selectedRoleId,
        appScope: "head_office",
        isActive: true,
      });
      // Roles will be refetched automatically due to query invalidation
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error; // Re-throw to let the modal handle it
    }
  };

  const handleUserUpdate = async (user: {
    id: string;
    name: string;
    email: string;
    password?: string;
  }) => {
    if (!selectedRoleId) return;

    try {
      const updateData: {
        fullName?: string;
        password?: string;
        isActive?: boolean;
      } = {
        fullName: user.name,
      };

      // Only include password if provided
      if (user.password) {
        updateData.password = user.password;
      }

      await updateUserMutation.mutateAsync({
        id: user.id,
        data: updateData,
      });
      // Roles will be refetched automatically due to query invalidation
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error; // Re-throw to let the modal handle it
    }
  };

  const handleUserStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: {isActive},
      });
      // Roles will be refetched automatically due to query invalidation
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const handleCardClick = (key: string) => {
    setOpenSection(openSection === key ? null : key);
  };

  const handleRevert = (
    section: "general" | "notifications" | "systemParameters"
  ) => {
    if (!settings) return;

    if (section === "general" && originalGeneral) {
      setCompanyName(originalGeneral.companyName);
      setDistanceUnit(originalGeneral.distanceUnit);
      setWeightUnit(originalGeneral.weightUnit);
      setLogoPreview(originalGeneral.companyLogoUrl);
      setSelectedLogoFile(null);
    } else if (section === "notifications" && originalNotification) {
      setDriverGpsAlertEnabled(!!originalNotification.gpsOfflineThresholdMin);
      setDriverGpsAlertValue(originalNotification.gpsOfflineThresholdMin || 35);
      setDelayAlertEnabled(!!originalNotification.delayThresholdHr);
      setDelayAlertValue(originalNotification.delayThresholdHr || 4);
      setInApp(originalNotification.inApp);
      setEmail(originalNotification.email);
      setSms(originalNotification.sms);
      setMobilePush(originalNotification.mobilePush);
    } else if (section === "systemParameters" && originalSla) {
      setLoadingTime(originalSla.loadingTimeHours || 4);
      setCustomsClearanceTime(originalSla.customsClearanceTimeHours || 24);
      setUnloadingTime(originalSla.unloadingTimeHours || 3);
    }
  };

  const handleSave = async (
    section: "general" | "notifications" | "systemParameters"
  ) => {
    if (!settings) return;

    try {
      if (section === "general") {
        let logoUrl = logoPreview;

        // If a new file was selected, upload it first
        if (selectedLogoFile) {
          const uploadResult = await uploadLogoMutation.mutateAsync(
            selectedLogoFile
          );
          logoUrl = uploadResult.url;
          // Update preview with the uploaded URL
          setLogoPreview(logoUrl);
          // Clear the selected file since it's been uploaded
          setSelectedLogoFile(null);
        }

        const updateData = {
          companyName: companyName || undefined,
          companyLogoUrl: logoUrl || undefined,
          distanceUnit: uiDistanceUnitToApi(distanceUnit),
          weightUnit: uiWeightUnitToApi(weightUnit),
        };
        await updateGeneralMutation.mutateAsync(updateData);
        // Update original values after successful save
        setOriginalGeneral({
          companyName,
          companyLogoUrl: logoUrl,
          distanceUnit,
          weightUnit,
        });
      } else if (section === "notifications") {
        const updateData = {
          gpsOfflineThresholdMin: driverGpsAlertEnabled
            ? driverGpsAlertValue
            : undefined,
          delayThresholdHr: delayAlertEnabled ? delayAlertValue : undefined,
          notificationChannels: uiNotificationChannelsToApi(
            inApp,
            email,
            sms,
            mobilePush
          ),
        };
        await updateNotificationMutation.mutateAsync(updateData);
        // Update original values after successful save
        setOriginalNotification({
          gpsOfflineThresholdMin: driverGpsAlertEnabled
            ? driverGpsAlertValue
            : null,
          delayThresholdHr: delayAlertEnabled ? delayAlertValue : null,
          inApp,
          email,
          sms,
          mobilePush,
        });
      } else if (section === "systemParameters") {
        const updateData = {
          loadingTimeHours: loadingTime,
          customsClearanceTimeHours: customsClearanceTime,
          unloadingTimeHours: unloadingTime,
        };
        await updateSlaMutation.mutateAsync(updateData);
        // Update original values after successful save
        setOriginalSla({
          loadingTimeHours: loadingTime,
          customsClearanceTimeHours: customsClearanceTime,
          unloadingTimeHours: unloadingTime,
        });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Error handling is done by the mutation hooks
    }
  };

  return (
    <div className="h-screen bg-slate-100 overflow-y-auto no-scrollbar">
      <div className="py-6 max-w-5xl mx-auto  px-4">
        {/* Header */}
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          {t("settings.page.title")}
        </h1>

        {/* Settings Cards */}
        <div className="space-y-4">
          {sections.map((section) => {
            const isOpen = openSection === section.key;
            return (
              <SettingsCard
                key={section.key}
                title={section.title}
                description={section.description}
                isOpen={isOpen}
                onToggle={() => handleCardClick(section.key)}
              >
                {section.key === "general" ? (
                  <GeneralSettings
                    companyName={companyName}
                    onCompanyNameChange={setCompanyName}
                    logoPreview={logoPreview}
                    onLogoChange={setLogoPreview}
                    onFileSelect={setSelectedLogoFile}
                    distanceUnit={distanceUnit}
                    onDistanceUnitChange={setDistanceUnit}
                    weightUnit={weightUnit}
                    onWeightUnitChange={setWeightUnit}
                    changeCount={generalChangeCount}
                    onRevert={() => handleRevert("general")}
                    onSave={() => handleSave("general")}
                    isLoading={
                      updateGeneralMutation.isPending ||
                      uploadLogoMutation.isPending
                    }
                  />
                ) : section.key === "notifications" ? (
                  <NotificationSettings
                    driverGpsAlertEnabled={driverGpsAlertEnabled}
                    onDriverGpsAlertToggle={setDriverGpsAlertEnabled}
                    driverGpsAlertValue={driverGpsAlertValue}
                    onDriverGpsAlertValueChange={setDriverGpsAlertValue}
                    delayAlertEnabled={delayAlertEnabled}
                    onDelayAlertToggle={setDelayAlertEnabled}
                    delayAlertValue={delayAlertValue}
                    onDelayAlertValueChange={setDelayAlertValue}
                    inApp={inApp}
                    email={email}
                    sms={sms}
                    mobilePush={mobilePush}
                    onInAppChange={setInApp}
                    onEmailChange={setEmail}
                    onSmsChange={setSms}
                    onMobilePushChange={setMobilePush}
                    changeCount={notificationChangeCount}
                    onRevert={() => handleRevert("notifications")}
                    onSave={() => handleSave("notifications")}
                    isLoading={updateNotificationMutation.isPending}
                  />
                ) : //   : section.key === "localization" ? (
                // <LocalizationSettings
                //   language={language}
                //   onLanguageChange={setLanguage}
                //   baseCurrency={baseCurrency}
                //   onBaseCurrencyChange={setBaseCurrency}
                //   currencyOverrides={currencyOverrides}
                //   onCurrencyOverridesChange={setCurrencyOverrides}
                //   dateFormat={dateFormat}
                //   onDateFormatChange={setDateFormat}
                //   timeFormat={timeFormat}
                //   onTimeFormatChange={setTimeFormat}
                //   numericSeparator={numericSeparator}
                //   onNumericSeparatorChange={setNumericSeparator}
                //   decimalSeparator={decimalSeparator}
                //   onDecimalSeparatorChange={setDecimalSeparator}
                //   changeCount={changeCount}
                //   onRevert={handleRevert}
                //   onSave={handleSave}
                // />
                //   )
                section.key === "systemParameters" ? (
                  <SystemParametersSettings
                    loadingTime={loadingTime}
                    onLoadingTimeChange={setLoadingTime}
                    customsClearanceTime={customsClearanceTime}
                    onCustomsClearanceTimeChange={setCustomsClearanceTime}
                    unloadingTime={unloadingTime}
                    onUnloadingTimeChange={setUnloadingTime}
                    changeCount={slaChangeCount}
                    onRevert={() => handleRevert("systemParameters")}
                    onSave={() => handleSave("systemParameters")}
                    isLoading={updateSlaMutation.isPending}
                  />
                ) : section.key === "rolesPermissions" ? (
                  <RolesPermissionsSettings
                    roles={roles}
                    selectedRoleId={selectedRoleId}
                    onRoleSelect={setSelectedRoleId}
                    selectedRole={
                      roles.find((r) => r.id === selectedRoleId) || null
                    }
                    permissions={permissions}
                    users={users}
                    onRoleUpdate={handleRoleUpdate}
                    onPermissionsChange={setPermissions}
                    onUserAdd={handleUserAdd}
                    onUserUpdate={handleUserUpdate}
                    onUserRemove={handleUserRemove}
                    onUserStatusChange={handleUserStatusChange}
                    changeCount={roleChangeCount}
                    onRevert={() => {
                      if (!selectedRoleId) return;
                      const originalRole = originalRoles.get(selectedRoleId);
                      if (originalRole) {
                        handleRoleUpdate({
                          name: originalRole.name,
                          description: originalRole.description,
                        });
                      }
                    }}
                    onSave={async () => {
                      if (!selectedRoleId) return;
                      const selectedRole = roles.find(
                        (r) => r.id === selectedRoleId
                      );
                      if (!selectedRole) return;
                      try {
                        await updateRoleMutation.mutateAsync({
                          id: selectedRoleId,
                          data: {
                            title: selectedRole.name,
                            description: selectedRole.description || null,
                          },
                        });
                        // Update original values after successful save
                        setOriginalRoles((prev) => {
                          const newMap = new Map(prev);
                          newMap.set(selectedRoleId, {
                            name: selectedRole.name,
                            description: selectedRole.description,
                          });
                          return newMap;
                        });
                      } catch (error) {
                        console.error("Failed to save role:", error);
                        // Error handling is done by the mutation hooks
                      }
                    }}
                    isLoadingRoles={isRolesLoading}
                    rolesError={rolesError}
                    isSavingRole={updateRoleMutation.isPending}
                  />
                ) : (
                  <div className="pt-4 text-sm text-slate-500">
                    {/* Content will be added when sections are implemented */}
                  </div>
                )}
              </SettingsCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
