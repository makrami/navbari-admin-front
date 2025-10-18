import { Plus } from "lucide-react";
import type { MouseEventHandler, PropsWithChildren } from "react";
import { cn } from "../../shared/utils/cn";

type AddShipmentProps = PropsWithChildren<{
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}>;

export function AddShipment({ className, onClick }: AddShipmentProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-2xl bg-[rgba(27,84,254,0.1)] p-4",
        "text-[#1b54fe]",
        className
      )}
      aria-label="Add Shipment"
      data-name="Add Shipment"
    >
      <span className="text-sm font-bold">Add Shipment</span>
      <Plus className="h-5 w-5 text-[#1b54fe]" />
    </button>
  );
}
