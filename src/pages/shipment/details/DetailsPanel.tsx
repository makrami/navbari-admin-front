import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "../../../shared/utils/cn";

type DetailsPanelProps = PropsWithChildren<{
  className?: string;
  title?: ReactNode;
}>;

export function DetailsPanel({
  className,
  title = "Details",
  children,
}: DetailsPanelProps) {
  return (
    <section className={cn(className)} data-name="Shipment Details Pane">
      {title && (
        <header>
          <h2 className=" font-bold text-slate-900">{title}</h2>
        </header>
      )}
      <div className={title ? "mt-4 grid gap-4" : "grid gap-4"}>{children}</div>
    </section>
  );
}
