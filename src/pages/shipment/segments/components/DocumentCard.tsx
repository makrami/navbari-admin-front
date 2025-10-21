import { FileClock, Check, X } from "lucide-react";

type DocumentCardProps = {
  authorName: string;
  fileName: string;
  sizeLabel: string;
  status: "ok" | "error" | "info";
  avatarUrl?: string;
  className?: string;
};

export function DocumentCard({
  authorName,
  fileName,
  sizeLabel,
  status,
  className,
}: DocumentCardProps) {
  const statusStyles =
    status === "ok"
      ? { circle: "bg-green-50", icon: "text-green-600", Icon: Check }
      : status === "error"
      ? { circle: "bg-red-50", icon: "text-red-500", Icon: X }
      : { circle: "bg-yellow-50", icon: "text-yellow-600", Icon: FileClock };

  const IconComp = statusStyles.Icon;

  return (
    <div
      className={`rounded-xl border flex items-center flex-col gap-2 border-slate-200 p-3 bg-white ${
        className ?? ""
      }`}
    >
      <div className="3 flex items-center justify-center">
        <span
          className={`inline-flex items-center justify-center size-12 rounded-full ${statusStyles.circle}`}
        >
          <IconComp className={`size-5 ${statusStyles.icon}`} />
        </span>
      </div>
      <div className="flex  items-center  justify-start gap-2">
        <div className="text-xs font-bold text-slate-900">{authorName}</div>
      </div>
      <div className=" text-center">
        <div
          className="text-xs font-medium text-slate-900 truncate"
          title={fileName}
        >
          {fileName}
        </div>
        <div className="text-xs mt-1 text-slate-500">{sizeLabel}</div>
      </div>
    </div>
  );
}

export default DocumentCard;
