import {
  FileClock,
  Check,
  X,
  Users,
  Info,
  Eye as EyeIcon,
  FileText as FileTextIcon,
  Clock,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useState, useRef, useEffect } from "react";

type DocumentCardProps = {
  authorName: string;
  fileName: string;
  sizeLabel: string;
  status: "pending" | "approved" | "rejected" | "expired";
  avatarUrl?: string;
  className?: string;
  filePath?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onReasons?: () => void;
  onPreview?: () => void;
  onView?: () => void;
  disabled?: boolean;
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
  onPreview,
  onView,
  disabled = false,
}: DocumentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

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
    expired: {
      circle: "bg-gray-50",
      icon: "text-gray-600",
      Icon: Clock,
    },
  };

  const statusConfig = statusStyles[status];
  const IconComp = statusConfig.Icon;

  const shouldShowTooltip =
    (status === "pending" || status === "expired") && onPreview;

  // Calculate tooltip position
  useEffect(() => {
    if (!showTooltip || !cardRef.current) return;

    const updatePosition = () => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 8, // 8px above the card (mb-2 = 8px)
        left: rect.left + rect.width / 2, // Center of the card
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showTooltip]);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't trigger preview if clicking on action buttons
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.tagName === "BUTTON" ||
      (status !== "pending" && status !== "expired")
    ) {
      return;
    }
    onPreview?.();
  };

  return (
    <div
      ref={cardRef}
      className={`relative group flex flex-col w-52 border justify-between border-slate-200 rounded-xl p-3 shrink-0 ${
        shouldShowTooltip
          ? "cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
          : ""
      } ${className ?? ""}`}
      onClick={handleCardClick}
      onMouseEnter={() => shouldShowTooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip Portal */}
      {shouldShowTooltip &&
        showTooltip &&
        tooltipPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="bg-slate-900 text-white text-xs rounded-md px-3 py-1.5 shadow-lg whitespace-nowrap mb-2 relative">
              Click to preview
              {/* Arrow pointing down */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-slate-900" />
            </div>
          </div>,
          document.body
        )}

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
            <div className="text-xs  text-slate-900 truncate" title={fileName}>
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
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onApprove}
            disabled={disabled}
            className="flex-1 rounded-lg bg-green-100 px-3 py-1 text-xs text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={disabled}
            className="flex-1 rounded-lg bg-red-100 px-3 py-1 text-xs text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </div>
      )}

      {status === "expired" && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={true}
            className="flex-1 rounded-lg bg-red-100 px-3 py-1 text-xs text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Expired
          </button>
        </div>
      )}

      {status === "rejected" && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onApprove}
            disabled={disabled}
            className="flex-1 rounded-lg bg-green-100 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
          >
            Preview
            <EyeIcon className="size-3" />
          </button>
          <button
            type="button"
            onClick={onView}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Open
            <FileTextIcon className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}

export default DocumentCard;
