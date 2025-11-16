import { useMemo, useState, useEffect, type ReactNode } from "react";
import SegmentProgress, { type SegmentProgressStage } from "./SegmentProgress";
import { cn } from "../../../../shared/utils/cn";
import { CITY_OPTIONS } from "../../data/cities";
import CargoDeclarationModal, {
  type CargoCompany,
} from "../../components/CargoDeclarationModal";
import FieldBoxSelect from "./fields/FieldBoxSelect";
import DatePicker from "./fields/DatePicker";
import TimePicker from "./fields/TimePicker";
import BaseFeeField from "./fields/BaseFeeField";
import { combineDateTime, splitDateTime } from "./utils/segmentDateTime";
import SegmentActions from "./SegmentActions";
import SegmentHeader from "./SegmentHeader";
import SegmentInfoSummary from "./SegmentInfoSummary";
import type {
  SegmentAssignmentStatus,
  SegmentLogisticsStatus,
} from "../../../../shared/types/shipment";
import CargoAssignmentsList from "./CargoAssignmentsList";
import { ShipmentLinkSection } from "./ShipmentLinkSection";
import {
  updateSegment,
  type SegmentReadDto,
} from "../../../../services/shipment/shipment.api.service";
import { useCompanies } from "../../../../services/company/hooks";
import type { CompanyReadDto } from "../../../../services/company/company.service";
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
  distance?: string;
  localCompany?: string;
  baseFeeUsd?: number;
  /** Title helper: start of the next segment (if any). If undefined, treated as destination. */
  nextPlace?: string;
  /** When true, indicates this segment has a disruption/error */
  hasDisruption?: boolean;
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

// Helper function to map country name to ISO country code
function getCountryCode(countryName: string): string {
  const countryMap: Record<string, string> = {
    China: "CN",
    "United States": "US",
    Germany: "DE",
    "United Kingdom": "GB",
    France: "FR",
    Italy: "IT",
    Spain: "ES",
    Netherlands: "NL",
    Belgium: "BE",
    Poland: "PL",
    Russia: "RU",
    Turkey: "TR",
    Iran: "IR",
    Iraq: "IQ",
    Afghanistan: "AF",
    Pakistan: "PK",
    India: "IN",
    Kazakhstan: "KZ",
    Uzbekistan: "UZ",
    Mongolia: "MN",
  };
  return countryMap[countryName] || "US"; // Default to US if not found
}

