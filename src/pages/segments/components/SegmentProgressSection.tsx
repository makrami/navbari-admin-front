import SegmentProgress from "../../shipment/segments/components/SegmentProgress";
import type {SegmentData} from "../../../shared/types/segmentData";
import {SEGMENT_STATUS} from "../../../services/shipment/shipment.api.service";

type SegmentProgressSectionProps = {
  segment: SegmentData;
};

export function SegmentProgressSection({segment}: SegmentProgressSectionProps) {
  if (
    segment.isCompleted ||
    !segment.status ||
    ![
      SEGMENT_STATUS.AT_ORIGIN,
      SEGMENT_STATUS.LOADING,
      SEGMENT_STATUS.TO_DESTINATION,
      SEGMENT_STATUS.IN_CUSTOMS,
    ].includes(segment.status as any)
  ) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-b border-slate-200">
      <SegmentProgress
        current={
          segment.status === SEGMENT_STATUS.TO_DESTINATION
            ? "to_dest"
            : segment.status === SEGMENT_STATUS.LOADING
            ? "loading"
            : "in_origin"
        }
      />
    </div>
  );
}
