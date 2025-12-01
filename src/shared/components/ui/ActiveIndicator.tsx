import { useRTL } from "../../hooks/useRTL";

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
  const isRTL = useRTL();

  return (
    <span
      aria-hidden
      className={`absolute ${
        isRTL ? "right-0 rounded-l" : "left-0 rounded-r"
      } top-0 h-full ${widthClass} ${
        isActive ? "block" : "hidden"
      } ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}
