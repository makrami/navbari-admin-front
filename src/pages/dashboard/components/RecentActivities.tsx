import { AlertTriangle, DollarSign, MapPinOff, CheckCheck } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

type ActivityType = "delay" | "payment" | "gps-lost" | "delivered";

type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  subtitle?: string;
  timestamp: string;
  icon: React.ReactNode;
};

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "delay",
    title: "Delay (SHP-2671)",
    timestamp: "10m ago",
    icon: <AlertTriangle className="size-5 text-amber-600" />,
  },
  {
    id: "2",
    type: "gps-lost",
    title: "GPS Lost (Xin Zhao)",
    timestamp: "20m ago",
    icon: <MapPinOff className="size-5 text-red-600" />,
  },
  {
    id: "3",
    type: "delivered",
    title: "Delivered (SHP-2671)",
    timestamp: "57m ago",
    icon: <CheckCheck className="size-5 text-green-600" />,
  },
  {
    id: "4",
    type: "payment",
    title: "Payment Due (Xin Zhao)",
    timestamp: "1h ago",
    icon: <DollarSign className="size-5 text-blue-300" />,
  },
  {
    id: "5",
    type: "gps-lost",
    title: "GPS Lost (Xin Zhao)",
    timestamp: "20m ago",
    icon: <MapPinOff className="size-5 text-red-600" />,
  },
];

type RecentActivitiesProps = {
  activities?: Activity[];
  className?: string;
};

export function RecentActivities({
  activities = DEFAULT_ACTIVITIES,
  className,
}: RecentActivitiesProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm mb-4 font-semibold text-slate-900">
          Recent Activities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => {
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 group bg-slate-50 hover:bg-slate-50/50 rounded-lg p-3 transition-colors cursor-pointer"
              >
                <div
                  className={cn(
                    "flex-shrink-0 bg-white size-10 rounded-lg flex items-center justify-center"
                  )}
                >
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium leading-tight mb-1")}>
                    {activity.title}
                  </p>
                  <p className="text-xs text-slate-400">{activity.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default RecentActivities;
