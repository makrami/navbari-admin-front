import SegmentProgress from "../../shipment/segments/components/SegmentProgress";
import type { Segment } from "../../../shared/types/segmentData";
import { SEGMENT_STATUS } from "../../../services/shipment/shipment.api.service";

type SegmentProgressSectionProps = {
  segment: Segment;
};

export function SegmentProgressSection({
  segment,
}: SegmentProgressSectionProps) {
  if (
    segment.isCompleted ||
    !segment.status ||
    !(
      [
        SEGMENT_STATUS.AT_ORIGIN,
        SEGMENT_STATUS.LOADING,
        SEGMENT_STATUS.TO_DESTINATION,
        SEGMENT_STATUS.IN_CUSTOMS,
      ] as SEGMENT_STATUS[]
    ).includes(segment.status)
  ) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-b border-slate-200">
      <SegmentProgress
        current={
          segment.status === SEGMENT_STATUS.TO_DESTINATION
            ? "to_destination"
            : segment.status === SEGMENT_STATUS.LOADING
            ? "loading"
            : segment.status === SEGMENT_STATUS.AT_ORIGIN
            ? "at_origin"
            : "assigned"
        }
      />
    </div>
  );
}
