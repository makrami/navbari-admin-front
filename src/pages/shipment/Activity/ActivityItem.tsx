import {
  CheckCircle2,
  Paperclip,
  Repeat2,
  FileText,
  CheckCircle,
  XCircle,
  DollarSign,
  UserCheck,
  FileCheck,
  FileX,
  Settings,
  Clock,
  Navigation,
  ArrowRight,
  Package,
  MapPin,
  Truck,
  ShieldCheck,
  Loader,
  Ban,
  Hourglass,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ActivityItemData } from "./types";
import { ACTIVITY_TYPE } from "../../../services/shipment/shipment.api.service";
import { SegmentStatus } from "../../../shared/types/segmentData";

type ActivityItemProps = {
  item: ActivityItemData;
};

// Status configuration with icons and colors
const STATUS_CONFIG: Record<
  string,
  { label: string; icon: ReactNode; bgColor: string; textColor: string }
> = {
  [SegmentStatus.PENDING_ASSIGNMENT]: {
    label: "Pending Assignment",
    icon: <Hourglass className="size-3" />,
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
  [SegmentStatus.ASSIGNED]: {
    label: "Assigned",
    icon: <UserCheck className="size-3" />,
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  [SegmentStatus.TO_ORIGIN]: {
    label: "To Origin",
    icon: <Truck className="size-3" />,
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-700",
  },
  [SegmentStatus.AT_ORIGIN]: {
    label: "At Origin",
    icon: <MapPin className="size-3" />,
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  [SegmentStatus.LOADING]: {
    label: "Loading",
    icon: <Package className="size-3" />,
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  [SegmentStatus.IN_CUSTOMS]: {
    label: "In Customs",
    icon: <ShieldCheck className="size-3" />,
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  [SegmentStatus.TO_DESTINATION]: {
    label: "To Destination",
    icon: <Truck className="size-3" />,
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-700",
  },
  [SegmentStatus.AT_DESTINATION]: {
    label: "At Destination",
    icon: <MapPin className="size-3" />,
    bgColor: "bg-teal-100",
    textColor: "text-teal-700",
  },
  [SegmentStatus.DELIVERED]: {
    label: "Delivered",
    icon: <CheckCircle className="size-3" />,
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  [SegmentStatus.CANCELLED]: {
    label: "Cancelled",
    icon: <Ban className="size-3" />,
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
};

// Helper function to get status config or default
function getStatusConfig(status: string) {
  return (
    STATUS_CONFIG[status] || {
      label: status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      icon: <Loader className="size-3" />,
      bgColor: "bg-slate-100",
      textColor: "text-slate-700",
    }
  );
}

// Helper function to format status badge
function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${config.bgColor} ${config.textColor}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

// Parse and format description with status badges
function formatDescription(
  description: string,
  activityType: string
): ReactNode {
  // Handle status change descriptions
  if (activityType === ACTIVITY_TYPE.STATUS_CHANGE) {
    // Pattern: "Status changed from {oldStatus} to {newStatus}"
    const statusChangeMatch = description.match(
      /Status changed from (\w+) to (\w+)/
    );
    if (statusChangeMatch) {
      const [, oldStatus, newStatus] = statusChangeMatch;
      return (
        <span className="text-slate-600 flex items-center gap-2 flex-wrap">
          <span>Status changed from</span>
          <StatusBadge status={oldStatus} />
          <ArrowRight className="size-3 text-slate-400" />
          <StatusBadge status={newStatus} />
        </span>
      );
    }
  }

  // Handle ETA update descriptions
  if (activityType === ACTIVITY_TYPE.ETA_UPDATE) {
    const etaMatch = description.match(/ETA calculated: (.+)/);
    if (etaMatch) {
      const etaDate = new Date(etaMatch[1]);
      const formattedEta = etaDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <span className="text-slate-600">
          ETA calculated:{" "}
          <span className="font-medium text-slate-900">{formattedEta}</span>
        </span>
      );
    }
  }

  // Default: return description as-is
  return <span className="text-slate-600">{description}</span>;
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Less than 1 minute ago
    if (diffMins < 1) {
      return "Just now";
    }
    // Less than 1 hour ago
    else if (diffMins < 60) {
      return `${diffMins}m ago`;
    }
    // Less than 24 hours ago
    else if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    // Less than 7 days ago
    else if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    // Same year - show month, day, and time
    else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // Different year - show full date with time
    else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  } catch {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}

export function ActivityItem({ item }: ActivityItemProps) {
  let icon = <CheckCircle2 className="size-4 text-slate-400" />;
  let content: ReactNode = null;

  const activityType = item.activityType;
  const description = item.description || "";

  switch (activityType) {
    case ACTIVITY_TYPE.STATUS_CHANGE:
      icon = <Repeat2 className="size-4 text-slate-400" />;
      content = formatDescription(description, activityType);
      break;

    case ACTIVITY_TYPE.DOCUMENT_UPLOAD:
      icon = <Paperclip className="size-4 text-slate-400" />;
      content = <span className="text-slate-600">{description}</span>;
      break;

    case ACTIVITY_TYPE.DOCUMENT_APPROVAL:
      icon = <FileCheck className="size-4 text-green-500" />;
      content = <span className="text-slate-600">{description}</span>;
      break;

    case ACTIVITY_TYPE.DOCUMENT_REJECTION:
      icon = <FileX className="size-4 text-red-500" />;
      content = <span className="text-slate-600">{description}</span>;
      break;

    case ACTIVITY_TYPE.PAYMENT_REGISTERED:
    case ACTIVITY_TYPE.PAYMENT_CREATED:
    case ACTIVITY_TYPE.PAYMENT_APPROVED:
    case ACTIVITY_TYPE.PAYMENT_UPDATED:
      icon = <DollarSign className="size-4 text-green-500" />;
      content = <span className="text-slate-600">{description}</span>;
      break;

    case ACTIVITY_TYPE.PAYMENT_REJECTED:
    case ACTIVITY_TYPE.PAYMENT_DELETED:
      icon = <DollarSign className="size-4 text-red-500" />;
      content = <span className="text-slate-600">{description}</span>;
      break;

    case ACTIVITY_TYPE.SEGMENT_ASSIGNED:
      icon = <UserCheck className="size-4 text-blue-500" />;
      content = <span className="text-slate-600">{description}</span>;
      break;

    case ACTIVITY_TYPE.CONTRACT_ACCEPTED:
      icon = <CheckCircle className="size-4 text-green-500" />;
      content = <span className="text-slate-600">{description}</span>;
      break;

    case ACTIVITY_TYPE.CONTRACT_REJECTED:
      icon = <XCircle className="size-4 text-red-500" />;
      content = <span className="text-slate-600">{description}</span>;
      break;

    case ACTIVITY_TYPE.GPS_UPDATE:
      icon = <Navigation className="size-4 text-blue-500" />;
      content = <span className="text-slate-600">{description}</span>;
      break;

    case ACTIVITY_TYPE.ETA_UPDATE:
      icon = <Clock className="size-4 text-slate-400" />;
      content = formatDescription(description, activityType);
      break;

    case ACTIVITY_TYPE.SYSTEM_SETTING_UPDATED:
      icon = <Settings className="size-4 text-slate-400" />;
      content = <span className="text-slate-600">{description}</span>;
      break;

    case ACTIVITY_TYPE.OTHER:
    default:
      icon = <FileText className="size-4 text-slate-400" />;
      content = <span className="text-slate-600">{description}</span>;
      break;
  }

  return (
    <div className="grid grid-cols-[16px_1fr_auto] items-center gap-3">
      <div className="flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <div className="min-w-0 text-[13px] leading-tight">{content}</div>
      </div>
      <div className="text-[12px] text-slate-500 whitespace-nowrap">
        {formatTimestamp(item.createdAt)}
      </div>
    </div>
  );
}

export default ActivityItem;
