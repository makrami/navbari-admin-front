import { SegmentsPage } from "../../segments/SegmentsPage";
import { cn } from "../../../shared/utils/cn";
import type { SegmentWithShipment } from "../../segments/components/SegmentCard";

type SegmentsDrawerProps = {
  open: boolean;
  onClose: () => void;
  selectedSegmentId: string | null;
  extraSegments?: SegmentWithShipment[];
};

export function SegmentsDrawer({
  open,
  onClose,
  selectedSegmentId,
  extraSegments,
}: SegmentsDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          open
            ? "bg-slate-900/30 pointer-events-auto opacity-100"
            : "bg-transparent pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-4xl bg-slate-200  shadow-2xl transition-transform duration-500 ease-out overflow-hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{ willChange: open ? "transform" : "auto" }}
      >
        {open && (
          <SegmentsPage
            selectedSegmentId={selectedSegmentId ?? undefined}
            onClose={onClose}
            extraSegments={extraSegments}
            className="h-full"
          />
        )}
      </div>
    </>
  );
}

