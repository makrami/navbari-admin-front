import type { ReactNode } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

type CollapsibleSectionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
};

export function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
  className,
}: CollapsibleSectionProps) {
  return (
    <div
      className={cn(
        "bg-slate-50 rounded-xl border border-slate-300",
        className
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-6"
      >
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <ChevronUp
          className={cn(
            "w-5 h-5 text-slate-600 transition-transform duration-300",
            !isOpen && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
