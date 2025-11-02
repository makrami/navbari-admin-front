import { AlertConfigCard } from "./AlertConfigCard";
import { DeliveryMethodsSection } from "./DeliveryMethodsSection";
import { SettingsFooter } from "./SettingsFooter";
import { ToggleSwitch } from "./ToggleSwitch";

type NotificationSettingsProps = {
  // Alert configurations
  driverGpsAlertEnabled: boolean;
  onDriverGpsAlertToggle: (enabled: boolean) => void;
  driverGpsAlertValue: number;
  onDriverGpsAlertValueChange: (value: number) => void;

  delayAlertEnabled: boolean;
  onDelayAlertToggle: (enabled: boolean) => void;
  delayAlertValue: number;
  onDelayAlertValueChange: (value: number) => void;

  deliveryNotificationEnabled: boolean;
  onDeliveryNotificationToggle: (enabled: boolean) => void;

  missingDocumentReminderEnabled: boolean;
  onMissingDocumentReminderToggle: (enabled: boolean) => void;
  missingDocumentReminderValue: number;
  onMissingDocumentReminderValueChange: (value: number) => void;

  // Delivery methods
  inApp: boolean;
  email: boolean;
  sms: boolean;
  mobilePush: boolean;
  onInAppChange: (value: boolean) => void;
  onEmailChange: (value: boolean) => void;
  onSmsChange: (value: boolean) => void;
  onMobilePushChange: (value: boolean) => void;

  // Footer
  changeCount: number;
  onRevert: () => void;
  onSave: () => void;
};

export function NotificationSettings({
  driverGpsAlertEnabled,
  onDriverGpsAlertToggle,
  driverGpsAlertValue,
  onDriverGpsAlertValueChange,
  delayAlertEnabled,
  onDelayAlertToggle,
  delayAlertValue,
  onDelayAlertValueChange,
  deliveryNotificationEnabled,
  onDeliveryNotificationToggle,
  missingDocumentReminderEnabled,
  onMissingDocumentReminderToggle,
  missingDocumentReminderValue,
  onMissingDocumentReminderValueChange,
  inApp,
  email,
  sms,
  mobilePush,
  onInAppChange,
  onEmailChange,
  onSmsChange,
  onMobilePushChange,
  changeCount,
  onRevert,
  onSave,
}: NotificationSettingsProps) {
  return (
    <div className="space-y-6 pt-4">
      {/* Top Row - Alert Configurations */}
      <div className="grid grid-cols-2 gap-4">
        <AlertConfigCard
          label="Driver GPS Alert after:"
          enabled={driverGpsAlertEnabled}
          onToggle={onDriverGpsAlertToggle}
          value={driverGpsAlertValue}
          onValueChange={onDriverGpsAlertValueChange}
          unit="MINUTES"
        />
        <AlertConfigCard
          label="Delay Alert after:"
          enabled={delayAlertEnabled}
          onToggle={onDelayAlertToggle}
          value={delayAlertValue}
          onValueChange={onDelayAlertValueChange}
          unit="HOURS"
        />
      </div>

      {/* Middle Row - Alert Configurations */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-100 rounded-lg p-4 ">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Delivery Notification
              </h3>
              <p className="text-xs text-slate-500">
                Notify when shipment arrives at destination customs
              </p>
            </div>
            <ToggleSwitch
              checked={deliveryNotificationEnabled}
              onChange={onDeliveryNotificationToggle}
            />
          </div>
        </div>
        <AlertConfigCard
          label="Missing Document Reminder after:"
          enabled={missingDocumentReminderEnabled}
          onToggle={onMissingDocumentReminderToggle}
          value={missingDocumentReminderValue}
          onValueChange={onMissingDocumentReminderValueChange}
          unit="HOURS"
        />
      </div>

      {/* Delivery Methods Section */}
      <DeliveryMethodsSection
        inApp={inApp}
        email={email}
        sms={sms}
        mobilePush={mobilePush}
        onInAppChange={onInAppChange}
        onEmailChange={onEmailChange}
        onSmsChange={onSmsChange}
        onMobilePushChange={onMobilePushChange}
      />

      {/* Footer */}
      <SettingsFooter
        changeCount={changeCount}
        onRevert={onRevert}
        onSave={onSave}
      />
    </div>
  );
}
