import { type ReactNode } from "react";

type InfoCardProps = {
  icon: ReactNode;
  title: string;
  value?: ReactNode;
  className?: string;
  valueClassName?: string;
  valueIcon?: ReactNode;
};

export function InfoCard({
  icon,
  title,
  value,
  className,
  valueClassName,
  valueIcon,
}: InfoCardProps) {
  return (
    <div
      className={`rounded-[10px] border border-slate-200 p-3 ${
        className ?? ""
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-slate-500">
        {icon}
        <span>{title}</span>
      </div>
      {value ? (
        <div
          className={`mt-1 text-xs text-slate-900 flex items-center gap-1 ${
            valueClassName ?? ""
          }`}
        >
          {value}
          {valueIcon && (
            <span className="p-[2px] size-4 bg-[#1B54FE] rounded-full flex items-center justify-center">
              {valueIcon}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default InfoCard;
