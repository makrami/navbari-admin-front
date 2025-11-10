import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  DollarSign,
  X,
} from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import type { AlertMessage } from "../types/chat";

// GPS Lost icon - MapPin with diagonal line
const GPSLostIcon = () => (
  <div className="relative">
    <MapPin className="size-5 text-red-500" />
    <X
      className="size-4 text-red-500 absolute top-0 left-0.5"
      strokeWidth={3}
    />
  </div>
);

interface AlertCardProps {
  message: AlertMessage;
}

const ALERT_CONFIG: Record<
  string,
  { bgColor: string; icon: React.ReactNode; textColor: string }
> = {
  delay: {
    bgColor: "bg-yellow-50",
    icon: <AlertTriangle className="size-5 text-orange-500" />,
    textColor: "text-slate-900",
  },
  delivered: {
    bgColor: "bg-green-50",
    icon: <CheckCircle2 className="size-5 text-green-600" />,
    textColor: "text-slate-900",
  },
  "gps-lost": {
    bgColor: "bg-red-50",
    icon: <GPSLostIcon />,
    textColor: "text-slate-900",
  },
  payment: {
    bgColor: "bg-blue-50",
    icon: <DollarSign className="size-5 text-blue-600" />,
    textColor: "text-slate-900",
  },
  other: {
    bgColor: "bg-slate-50",
    icon: <AlertTriangle className="size-5 text-slate-500" />,
    textColor: "text-slate-900",
  },
};

export function AlertCard({ message }: AlertCardProps) {
  const config = ALERT_CONFIG[message.alertType] || ALERT_CONFIG.other;

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl px-4 py-3 max-w-[85%] ",
          config.bgColor
        )}
      >
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className={cn("font-semibold text-sm", config.textColor)}>
              {message.title}
            </span>
            {message.shipmentId && (
              <>
                <span className={cn("text-sm", config.textColor)}>
                  ({message.shipmentId})
                </span>
                {message.description && (
                  <span className={cn("text-sm", config.textColor)}>
                    {" "}
                    - {message.description}
                  </span>
                )}
              </>
            )}
            {!message.shipmentId && message.description && (
              <span className={cn("text-sm", config.textColor)}>
                {message.description}
              </span>
            )}
          </div>
          <span className={cn("text-xs mt-1 block", config.textColor)}>
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}
