import { type ReactNode } from "react";

type InfoCardProps = {
  icon: ReactNode;
  title: string;
  value?: ReactNode;
  className?: string;
};

export function InfoCard({ icon, title, value, className }: InfoCardProps) {
  return (
    <div
      className={`rounded-[10px] border border-slate-200 p-3 ${
        className ?? ""
      }`}
    >
      <div className="flex items-center gap-2 text-[12px] text-slate-500">
        {icon}
        <span>{title}</span>
      </div>
      {value ? (
        <div className="mt-1 text-[13px] text-slate-900">{value}</div>
      ) : null}
    </div>
  );
}

export default InfoCard;
