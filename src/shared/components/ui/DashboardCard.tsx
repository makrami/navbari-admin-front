import { type ReactNode } from "react";

type DashboardCardProps = {
  icon: ReactNode;
  iconBgColor: string;
  title: string;
  subInfo1: string;
  subInfo2: string;
  extraInfo?: string;
  className?: string;
};

export function DashboardCard({
  icon,
  iconBgColor,
  title,
  subInfo1,
  subInfo2,
  extraInfo,
  className,
}: DashboardCardProps) {
  return (
    <div
      className={`flex flex-col bg-white rounded-2xl border border-slate-300  p-6  items-start gap-4 ${
        className ?? ""
      }`}
    >
      {/* Icon with colored background */}
      <div className="flex items-center gap-2">
        <div
          className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0`}
          style={{ backgroundColor: iconBgColor }}
        >
          <div className="text-slate-700 ">{icon}</div>
        </div>
        <h3 className="font-semibold text-slate-900 text-sm mb-1">{title}</h3>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        {/* Title */}

        {/* Sub Info 1 */}
        <p className="text-sm text-slate-400 mb-1">
          {subInfo1.split(/(\d+)/).map((part, index) => {
            // Make numbers bold while keeping text normal weight
            if (/^\d+$/.test(part)) {
              return (
                <span key={index} className="font-bold text-slate-400">
                  {part}
                </span>
              );
            }
            return part;
          })}
        </p>

        {/* Sub Info 2 */}
        <p className="text-sm text-slate-900">
          {subInfo2.split(/(\d+[hm]?\s*)/).map((part, index) => {
            // Make time values extra bold
            if (/\d+[hm]?\s*/.test(part)) {
              return (
                <span key={index} className="font-semibold">
                  {part}
                </span>
              );
            }
            return part;
          })}
        </p>

        {/* Extra Info (if provided) */}
        {extraInfo && (
          <p className="text-xs text-slate-500 mt-1">{extraInfo}</p>
        )}
      </div>
    </div>
  );
}

export default DashboardCard;
