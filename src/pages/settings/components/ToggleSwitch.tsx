type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-4 w-[30px] items-center rounded-full transition-colors   ${
        checked ? "bg-[#1B54FE]" : "bg-slate-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-[14px] w-[14px] transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-[13px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}
