import { useMemo, useState, type ReactNode } from "react";
import SegmentProgress, { type SegmentProgressStage } from "./SegmentProgress";
import { cn } from "../../../../shared/utils/cn";
import { CITY_OPTIONS } from "../../data/cities";
import CargoDeclarationModal, {
  type CargoCompany,
} from "../../components/CargoDeclarationModal";
import FieldBoxSelect from "./fields/FieldBoxSelect";
import DateTimePickerField from "./fields/DateTimePickerField";
import BaseFeeField from "./fields/BaseFeeField";
import SegmentActions from "./SegmentActions";
import SegmentHeader from "./SegmentHeader";
import SegmentInfoSummary from "./SegmentInfoSummary";
import type {
  SegmentAssignmentStatus,
  SegmentLogisticsStatus,
} from "../../../../shared/types/shipment";
import CargoAssignmentsList from "./CargoAssignmentsList";
export type SegmentData = {
  step: number;
  place: string;
  datetime?: string;
  isCompleted?: boolean;
  progressStage?: SegmentProgressStage;
  isCurrent?: boolean;
  /** When true, render a minimal placeholder row like in the reference */
  isPlaceholder?: boolean;
  assigneeName?: string;
  assigneeAvatarUrl?: string;
  vehicleLabel?: string;
  startAt?: string;
  estFinishAt?: string;
  localCompany?: string;
  baseFeeUsd?: number;
  /** Title helper: start of the next segment (if any). If undefined, treated as destination. */
  nextPlace?: string;
  documents?: Array<{
    id: string | number;
    name: string;
    sizeLabel: string;
    status: "pending" | "approved" | "rejected";
    author?: string;
    thumbnailUrl?: string;
  }>;
  /** Selected cargo companies for this segment */
  cargoCompanies?: CargoCompany[];
  /** Assignment phase status (not mixed with logistics) */
  assignmentStatus?: SegmentAssignmentStatus;
  /** Logistics operation status */
  logisticsStatus?: SegmentLogisticsStatus;
};

type DocumentItem = NonNullable<SegmentData["documents"]>[number];

type SegmentDetailsProps = {
  className?: string;
  data: SegmentData;
  defaultOpen?: boolean;
  children?: ReactNode;
  onSave?: (update: Partial<SegmentData>) => void;
  editable?: boolean;
  locked?: boolean;
  showStatuses?: boolean;
};

