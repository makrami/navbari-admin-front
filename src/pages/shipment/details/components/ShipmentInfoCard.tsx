import type { PropsWithChildren } from "react";
import { cn } from "../../../../shared/utils/cn";

type ShipmentInfoCardProps = PropsWithChildren<{
  className?: string;
  title?: string;
  shipmentId?: string;
}>;
import {
  DollarSignIcon,
  TimerIcon,
  MapIcon,
  MessagesSquareIcon,
  BellIcon,
  XIcon,
} from "lucide-react";

// Matches Figma: rounded-16, white bg, 16px padding, 32px gap
export function ShipmentInfoCard({
  className,
  title = "Electronic Shipment n.21",
  shipmentId = "#6c23m68",
}: ShipmentInfoCardProps) {
  return (
    <section
      data-name="Shipment Info Card"
      className={cn(
        "bg-white rounded-[16px] p-4 flex flex-col gap-8",
        className
      )}
    >
      <div
        className="flex items-center justify-between w-full"
        data-name="Shipment Header"
      >
        <div className="flex flex-col gap-1 min-w-px" data-name="Shipment Info">
          <p className="text-slate-900 font-semibold text-xs leading-none">
            {title}
          </p>
          <p className="text-slate-400 text-xs leading-none">{shipmentId}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Icon buttons (outline, subtle) */}
          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto"
            aria-label="Pricing"
          >
            <DollarSignIcon className="block size-5 text-slate-400" />
          </button>
          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto"
            aria-label="Time"
          >
            <TimerIcon className="block size-5 text-slate-400" />
          </button>
          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto"
            aria-label="Map"
          >
            <MapIcon className="block size-5 text-slate-400" />
          </button>

          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto relative"
            aria-label="Chat"
          >
            <MessagesSquareIcon className="block size-5 text-slate-400" />
          </button>
          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto relative"
            aria-label="Chat"
          >
            <BellIcon className="block size-5 text-slate-400" />
            <span className="absolute -top-0 -left-0 block size-[6px] rounded-full bg-red-500" />
          </button>
          <button
            type="button"
            className="bg-red-500/10 hover:scale-105 transition-all duration-300 rounded-[8px] p-2 size-auto"
            aria-label="Close"
          >
            <XIcon className="block size-5 text-red-500" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default ShipmentInfoCard;
