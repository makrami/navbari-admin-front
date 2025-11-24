import {useState, useEffect, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {SettingsCard} from "./components/SettingsCard";
import {GeneralSettings} from "./components/GeneralSettings";
import {NotificationSettings} from "./components/NotificationSettings";
import {SystemParametersSettings} from "./components/SystemParametersSettings";
import {RolesPermissionsSettings} from "./components/RolesPermissionsSettings";
import type {Role} from "./components/RolesListPanel";
import type {Permission, User} from "./components/RoleDetailsPanel";
import {
  useSettings,
  useUpdateGeneralSettings,
  useUpdateNotificationSettings,
  useUpdateSlaSettings,
} from "../../services/settings/hooks";
import {
  apiDistanceUnitToUi,
  apiWeightUnitToUi,
  uiDistanceUnitToApi,
  uiWeightUnitToApi,
  apiNotificationChannelsToUi,
  uiNotificationChannelsToApi,
} from "./utils";

export function SettingsPage() {
  const {t} = useTranslation();
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Fetch settings from API
  const {data: settings} = useSettings();
  const updateGeneralMutation = useUpdateGeneralSettings();
  const updateNotificationMutation = useUpdateNotificationSettings();
  const updateSlaMutation = useUpdateSlaSettings();

  // General Settings state
  const [companyName, setCompanyName] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("Kilometers (KM)");
  const [weightUnit, setWeightUnit] = useState("Kilograms (KG)");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
  const [transitTime, setTransitTime] = useState(24);
  const [unloadingTime, setUnloadingTime] = useState(3);

  const [originalSla, setOriginalSla] = useState<{
    loadingTimeHours: number | null;
    transitTimeHours: number | null;
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
      setTransitTime(sla.transitTimeHours || 24);
      setUnloadingTime(sla.unloadingTimeHours || 3);
      setOriginalSla({
        loadingTimeHours: sla.loadingTimeHours || null,
        transitTimeHours: sla.transitTimeHours || null,
        unloadingTimeHours: sla.unloadingTimeHours || null,
      });
    }
  }, [settings]);

  // Roles & Permissions Settings state
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "Support Staff",
      description: "View-only access for support",
      userCount: 6,
      status: "Active",
    },
    {
      id: "2",
      name: "Driver Coordinator",
      description: "Limited to driver management",
      userCount: 6,
      status: "Suspended",
    },
    {
      id: "3",
      name: "Administrator",
      description: "Full access to all modules",
      userCount: 6,
      status: "Active",
    },
    {
      id: "4",
      name: "Operations Manager",
      description: "Manages shipments and drivers",
      userCount: 6,
      status: "Suspended",
    },
  ]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>("3");
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
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      status: "Active",
    },
    {
      id: "2",
      name: "Alistair Valerian",
      email: "valerian.alistair@sample.com",
      status: "Suspended",
    },
    {
      id: "3",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      status: "Active",
    },
    {
      id: "4",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      status: "Active",
    },
    {
      id: "5",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      status: "Suspended",
    },
    {
      id: "6",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      status: "Active",
    },
  ]);

  // Calculate change counts for each section
  const generalChangeCount = useMemo(() => {
    if (!originalGeneral) return 0;
    let count = 0;
    if (companyName !== originalGeneral.companyName) count++;
    if (logoPreview !== originalGeneral.companyLogoUrl) count++;
    if (distanceUnit !== originalGeneral.distanceUnit) count++;
    if (weightUnit !== originalGeneral.weightUnit) count++;
    return count;
  }, [companyName, logoPreview, distanceUnit, weightUnit, originalGeneral]);

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
    if (transitTime !== (originalSla.transitTimeHours || 24)) count++;
    if (unloadingTime !== (originalSla.unloadingTimeHours || 3)) count++;
    return count;
  }, [loadingTime, transitTime, unloadingTime, originalSla]);

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

  const handleRoleUpdate = (roleId: string, updates: Partial<Role>) => {
    setRoles(roles.map((r) => (r.id === roleId ? {...r, ...updates} : r)));
  };

  const handleUserRemove = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleUserAdd = (user: {name: string; email: string}) => {
    const newId = String(Date.now());
    setUsers([
      ...users,
      {id: newId, name: user.name, email: user.email, status: "Active"},
    ]);
    if (selectedRoleId) {
      setRoles(
        roles.map((r) =>
          r.id === selectedRoleId ? {...r, userCount: r.userCount + 1} : r
        )
      );
    }
  };

  const handleUserUpdate = (user: {
    id: string;
    name: string;
    email: string;
  }) => {
    setUsers(
      users.map((u) =>
        u.id === user.id ? {...u, name: user.name, email: user.email} : u
      )
    );
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
      setTransitTime(originalSla.transitTimeHours || 24);
      setUnloadingTime(originalSla.unloadingTimeHours || 3);
    }
  };

  const handleSave = async (
    section: "general" | "notifications" | "systemParameters"
  ) => {
    if (!settings) return;

    try {
      if (section === "general") {
        const updateData = {
          companyName: companyName || undefined,
          companyLogoUrl: logoPreview || undefined,
          distanceUnit: uiDistanceUnitToApi(distanceUnit),
          weightUnit: uiWeightUnitToApi(weightUnit),
        };
        await updateGeneralMutation.mutateAsync(updateData);
        // Update original values after successful save
        setOriginalGeneral({
          companyName,
          companyLogoUrl: logoPreview,
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
          transitTimeHours: transitTime,
          unloadingTimeHours: unloadingTime,
        };
        await updateSlaMutation.mutateAsync(updateData);
        // Update original values after successful save
        setOriginalSla({
          loadingTimeHours: loadingTime,
          transitTimeHours: transitTime,
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
                    distanceUnit={distanceUnit}
                    onDistanceUnitChange={setDistanceUnit}
                    weightUnit={weightUnit}
                    onWeightUnitChange={setWeightUnit}
                    changeCount={generalChangeCount}
                    onRevert={() => handleRevert("general")}
                    onSave={() => handleSave("general")}
                    isLoading={updateGeneralMutation.isPending}
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
                    transitTime={transitTime}
                    onTransitTimeChange={setTransitTime}
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
                    onRoleUpdate={(updates) =>
                      selectedRoleId &&
                      handleRoleUpdate(selectedRoleId, updates)
                    }
                    onPermissionsChange={setPermissions}
                    onUserAdd={handleUserAdd}
                    onUserUpdate={handleUserUpdate}
                    onUserRemove={handleUserRemove}
                    changeCount={0}
                    onRevert={() => {}}
                    onSave={() => {}}
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
