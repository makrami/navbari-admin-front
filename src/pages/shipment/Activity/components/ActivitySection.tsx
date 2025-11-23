import ActivityItem from "../ActivityItem";
import type { ActivityItemData } from "../types";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { getShipmentActivityLog } from "../../../../services/shipment/shipment.api.service";

type ActivitySectionProps = {
  shipmentId: string;
  className?: string;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
};

export function ActivitySection({
  shipmentId,
  className,
  defaultOpen = true,
  onToggle,
}: ActivitySectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [items, setItems] = useState<ActivityItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shipmentId) {
      setLoading(false);
      return;
    }

    const fetchActivityLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const logs = await getShipmentActivityLog(shipmentId);
        setItems(logs);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch activity logs"
        );
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, [shipmentId]);
  return (
    <section className={`rounded-xl bg-white ${className ?? ""}`}>
      <header className="flex items-center gap-2  px-5 py-2">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="activity-content"
          onClick={() =>
            setOpen((prev) => {
              const next = !prev;
              onToggle?.(next);
              return next;
            })
          }
          className="inline-flex items-center justify-center size-7 rounded  border border-slate-200 hover:bg-slate-50 text-slate-500"
        >
          <ChevronDown
            className={`size-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        <h2 className="font-bold text-slate-900">All Activities</h2>
      </header>
      <div
        id="activity-content"
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3">
            {loading ? (
              <div className="text-sm text-slate-500 py-4 text-center">
                Loading activity logs...
              </div>
            ) : error ? (
              <div className="text-sm text-red-500 py-4 text-center">
                {error}
              </div>
            ) : items.length === 0 ? (
              <div className="text-sm text-slate-500 py-4 text-center">
                No activity logs available
              </div>
            ) : (
              <div className="grid gap-3">
                {items.map((it) => (
                  <ActivityItem key={it.id} item={it} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ActivitySection;
