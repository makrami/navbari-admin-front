import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Bell,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import type { AlertMessage, MessageStatus } from "../types/chat";

interface AlertCardProps {
  message: AlertMessage;
}

const ALERT_CONFIG: Record<
  string,
  { bgColor: string; icon: React.ReactNode; textColor: string }
> = {
  warning: {
    bgColor: "bg-yellow-50",
    icon: <AlertTriangle className="size-5 text-orange-500" />,
    textColor: "text-slate-900",
  },
  success: {
    bgColor: "bg-green-50",
    icon: <CheckCircle2 className="size-5 text-green-600" />,
    textColor: "text-slate-900",
  },
  alert: {
    bgColor: "bg-red-50",
    icon: <Bell className="size-5 text-red-500" />,
    textColor: "text-red-900",
  },
  info: {
    bgColor: "bg-blue-50",
    icon: <Info className="size-5 text-blue-600" />,
    textColor: "text-slate-900",
  },
  default: {
    bgColor: "bg-slate-50",
    icon: <AlertTriangle className="size-5 text-slate-500" />,
    textColor: "text-slate-900",
  },
};

export function AlertCard({ message }: AlertCardProps) {
  const config = ALERT_CONFIG[message.alertType] || ALERT_CONFIG.default;
  const description = message.description || message.title;
  const isOutgoing = message.isOutgoing ?? false; // Default to incoming (left-aligned)
  const status = message.status;

  if (isOutgoing) {
    // Right-aligned alert card (outgoing)
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] flex flex-col items-end">
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl px-4 py-3",
              config.bgColor
            )}
          >
            <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="space-y-1">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span
                    className={cn("font-semibold text-sm", config.textColor)}
                  >
                    {message.title}
                  </span>
                  {message.shipmentId && (
                    <span className={cn("text-xs", config.textColor)}>
                      ({message.shipmentId})
                    </span>
                  )}
                </div>
                {description && (
                  <span className={cn("text-sm block", config.textColor)}>
                    {description}
                  </span>
                )}
                {message.fileUrl && (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "inline-flex items-center gap-2 text-xs font-medium underline",
                      config.textColor
                    )}
                  >
                    {message.fileName ?? "Download attachment"}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className={cn("text-xs", config.textColor)}>
              {message.timestamp}
            </span>
            {status && <AlertStatusIcon status={status} />}
          </div>
        </div>
      </div>
    );
  }

  // Left-aligned alert card (incoming)
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
          <div className="space-y-1">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className={cn("font-semibold text-sm", config.textColor)}>
                {message.title}
              </span>
              {message.shipmentId && (
                <span className={cn("text-xs", config.textColor)}>
                  ({message.shipmentId})
                </span>
              )}
            </div>
            {description && (
              <span className={cn("text-sm block", config.textColor)}>
                {description}
              </span>
            )}
            {message.fileUrl && (
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 text-xs font-medium underline",
                  config.textColor
                )}
              >
                {message.fileName ?? "Download attachment"}
              </a>
            )}
            <span className={cn("text-xs mt-1 block", config.textColor)}>
              {message.timestamp}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertStatusIcon({ status }: { status: MessageStatus }) {
  switch (status) {
    case "sending":
      return (
        <Loader2
          className="size-3 text-slate-400 animate-spin"
          aria-label="Sending"
        />
      );
    case "sent":
      return <Check className="size-3 text-green-500" aria-label="Sent" />;
    case "failed":
      return (
        <AlertTriangle className="size-3 text-red-500" aria-label="Failed" />
      );
    default:
      return null;
  }
}
