import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "../../utils/cn";

type ListPanelProps = PropsWithChildren<{
  title?: ReactNode;
  className?: string;
}>;

export function ListPanel({
  title = "List",
  className,
  children,
}: ListPanelProps) {
  return (
    <section
      className={cn(
        "w-1/4 min-w-xs bg-slate-200 p-9 flex flex-col h-screen overflow-hidden space-y-4",
        className
      )}
      data-name="List Panel"
    >
      <header className="shrink-0">
        <h2 className=" font-bold text-slate-900">{title}</h2>
      </header>
      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {children}
      </div>
    </section>
  );
}
