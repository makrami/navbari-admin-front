import { Plus } from "lucide-react";
import type { MouseEventHandler, PropsWithChildren } from "react";
import { cn } from "../../shared/utils/cn";
import { useTranslation } from "react-i18next";

type AddShipmentProps = PropsWithChildren<{
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}>;

export function AddShipment({ className, onClick }: AddShipmentProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[rgba(27,84,254,0.1)] p-4",
        "text-[#1b54fe] transition-transform duration-150 ease-in-out",
        "hover:scale-101 active:scale-99",
        className
      )}
      aria-label={t("shipment.actions.addShipment")}
      data-name="Add Shipment"
    >
      <span className="text-sm font-bold">
        {t("shipment.actions.addShipment")}
      </span>
      <Plus className="h-5 w-5 text-[#1b54fe]" />
    </button>
  );
}
