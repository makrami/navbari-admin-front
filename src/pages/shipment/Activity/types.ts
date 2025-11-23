import type {
  ActivityLogReadDto,
  ACTIVITY_TYPE,
} from "../../../services/shipment/shipment.api.service";

export type ActivityType = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];

export type ActivityItemData = ActivityLogReadDto;
