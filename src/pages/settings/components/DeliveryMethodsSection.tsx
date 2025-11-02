type DeliveryMethodOptionProps = {
  label: string;
  selected: boolean;
  onToggle: () => void;
};

function DeliveryMethodOption({
  label,
  selected,
  onToggle,
}: DeliveryMethodOptionProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full px-4 py-3 rounded-lg border transition-colors flex items-center justify-between ${
        selected
          ? "bg-[#1B54FE]/10 border-[#1B54FE]/20"
          : "bg-white border-transparent hover:border-slate-300"
      }`}
    >
      <span
        className={`text-sm font-medium ${
          selected ? "text-[#1B54FE]" : "text-slate-700"
        }`}
      >
        {label}
      </span>
      <div
        className={`size-4 rounded border-2 transition-colors flex items-center justify-center ${
          selected
            ? "bg-white border-[#1B54FE] p-[1px]"
            : "bg-white border-slate-300 p-[1px]"
        }`}
      >
        {selected && <div className="w-full h-full bg-[#1B54FE] " />}
      </div>
    </button>
  );
}

type DeliveryMethodsSectionProps = {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  mobilePush: boolean;
  onInAppChange: (value: boolean) => void;
  onEmailChange: (value: boolean) => void;
  onSmsChange: (value: boolean) => void;
  onMobilePushChange: (value: boolean) => void;
};

export function DeliveryMethodsSection({
  inApp,
  email,
  sms,
  mobilePush,
  onInAppChange,
  onEmailChange,
  onSmsChange,
  onMobilePushChange,
}: DeliveryMethodsSectionProps) {
  return (
    <div className="space-y-3 p-4 rounded-lg bg-slate-100 grid grid-cols-2 gap-3">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-2">
          Delivery Methods
        </h3>
        <p className="text-sm text-slate-400">
          Select how you want to receive the enabled alerts
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DeliveryMethodOption
          label="In-App Notif"
          selected={inApp}
          onToggle={() => onInAppChange(!inApp)}
        />
        <DeliveryMethodOption
          label="Email"
          selected={email}
          onToggle={() => onEmailChange(!email)}
        />
        <DeliveryMethodOption
          label="SMS"
          selected={sms}
          onToggle={() => onSmsChange(!sms)}
        />
        <DeliveryMethodOption
          label="Mobile Push"
          selected={mobilePush}
          onToggle={() => onMobilePushChange(!mobilePush)}
        />
      </div>
    </div>
  );
}
