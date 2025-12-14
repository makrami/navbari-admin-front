import type {PropsWithChildren, ReactNode} from "react";
import {cn} from "../../../shared/utils/cn";
import {PlusIcon} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useCurrentUser} from "../../../services/user/hooks";

type SegmentsProps = PropsWithChildren<{
  className?: string;
  title?: ReactNode;
  onAddSegment?: () => void;
  readOnly?: boolean;
}>;

export function Segments({
  className,
  title = "Segments",
  children,
  onAddSegment,
  readOnly = false,
}: SegmentsProps) {
  const {t} = useTranslation();
  const {data: user} = useCurrentUser();

  // Get permissions array from user data
  const userRecord = user as Record<string, unknown> | undefined;
  const permissions = (userRecord?.permissions as string[] | undefined) || [];
  const hasSegmentsCreate = permissions.includes("segments:create");

  return (
    <section className={cn(className)} data-name="Segments Section" dir="ltr">
      <header className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900">{title}</h2>
        {readOnly
          ? null
          : onAddSegment &&
            hasSegmentsCreate && (
              <button
                type="button"
                onClick={onAddSegment}
                aria-label={t("shipment.segments.addSegment")}
                className="inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-xs font-medium text-blue-600 bg-blue-100 hover:scale-[1.02] active:scale-[0.99] transition-transform"
              >
                <PlusIcon className="size-4" />
                <span>{t("shipment.segments.addSegment")}</span>
              </button>
            )}
      </header>
      <div className="mt-4 relative rounded-xl bg-white p-3">
        {/* Vertical spine linking the segment cards visually */}
        <div
          aria-hidden="true"
          className="absolute left-8 top-5 bottom-5 w-3 bg-slate-200 rounded-full z-0"
        />
        <div className="grid gap-4 bg relative z-10">{children}</div>
      </div>
    </section>
  );
}