// Helper function to transform CompanyReadDto to CargoCompany
function transformCompanyToCargoCompany(company: CompanyReadDto): CargoCompany {
  return {
    id: company.id,
    name: company.name,
    country: company.country,
    countryCode: getCountryCode(company.country),
    admin: company.primaryContactFullName,
    registeredAt: new Date(company.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    logoUrl: company.logoUrl || "",
    availableDrivers: company.totalDrivers || 0,
  };
}

type SegmentDetailsProps = {
  className?: string;
  data: SegmentData;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
  onSave?: (update: Partial<SegmentData>) => void;
  editable?: boolean;
  locked?: boolean;
  /** Segment ID for API calls - when provided, will call PUT /segments/:id on save */
  segmentId?: string;
  /** Shipment link props - when provided, shows a clickable shipment link section */
  shipmentLinkProps?: {
    shipmentTitle: string;
    shipmentId: string;
    fromPlace: string;
    toPlace?: string;
    fromCountryCode?: string;
    toCountryCode?: string;
  };
};

export function SegmentDetails({
  className,
  data,
  defaultOpen = false,
  open: controlledOpen,
  onToggle: controlledOnToggle,
  children,
  onSave,
  editable = false,
  locked = false,
  segmentId,
  shipmentLinkProps,
}: SegmentDetailsProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  // Use controlled state if provided, otherwise use internal state
  const isControlled =
    controlledOpen !== undefined && controlledOnToggle !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const handleToggle = isControlled
    ? controlledOnToggle
    : () => setInternalOpen((v) => !v);
  const [toValue, setToValue] = useState<string>(data.nextPlace ?? "");
  const [fromValue, setFromValue] = useState<string>(data.place ?? "");

  // Split date-time values into separate date and time states
  const [startDateValue, setStartDateValue] = useState<string>(() => {
    const { d } = splitDateTime(data.startAt ?? "");
    return d;
  });
  const [startTimeValue, setStartTimeValue] = useState<string>(() => {
    const { t } = splitDateTime(data.startAt ?? "");
    return t;
  });
  const [estFinishDateValue, setEstFinishDateValue] = useState<string>(() => {
    const { d } = splitDateTime(data.estFinishAt ?? "");
    return d;
  });
  const [estFinishTimeValue, setEstFinishTimeValue] = useState<string>(() => {
    const { t } = splitDateTime(data.estFinishAt ?? "");
    return t;
  });
  const [baseFee, setBaseFee] = useState<string>(
    typeof data.baseFeeUsd === "number" ? String(data.baseFeeUsd) : ""
  );

  // Sync form fields when data changes externally (e.g., after save)
  useEffect(() => {
    setFromValue(data.place ?? "");
    setToValue(data.nextPlace ?? "");
    const { d: startDate, t: startTime } = splitDateTime(data.startAt ?? "");
    setStartDateValue(startDate);
    setStartTimeValue(startTime);
    const { d: finishDate, t: finishTime } = splitDateTime(
      data.estFinishAt ?? ""
    );
    setEstFinishDateValue(finishDate);
    setEstFinishTimeValue(finishTime);
    setBaseFee(
      typeof data.baseFeeUsd === "number" ? String(data.baseFeeUsd) : ""
    );
  }, [
    data.place,
    data.nextPlace,
    data.startAt,
    data.estFinishAt,
    data.baseFeeUsd,
  ]);
  const [showErrors, setShowErrors] = useState(false);
  const [showCargoModal, setShowCargoModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] =
    useState<Partial<SegmentData> | null>(null);

  // Utility function to parse city and country from place string (format: "City, Country")
  const parsePlace = (place: string): { city: string; country: string } => {
    const parts = place.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      return {
        city: parts[0] || "",
        country: parts.slice(1).join(", ") || "",
      };
    }
    return { city: place, country: "" };
  };

  // Fetch companies from API
  const { data: companies = [] } = useCompanies();

  // Transform companies to CargoCompany format
  const cargoCompanies = useMemo(() => {
    return companies.map(transformCompanyToCargoCompany);
  }, [companies]);

  // Track if the segment form has been saved (to show "Cargo Declaration" button)
  const [hasBeenSaved, setHasBeenSaved] = useState(() => {
    // Consider saved if essential fields are present
    return Boolean(
      data.startAt && data.estFinishAt && typeof data.baseFeeUsd === "number"
    );
  });

  // Sync hasBeenSaved when data changes (e.g., after external updates)
  useEffect(() => {
    const isSaved = Boolean(
      data.startAt && data.estFinishAt && typeof data.baseFeeUsd === "number"
    );
    setHasBeenSaved(isSaved);
  }, [data.startAt, data.estFinishAt, data.baseFeeUsd]);

  // helper state derived inline by Field components when needed
  const { step, place } = data;
  const headerId = `segment-header-${step}`;

  useMemo<DocumentItem[]>(() => {
    return data.documents ?? [];
  }, [data.documents]);

  // Determine border color based on segment status
  const getBorderColor = () => {
    if (locked) return "border-transparent";
    if (editable) return "border-dotted border-blue-500";

    // Check for error/alert state first (highest priority)
    const hasError =
      data.hasDisruption ||
      data.logisticsStatus === "CANCELLED" ||
      data.logisticsStatus === "LOADING";
    if (hasError) {
      return "border-red-600";
    }

    // Check for delivered state
    if (data.progressStage === "delivered") {
      return "border-green-600";
    }

    // Check for in-progress state (any active progressStage except delivered)
    // This includes: in_origin, loading, to_dest, in_customs, to_origin, start
    // or if segment is marked as current
    if (data.progressStage || data.isCurrent) {
      return "border-yellow-600";
    }

    // Not started yet (upcoming states) or no progressStage
    return "border-slate-200";
  };

  return (
    <div
      className={cn(
        "relative border-2 rounded-xl shadow-[0_0_0_1px_rgba(99,102,241,0.04)]",
        locked ? "bg-slate-50 border-transparent" : "bg-white",
        getBorderColor(),
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
        isCurrent={data.isCurrent ?? false}
        distance={data.distance}
        eta={data.estFinishAt}
        avatarUrl={data.assigneeAvatarUrl}
        assigneeName={data.assigneeName}
        locked={locked}
        editable={editable}
        headerId={headerId}
        onToggle={handleToggle}
        showCargoButton={
          !open &&
          editable &&
          Boolean(data.nextPlace) &&
          !data.isCompleted &&
          hasBeenSaved
        }
        onCargoClick={(e) => {
          e.stopPropagation();
          setPendingUpdate({});
          setShowCargoModal(true);
        }}
        assignmentStatus={data.assignmentStatus}
      />

      {data.progressStage && !open && (
        <div className="px-3 pb-3">
          <SegmentProgress
            current={data.progressStage}
            dateTime={data.datetime}
            showWarningIcon={data.hasDisruption ?? false}
          />
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
        <div className="overflow-hidden">
          <div
            className={cn(
              "px-3 bg-slate-100 py-2 gap-6",
              open && "rounded-b-xl"
            )}
          >
            {/* Shipment Link Section - only shown when shipmentLinkProps is provided */}
            {shipmentLinkProps && (
              <div className="mb-4">
                <ShipmentLinkSection
                  shipmentTitle={shipmentLinkProps.shipmentTitle}
                  shipmentId={shipmentLinkProps.shipmentId}
                  fromPlace={shipmentLinkProps.fromPlace}
                  toPlace={shipmentLinkProps.toPlace}
                  fromCountryCode={shipmentLinkProps.fromCountryCode}
                  toCountryCode={shipmentLinkProps.toCountryCode}
                  step={data.step}
                />
              </div>
            )}

            {/* Segment progress appears here only for non-current segments */}
            {children ? (
              <div>{children}</div>
            ) : !data.isCurrent && data.progressStage && !locked ? (
              <SegmentProgress
                current={data.progressStage}
                showWarningIcon={data.hasDisruption ?? false}
              />
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
                <DatePicker
                  label="START DATE"
                  value={startDateValue}
                  onChange={setStartDateValue}
                  error={showErrors && !startDateValue.trim()}
                />
                <DatePicker
                  label="EST. FINISH DATE"
                  value={estFinishDateValue}
                  onChange={setEstFinishDateValue}
                  error={showErrors && !estFinishDateValue.trim()}
                />
                <TimePicker
                  label="START TIME"
                  value={startTimeValue}
                  onChange={setStartTimeValue}
                  error={showErrors && !startTimeValue.trim()}
                />

                <TimePicker
                  label="EST. FINISH TIME"
                  value={estFinishTimeValue}
                  onChange={setEstFinishTimeValue}
                  error={showErrors && !estFinishTimeValue.trim()}
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
                    setStartDateValue("");
                    setStartTimeValue("");
                    setEstFinishDateValue("");
                    setEstFinishTimeValue("");
                    setBaseFee("");
                    setShowErrors(false);
                    setHasBeenSaved(false);
                  }}
                  onSave={async () => {
                    const valid =
                      toValue.trim() &&
                      startDateValue.trim() &&
                      startTimeValue.trim() &&
                      estFinishDateValue.trim() &&
                      estFinishTimeValue.trim() &&
                      baseFee.trim();
                    if (!valid) {
                      setShowErrors(true);
                      return;
                    }
                    try {
                      const update: Partial<SegmentData> = {
                        place: fromValue.trim(),
                        nextPlace: toValue.trim(),
                        startAt: combineDateTime(
                          startDateValue.trim(),
                          startTimeValue.trim()
                        ),
                        estFinishAt: combineDateTime(
                          estFinishDateValue.trim(),
                          estFinishTimeValue.trim()
                        ),
                        baseFeeUsd: parseFloat(baseFee),
                        isPlaceholder: false,
                      };

                      // Call API if segmentId is provided
                      let apiResponse: SegmentReadDto | null = null;
                      if (segmentId) {
                        try {
                          const fromPlace = parsePlace(fromValue.trim());
                          const toPlace = parsePlace(toValue.trim());
                          const updatePayload = {
                            originCity: fromPlace.city,
                            originCountry: fromPlace.country,
                            destinationCity: toPlace.city,
                            destinationCountry: toPlace.country,
                            estimatedStartTime: combineDateTime(
                              startDateValue.trim(),
                              startTimeValue.trim()
                            ),
                            estimatedFinishTime: combineDateTime(
                              estFinishDateValue.trim(),
                              estFinishTimeValue.trim()
                            ),
                            baseFee: parseFloat(baseFee),
                          };
                          console.log("Calling updateSegment API with:", {
                            segmentId,
                            payload: updatePayload,
                          });
                          apiResponse = await updateSegment(
                            segmentId,
                            updatePayload
                          );
                          console.log(
                            "Segment updated successfully",
                            apiResponse
                          );
                        } catch (apiError) {
                          console.error("API update failed:", apiError);
                          throw apiError; // Re-throw to be caught by outer catch
                        }
                      } else {
                        console.warn(
                          "No segmentId provided, skipping API call"
                        );
                      }

                      setHasBeenSaved(true);
                      // Use API response if available, otherwise use local update
                      if (apiResponse) {
                        // Map API response back to SegmentData format
                        const originPlace =
                          apiResponse.originCity && apiResponse.originCountry
                            ? `${apiResponse.originCity}, ${apiResponse.originCountry}`
                            : apiResponse.originCity ||
                              apiResponse.originCountry ||
                              "";
                        const destinationPlace =
                          apiResponse.destinationCity &&
                          apiResponse.destinationCountry
                            ? `${apiResponse.destinationCity}, ${apiResponse.destinationCountry}`
                            : apiResponse.destinationCity ||
                              apiResponse.destinationCountry ||
                              "";

                        onSave?.({
                          place: originPlace,
                          nextPlace: destinationPlace,
                          startAt: apiResponse.estimatedStartTime || undefined,
                          estFinishAt:
                            apiResponse.estimatedFinishTime || undefined,
                          baseFeeUsd: apiResponse.baseFee ?? undefined,
                          isPlaceholder: false,
                        });
                      } else {
                        onSave?.(update);
                      }
                      // Close segment after save if it's currently open
                      if (open) {
                        handleToggle();
                      }
                    } catch (error) {
                      console.error("Failed to update segment:", error);
                      // Still call onSave for local state update even if API fails
                      onSave?.({
                        place: fromValue.trim(),
                        nextPlace: toValue.trim(),
                        startAt: combineDateTime(
                          startDateValue.trim(),
                          startTimeValue.trim()
                        ),
                        estFinishAt: combineDateTime(
                          estFinishDateValue.trim(),
                          estFinishTimeValue.trim()
                        ),
                        baseFeeUsd: parseFloat(baseFee),
                        isPlaceholder: false,
                      });
                    }
                  }}
                  onSaveDeclare={async () => {
                    const valid =
                      toValue.trim() &&
                      startDateValue.trim() &&
                      startTimeValue.trim() &&
                      estFinishDateValue.trim() &&
                      estFinishTimeValue.trim() &&
                      baseFee.trim();
                    if (!valid) {
                      setShowErrors(true);
                      return;
                    }
                    try {
                      const update: Partial<SegmentData> = {
                        place: fromValue.trim(),
                        nextPlace: toValue.trim(),
                        startAt: combineDateTime(
                          startDateValue.trim(),
                          startTimeValue.trim()
                        ),
                        estFinishAt: combineDateTime(
                          estFinishDateValue.trim(),
                          estFinishTimeValue.trim()
                        ),
                        baseFeeUsd: parseFloat(baseFee),
                        isPlaceholder: false,
                      };

                      // Call API if segmentId is provided
                      let apiResponse: SegmentReadDto | null = null;
                      if (segmentId) {
                        try {
                          const fromPlace = parsePlace(fromValue.trim());
                          const toPlace = parsePlace(toValue.trim());
                          const updatePayload = {
                            originCity: fromPlace.city,
                            originCountry: fromPlace.country,
                            destinationCity: toPlace.city,
                            destinationCountry: toPlace.country,
                            estimatedStartTime: combineDateTime(
                              startDateValue.trim(),
                              startTimeValue.trim()
                            ),
                            estimatedFinishTime: combineDateTime(
                              estFinishDateValue.trim(),
                              estFinishTimeValue.trim()
                            ),
                            baseFee: parseFloat(baseFee),
                          };
                          console.log(
                            "Calling updateSegment API (Save & Declare) with:",
                            {
                              segmentId,
                              payload: updatePayload,
                            }
                          );
                          apiResponse = await updateSegment(
                            segmentId,
                            updatePayload
                          );
                          console.log(
                            "Segment updated successfully (Save & Declare)",
                            apiResponse
                          );
                        } catch (apiError) {
                          console.error(
                            "API update failed (Save & Declare):",
                            apiError
                          );
                          throw apiError; // Re-throw to be caught by outer catch
                        }
                      } else {
                        console.warn(
                          "No segmentId provided (Save & Declare), skipping API call"
                        );
                      }

                      setHasBeenSaved(true);
                      // Use API response if available, otherwise use local update
                      if (apiResponse) {
                        // Map API response back to SegmentData format
                        const originPlace =
                          apiResponse.originCity && apiResponse.originCountry
                            ? `${apiResponse.originCity}, ${apiResponse.originCountry}`
                            : apiResponse.originCity ||
                              apiResponse.originCountry ||
                              "";
                        const destinationPlace =
                          apiResponse.destinationCity &&
                          apiResponse.destinationCountry
                            ? `${apiResponse.destinationCity}, ${apiResponse.destinationCountry}`
                            : apiResponse.destinationCity ||
                              apiResponse.destinationCountry ||
                              "";

                        setPendingUpdate({
                          place: originPlace,
                          nextPlace: destinationPlace,
                          startAt: apiResponse.estimatedStartTime || undefined,
                          estFinishAt:
                            apiResponse.estimatedFinishTime || undefined,
                          baseFeeUsd: apiResponse.baseFee ?? undefined,
                          isPlaceholder: false,
                        });
                      } else {
                        setPendingUpdate(update);
                      }
                      setShowCargoModal(true);
                    } catch (error) {
                      console.error("Failed to update segment:", error);
                      // Still proceed with cargo modal even if API fails
                      setHasBeenSaved(true);
                      setPendingUpdate({
                        place: fromValue.trim(),
                        nextPlace: toValue.trim(),
                        startAt: combineDateTime(
                          startDateValue.trim(),
                          startTimeValue.trim()
                        ),
                        estFinishAt: combineDateTime(
                          estFinishDateValue.trim(),
                          estFinishTimeValue.trim()
                        ),
                        baseFeeUsd: parseFloat(baseFee),
                        isPlaceholder: false,
                      });
                      setShowCargoModal(true);
                    }
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
        companies={cargoCompanies}
        defaultSelectedIds={data.cargoCompanies?.map((c) => c.id)}
        segmentId={segmentId}
        onSelect={(companies) => {
          const update: Partial<SegmentData> = {
            ...(pendingUpdate ?? {}),
            localCompany: companies.map((c) => c.name).join(", "),
            cargoCompanies: companies,
          };
          onSave?.(update);
          setShowCargoModal(false);
          // Close segment after cargo selection if it's currently open
          if (open) {
            handleToggle();
          }
          setPendingUpdate(null);
        }}
      />
    </div>
  );
}

export default SegmentDetails;
