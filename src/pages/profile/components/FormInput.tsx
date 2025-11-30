type FormInputProps = {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

export function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  className,
  disabled = false,
}: FormInputProps) {
  return (
    <div className={className}>
      <label className="block text-xs text-slate-900 mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-slate-200 !bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500"
      />
    </div>
  );
}
