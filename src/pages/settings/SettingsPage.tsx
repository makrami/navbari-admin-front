import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingsCard } from "./components/SettingsCard";
import { GeneralSettings } from "./components/GeneralSettings";
import { NotificationSettings } from "./components/NotificationSettings";
import { LocalizationSettings } from "./components/LocalizationSettings";
import { SystemParametersSettings } from "./components/SystemParametersSettings";
import { RolesPermissionsSettings } from "./components/RolesPermissionsSettings";
import type { Role } from "./components/RolesListPanel";
import type { Permission, User } from "./components/RoleDetailsPanel";

export function SettingsPage() {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<string | null>(null);

  // General Settings state
  const [companyName, setCompanyName] = useState("");
  const [timeZone, setTimeZone] = useState("(GMT-05:00) Eastern Time");
  const [mapStyle, setMapStyle] = useState("Google Maps");
  const [distanceUnit, setDistanceUnit] = useState("Kilometers (KM)");
  const [weightUnit, setWeightUnit] = useState("Kilograms (KG)");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Notification Settings state
  const [driverGpsAlertEnabled, setDriverGpsAlertEnabled] = useState(true);
  const [driverGpsAlertValue, setDriverGpsAlertValue] = useState(35);
  const [delayAlertEnabled, setDelayAlertEnabled] = useState(true);
  const [delayAlertValue, setDelayAlertValue] = useState(4);
  const [deliveryNotificationEnabled, setDeliveryNotificationEnabled] =
    useState(true);
  const [missingDocumentReminderEnabled, setMissingDocumentReminderEnabled] =
    useState(false);
  const [missingDocumentReminderValue, setMissingDocumentReminderValue] =
    useState(24);
  const [inApp, setInApp] = useState(true);
  const [email, setEmail] = useState(false);
  const [sms, setSms] = useState(false);
  const [mobilePush, setMobilePush] = useState(true);

  // Localization Settings state
  const [language, setLanguage] = useState("en");
  const [baseCurrency, setBaseCurrency] = useState("USD ($)");
  const [currencyOverrides, setCurrencyOverrides] = useState([
    { id: "1", country: "United Kingdom", currency: "USD ($)" },
  ]);
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState("24h");
  const [numericSeparator, setNumericSeparator] = useState("Comma (,)");
  const [decimalSeparator, setDecimalSeparator] = useState("Period (.)");

  // System Parameters Settings state
  const [loadingTime, setLoadingTime] = useState(4);
  const [transitTime, setTransitTime] = useState(24);
  const [unloadingTime, setUnloadingTime] = useState(3);
  const [etaMethod, setEtaMethod] = useState<"gps" | "historical">("gps");
  const [gpsAlertDistance, setGpsAlertDistance] = useState(10);
  const [pingInterval, setPingInterval] = useState(5);
  const [maxConcurrentShipments, setMaxConcurrentShipments] = useState(15);

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

  // Mock change count for demo
  const changeCount = 5;

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
    {
      key: "localization",
      title: t("settings.sections.localization.title"),
      description: t("settings.sections.localization.description"),
    },
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

  const handleAddRole = () => {
    // Handle add role logic
    console.log("Add role clicked");
  };

  const handleRoleUpdate = (roleId: string, updates: Partial<Role>) => {
    setRoles(roles.map((r) => (r.id === roleId ? { ...r, ...updates } : r)));
  };

  const handleUserEdit = (userId: string) => {
    // Handle user edit logic
    console.log("Edit user:", userId);
  };

  const handleUserRemove = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleCardClick = (key: string) => {
    setOpenSection(openSection === key ? null : key);
  };

  const handleRevert = () => {
    // Handle revert logic
    console.log("Revert clicked");
  };

  const handleSave = () => {
    // Handle save logic
    console.log("Save clicked");
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
                    timeZone={timeZone}
                    onTimeZoneChange={setTimeZone}
                    mapStyle={mapStyle}
                    onMapStyleChange={setMapStyle}
                    distanceUnit={distanceUnit}
                    onDistanceUnitChange={setDistanceUnit}
                    weightUnit={weightUnit}
                    onWeightUnitChange={setWeightUnit}
                    changeCount={changeCount}
                    onRevert={handleRevert}
                    onSave={handleSave}
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
                    deliveryNotificationEnabled={deliveryNotificationEnabled}
                    onDeliveryNotificationToggle={
                      setDeliveryNotificationEnabled
                    }
                    missingDocumentReminderEnabled={
                      missingDocumentReminderEnabled
                    }
                    onMissingDocumentReminderToggle={
                      setMissingDocumentReminderEnabled
                    }
                    missingDocumentReminderValue={missingDocumentReminderValue}
                    onMissingDocumentReminderValueChange={
                      setMissingDocumentReminderValue
                    }
                    inApp={inApp}
                    email={email}
                    sms={sms}
                    mobilePush={mobilePush}
                    onInAppChange={setInApp}
                    onEmailChange={setEmail}
                    onSmsChange={setSms}
                    onMobilePushChange={setMobilePush}
                    changeCount={changeCount}
                    onRevert={handleRevert}
                    onSave={handleSave}
                  />
                ) : section.key === "localization" ? (
                  <LocalizationSettings
                    language={language}
                    onLanguageChange={setLanguage}
                    baseCurrency={baseCurrency}
                    onBaseCurrencyChange={setBaseCurrency}
                    currencyOverrides={currencyOverrides}
                    onCurrencyOverridesChange={setCurrencyOverrides}
                    dateFormat={dateFormat}
                    onDateFormatChange={setDateFormat}
                    timeFormat={timeFormat}
                    onTimeFormatChange={setTimeFormat}
                    numericSeparator={numericSeparator}
                    onNumericSeparatorChange={setNumericSeparator}
                    decimalSeparator={decimalSeparator}
                    onDecimalSeparatorChange={setDecimalSeparator}
                    changeCount={changeCount}
                    onRevert={handleRevert}
                    onSave={handleSave}
                  />
                ) : section.key === "systemParameters" ? (
                  <SystemParametersSettings
                    loadingTime={loadingTime}
                    onLoadingTimeChange={setLoadingTime}
                    transitTime={transitTime}
                    onTransitTimeChange={setTransitTime}
                    unloadingTime={unloadingTime}
                    onUnloadingTimeChange={setUnloadingTime}
                    etaMethod={etaMethod}
                    onEtaMethodChange={setEtaMethod}
                    gpsAlertDistance={gpsAlertDistance}
                    onGpsAlertDistanceChange={setGpsAlertDistance}
                    pingInterval={pingInterval}
                    onPingIntervalChange={setPingInterval}
                    maxConcurrentShipments={maxConcurrentShipments}
                    onMaxConcurrentShipmentsChange={setMaxConcurrentShipments}
                    changeCount={changeCount}
                    onRevert={handleRevert}
                    onSave={handleSave}
                  />
                ) : section.key === "rolesPermissions" ? (
                  <RolesPermissionsSettings
                    roles={roles}
                    selectedRoleId={selectedRoleId}
                    onRoleSelect={setSelectedRoleId}
                    onAddRole={handleAddRole}
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
                    onUserEdit={handleUserEdit}
                    onUserRemove={handleUserRemove}
                    changeCount={changeCount}
                    onRevert={handleRevert}
                    onSave={handleSave}
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
