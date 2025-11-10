import { AlertTriangle } from "lucide-react";

interface ActionableChipsBarProps {
  chips: Array<{
    id: string;
    label: string;
    alertType: string;
  }>;
  onChipClick?: (label: string) => void;
}

export function ActionableChipsBar({
  chips,
  onChipClick,
}: ActionableChipsBarProps) {
  const handleClick = (chipLabel: string) => {
    onChipClick?.(chipLabel);
  };

  return (
    <div className="overflow-x-auto bg-white no-scrollbar px-4 py-3 border-t border-slate-200">
      <div className="flex gap-2 min-w-max">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => handleClick(chip.label)}
            className="flex items-center text-yellow-600 gap-2 px-3 py-2 bg-slate-50 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            <AlertTriangle className="size-4" />
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
