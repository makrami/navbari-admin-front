import type { HTMLAttributes } from "react";
import { cn } from "../../../shared/utils/cn";
import {
  FileText as FileTextIcon,
  Check as CheckIcon,
  X as XIcon,
  Eye as EyeIcon,
  FileClock,
} from "lucide-react";
// Using public folder for images to ensure proper loading
const driverPhoto = "/driverphoto.png";
const vehiclePhoto = "/vehiclephoto.png";

export type DocumentStatus = "pending" | "approved" | "rejected";

type DocumentCardProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  status: DocumentStatus;
  imageUrl?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onView?: () => void;
  onReasons?: () => void;
};

export function DocumentCard({
  title,
  status,
  imageUrl,
  onApprove,
  onReject,
  onView,
  onReasons,
  className,
  ...rest
}: DocumentCardProps) {
  const statusBadge = {
    approved: { icon: CheckIcon, wrap: "bg-green-100 text-green-600" },
    rejected: { icon: XIcon, wrap: "bg-red-100 text-red-600" },
    pending: { icon: FileClock, wrap: "bg-amber-100 text-amber-600" },
  }[status];

  return (
    <div
      className={cn("rounded-2xl bg-white p-4 space-y-3", className)}
      {...rest}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900 truncate">{title}</h3>
        <span
          className={cn(
            "inline-grid place-items-center rounded-full size-6",
            statusBadge.wrap
          )}
          aria-label={status}
        >
          {statusBadge.icon && <statusBadge.icon className="size-4" />}
        </span>
      </div>
      <div className="grid place-items-center rounded-lg bg-slate-100 h-24 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <FileTextIcon className="size-10 text-slate-400" />
        )}
      </div>
      {status === "pending" && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
          >
            Active
            <CheckIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={onReject}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600"
          >
            Reject
            <XIcon className="size-4" />
          </button>
        </div>
      )}
      {status === "approved" && (
        <button
          type="button"
          onClick={onView}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-slate-100 py-2 text-xs font-medium text-slate-900"
        >
          View
          <EyeIcon className="size-4" />
        </button>
      )}
      {status === "rejected" && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-green-100 py-2 text-xs font-medium text-green-700"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={onReasons}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-100 py-2 text-xs font-medium text-slate-700"
          >
            Reasons
          </button>
        </div>
      )}
    </div>
  );
}

type DocumentsListProps = {
  title?: string;
  items?: Array<{
    id: string;
    title: string;
    status: DocumentStatus;
    imageUrl?: string;
  }>;
  className?: string;
};

export default function DocumentsList({
  title = "Documents",
  items,
  className,
}: DocumentsListProps) {
  const list = items ?? [
    {
      id: "d1",
      title: "Driver Photo",
      status: "pending" as const,
      imageUrl: driverPhoto,
    },
    {
      id: "d2",
      title: "Vehicle Photo",
      status: "approved" as const,
      imageUrl: vehiclePhoto,
    },
    { id: "d3", title: "Driver License", status: "rejected" as const },
    { id: "d4", title: "Vehicle Reg.", status: "approved" as const },
    { id: "d5", title: "Insurance", status: "approved" as const },
  ];

  return (
    <section className={cn("space-y-4", className)}>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((doc) => (
          <DocumentCard
            key={doc.id}
            title={doc.title}
            status={doc.status}
            imageUrl={doc.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}
