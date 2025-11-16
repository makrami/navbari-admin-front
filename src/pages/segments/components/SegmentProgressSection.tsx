import SegmentProgress from "../../shipment/segments/components/SegmentProgress";
import type { SegmentData } from "../../../shared/types/segmentData";

type SegmentProgressSectionProps = {
  segment: SegmentData;
};

export function SegmentProgressSection({
  segment,
}: SegmentProgressSectionProps) {
  if (
    segment.isCompleted ||
    !segment.logisticsStatus ||
    !["AT_ORIGIN", "LOADING", "IN_TRANSIT"].includes(segment.logisticsStatus)
  ) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-b border-slate-200">
      <SegmentProgress
        current={
          segment.logisticsStatus === "IN_TRANSIT"
            ? "to_dest"
            : segment.logisticsStatus === "LOADING"
            ? "loading"
            : "in_origin"
        }
      />
    </div>
  );
}
