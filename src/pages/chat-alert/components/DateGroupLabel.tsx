import type { DateGroup } from "../types/chat";

interface DateGroupLabelProps {
  dateGroup: DateGroup;
}

export function DateGroupLabel({ dateGroup }: DateGroupLabelProps) {
  const getLabel = () => {
    if (dateGroup === "today") return "Today";
    if (dateGroup === "yesterday") return "Yesterday";
    return dateGroup; // For other dates, use the date string directly
  };

  return (
    <div className="flex justify-center">
      <span className="text-sm font-medium text-slate-600">{getLabel()}</span>
    </div>
  );
}
