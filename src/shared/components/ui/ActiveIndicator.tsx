type ActiveIndicatorProps = {
  isActive: boolean;
  color?: string; // hex or tailwind color class
  widthClass?: string; // tailwind width class (e.g., w-[6px])
  className?: string;
};

export function ActiveIndicator({
  isActive,
  color = "#1b54fe",
  widthClass = "w-[6px]",
  className = "",
}: ActiveIndicatorProps) {
  return (
    <span
      aria-hidden
      className={`absolute left-0 top-0 h-full rounded-r ${widthClass} ${
        isActive ? "block" : "hidden"
      } ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}
