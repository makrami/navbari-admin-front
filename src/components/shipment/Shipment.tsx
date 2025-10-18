import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "../../shared/utils/cn";

type ShipmentProps = PropsWithChildren<{
  title?: ReactNode;
  className?: string;
}>;

export function Shipment({
  title = "Shipment",
  className,
  children,
}: ShipmentProps) {
  return (
    <section
      className={cn(
        "w-1/4 min-w-xs bg-slate-200 p-9 flex flex-col h-screen overflow-hidden space-y-4",
        className
      )}
      data-name="Shipment"
    >
      <header>
        <h2 className=" font-bold text-slate-900">{title}</h2>
      </header>
      <div className="grid gap-4 overflow-y-auto no-scrollbar flex-1">
        {children}
      </div>
    </section>
  );
}
