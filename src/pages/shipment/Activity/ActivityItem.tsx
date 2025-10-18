import {
  CheckCircle2,
  MapPin,
  Paperclip,
  Power,
  PowerOff,
  Repeat2,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ActivityItemData } from "./types";

type ActivityItemProps = {
  item: ActivityItemData;
};

export function ActivityItem({ item }: ActivityItemProps) {
  let icon = <CheckCircle2 className="size-4 text-slate-400" />;
  let content: ReactNode = null;

  if (item.type === "gps_on") {
    icon = <Power className="size-4 text-slate-400" />;
    content = (
      <span>
        <span className="text-blue-700 font-medium">{item.actorName}</span>
        <span className="text-slate-600"> Turned their GPS on.</span>
      </span>
    );
  } else if (item.type === "gps_off") {
    icon = <PowerOff className="size-4 text-slate-400" />;
    content = (
      <span>
        <span className="text-blue-700 font-medium">{item.actorName}</span>
        <span className="text-slate-600"> Turned their GPS off.</span>
      </span>
    );
  } else if (item.type === "driver_changed") {
    icon = <Repeat2 className="size-4 text-slate-400" />;
    content = (
      <span className="text-slate-600">
        Driver changed from{" "}
        <span className="text-blue-700 font-medium">{item.fromName}</span> to{" "}
        <span className="text-blue-700 font-medium">{item.toName}</span>
      </span>
    );
  } else if (item.type === "uploaded") {
    icon = <Paperclip className="size-4 text-slate-400" />;
    content = (
      <span>
        <span className="text-blue-700 font-medium">{item.actorName}</span>
        <span className="text-slate-600"> Uploaded </span>
        <a
          className="text-blue-700 hover:underline"
          href="#"
          title={item.fileName}
        >
          {item.fileName}
        </a>
      </span>
    );
  } else if (item.type === "arrived") {
    icon = <MapPin className="size-4 text-slate-400" />;
    content = (
      <span className="text-slate-600">
        Driver arrived at Segment #{item.segmentIndex}{" "}
        <span className="text-blue-700 font-medium">{item.locationName}</span>
      </span>
    );
  }

  return (
    <div className="grid grid-cols-[16px_1fr_auto] items-center gap-3">
      <div className="flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="flex items-center gap-2 min-w-0">
        {/* Optional avatar */}
        {item.actorAvatarUrl ? (
          <span className="relative inline-flex items-center justify-center rounded-full bg-slate-200 size-5 overflow-hidden">
            <img
              alt=""
              src={item.actorAvatarUrl}
              className="block size-full object-cover"
            />
          </span>
        ) : null}
        <div className="min-w-0 text-[13px] leading-tight">{content}</div>
      </div>
      <div className="text-[12px] text-slate-500 whitespace-nowrap">
        {item.timestamp}
      </div>
    </div>
  );
}

export default ActivityItem;
