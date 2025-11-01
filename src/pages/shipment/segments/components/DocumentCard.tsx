import { FileClock, Check, X, Users, Info } from "lucide-react";

type DocumentCardProps = {
  authorName: string;
  fileName: string;
  sizeLabel: string;
  status: "pending" | "approved" | "rejected";
  avatarUrl?: string;
  className?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onReasons?: () => void;
};

export function DocumentCard({
  authorName,
  fileName,
  sizeLabel,
  status,
  className,
  onApprove,
  onReject,
  onReasons,
}: DocumentCardProps) {
  const statusStyles = {
    pending: {
      circle: "bg-orange-50",
      icon: "text-orange-600",
      Icon: FileClock,
    },
    rejected: {
      circle: "bg-red-50",
      icon: "text-red-600",
      Icon: X,
    },
    approved: {
      circle: "bg-green-50",
      icon: "text-green-600",
      Icon: Check,
    },
  };

  const statusConfig = statusStyles[status];
  const IconComp = statusConfig.Icon;

  return (
    <div
      className={`flex flex-col w-52 border border-slate-200 rounded-xl p-3 shrink-0 ${
        className ?? ""
      }`}
    >
      {/* Top section: Status icon, file info, and uploader */}
      <div className="flex items-start justify-between gap-2">
        {/* Left side: Status icon with file info */}
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Status icon in top-left */}
          <span
            className={`inline-flex items-center justify-center size-7 rounded-full ${statusConfig.circle} shrink-0 mt-0.5`}
          >
            <IconComp className={`size-4 ${statusConfig.icon}`} />
          </span>
          {/* File info below status icon */}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            {/* File name */}
            <div
              className="text-xs font-medium text-slate-900 truncate"
              title={fileName}
            >
              {fileName}
            </div>
            {/* File size */}
            <div className="text-xs text-slate-500">{sizeLabel}</div>
          </div>
        </div>

        {/* Right side: Uploader info aligned to top-right */}
        <div className="flex items-center gap-1 shrink-0">
          <Users className="size-4 text-slate-400" />
          <span className="text-xs text-slate-900">{authorName}</span>
        </div>
      </div>

      {/* Action buttons at bottom */}
      {status === "pending" && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onApprove}
            className="flex-1 rounded-lg bg-green-100 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={onReject}
            className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {status === "rejected" && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onApprove}
            className="flex-1 rounded-lg bg-green-100 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={onReasons}
            className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            Reasons
            <span className="inline-flex items-center justify-center size-4 rounded-full bg-slate-200">
              <Info className="size-2.5 text-slate-600" />
            </span>
          </button>
        </div>
      )}

      {status === "approved" && (
        <div>{/* Approved documents have no action buttons */}</div>
      )}
    </div>
  );
}

export default DocumentCard;