export function SegmentDetails({
  className,
  data,
  defaultOpen = false,
  children,
  onSave,
  editable = false,
  locked = false,
  showStatuses = true,
}: SegmentDetailsProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [toValue, setToValue] = useState<string>(data.nextPlace ?? "");
  const [fromValue, setFromValue] = useState<string>(data.place ?? "");
  const [startAt, setStartAt] = useState<string>(data.startAt ?? "");
  const [estFinishAt, setEstFinishAt] = useState<string>(
    data.estFinishAt ?? ""
  );
  const [baseFee, setBaseFee] = useState<string>(
    typeof data.baseFeeUsd === "number" ? String(data.baseFeeUsd) : ""
  );
  const [showErrors, setShowErrors] = useState(false);
  const [showCargoModal, setShowCargoModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] =
    useState<Partial<SegmentData> | null>(null);
  // helper state derived inline by Field components when needed
  const { step, place } = data;
  const headerId = `segment-header-${step}`;

  useMemo<DocumentItem[]>(() => {
    return data.documents ?? [];
  }, [data.documents]);

  return (
    <div
      className={cn(
        "relative border-2 rounded-xl shadow-[0_0_0_1px_rgba(99,102,241,0.04)]",
        locked ? "bg-slate-50 border-transparent" : "bg-white",
        !locked && editable
          ? "border-dotted border-blue-500"
          : !locked
          ? "border-slate-200"
          : null,
        className
      )}
      data-name="Segment Item"
    >
      <SegmentHeader
        step={step}
        place={place}
        nextPlace={data.isPlaceholder ? undefined : data.nextPlace}
        isCompleted={data.isCompleted}
        open={open}
        locked={locked}
        editable={editable}
        headerId={headerId}
        onToggle={() => setOpen((v) => !v)}
        showCargoButton={
          !open && editable && Boolean(data.nextPlace) && !data.isCompleted
        }
        onCargoClick={(e) => {
          e.stopPropagation();
          setPendingUpdate({});
          setShowCargoModal(true);
        }}
      />

      {/* Inline progress just below header when this is the current segment */}
      {data.isCurrent && data.progressStage && !locked ? (
        <div className="px-3 pb-3">
          <SegmentProgress current={data.progressStage} />
        </div>
      ) : null}

      {/* Assignment and Logistics statuses */}
      {showStatuses && (data.assignmentStatus || data.logisticsStatus) && (
        <div className="px-3 pb-2 flex items-center gap-2">
          {data.assignmentStatus ? (
            <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-medium">
              Assignment: {data.assignmentStatus}
            </span>
          ) : null}
          {data.logisticsStatus ? (
            <span className="inline-flex items-center rounded-md bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px] font-medium">
              Logistics: {data.logisticsStatus}
            </span>
          ) : null}
        </div>
      )}

      {/* Expandable content container */}
      <div
        id={`segment-content-${step}`}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
        aria-hidden={!open}
        role="region"
        aria-labelledby={headerId}
      >
        <div className={cn("overflow-hidden", open)}>
          <div className="px-3 py-3 gap-6">
            {/* Segment progress appears here only for non-current segments */}
            {children ? (
              <div>{children}</div>
            ) : !data.isCurrent && data.progressStage && !locked ? (
              <SegmentProgress current={data.progressStage} />
            ) : null}
            {editable && !locked ? (
              <div className=" rounded-xl  grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldBoxSelect
                  label="FROM"
                  value={fromValue}
                  onChange={setFromValue}
                  options={CITY_OPTIONS}
                />
                <FieldBoxSelect
                  label="TO"
                  value={toValue}
                  onChange={setToValue}
                  options={CITY_OPTIONS}
                />
                <DateTimePickerField
                  label="START"
                  value={startAt}
                  onChange={setStartAt}
                  error={showErrors && !startAt.trim()}
                />
                <DateTimePickerField
                  label="EST. FINISH"
                  value={estFinishAt}
                  onChange={setEstFinishAt}
                  error={showErrors && !estFinishAt.trim()}
                />
                <BaseFeeField
                  value={baseFee}
                  onChange={setBaseFee}
                  error={showErrors && !baseFee.trim()}
                />
                <SegmentActions
                  readOnly={locked || !editable}
                  onReset={() => {
                    setToValue("");
                    setStartAt("");
                    setEstFinishAt("");
                    setBaseFee("");
                    setShowErrors(false);
                  }}
                  onSave={() => {
                    const valid =
                      toValue.trim() &&
                      startAt.trim() &&
                      estFinishAt.trim() &&
                      baseFee.trim();
                    if (!valid) {
                      setShowErrors(true);
                      return;
                    }
                    onSave?.({
                      place: fromValue.trim(),
                      nextPlace: toValue.trim(),
                      startAt: startAt.trim(),
                      estFinishAt: estFinishAt.trim(),
                      baseFeeUsd: parseFloat(baseFee),
                      isPlaceholder: false,
                    });
                    setOpen(false);
                  }}
                  onSaveDeclare={() => {
                    const valid =
                      toValue.trim() &&
                      startAt.trim() &&
                      estFinishAt.trim() &&
                      baseFee.trim();
                    if (!valid) {
                      setShowErrors(true);
                      return;
                    }
                    setPendingUpdate({
                      place: fromValue.trim(),
                      nextPlace: toValue.trim(),
                      startAt: startAt.trim(),
                      estFinishAt: estFinishAt.trim(),
                      baseFeeUsd: parseFloat(baseFee),
                      isPlaceholder: false,
                    });
                    setShowCargoModal(true);
                  }}
                />
              </div>
            ) : data.cargoCompanies && data.cargoCompanies.length ? (
              <CargoAssignmentsList companies={data.cargoCompanies} />
            ) : (
              <SegmentInfoSummary
                vehicleLabel={data.vehicleLabel}
                startAt={data.startAt}
                localCompany={data.localCompany}
                estFinishAt={data.estFinishAt}
                documents={data.documents}
              />
            )}
          </div>
        </div>
      </div>

      {/* Vertical spine notch overlay to visually connect to the left rail */}
      <div
        aria-hidden="true"
        className="absolute left-[26px] top-0 bottom-0 w-[12px] bg-slate-200 rounded-full -z-10"
      />

      {/* Current segment red dot indicator */}
      {data.isCurrent ? (
        <span
          aria-hidden="true"
          className="absolute -left-[4px] -top-1 -bg-conic-150  size-[10px] rounded-full bg-red-500 border-2 border-white"
        />
      ) : null}

      {/* Cargo Declaration Modal */}
      <CargoDeclarationModal
        open={showCargoModal}
        onClose={() => setShowCargoModal(false)}
        onSelect={(companies) => {
          const update: Partial<SegmentData> = {
            ...(pendingUpdate ?? {}),
            localCompany: companies.map((c) => c.name).join(", "),
            cargoCompanies: companies,
          };
          onSave?.(update);
          setShowCargoModal(false);
          setOpen(false);
          setPendingUpdate(null);
        }}
      />
    </div>
  );
}

export default SegmentDetails;
