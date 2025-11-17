import {useMemo, useState, useEffect, type ReactNode} from "react";
import SegmentProgress from "./SegmentProgress";
import {cn} from "../../../../shared/utils/cn";
import {CITY_OPTIONS} from "../../data/cities";
import CargoDeclarationModal, {
  type CargoCompany,
} from "../../components/CargoDeclarationModal";
import FieldBoxSelect from "./fields/FieldBoxSelect";
import DatePicker from "./fields/DatePicker";
import TimePicker from "./fields/TimePicker";
import BaseFeeField from "./fields/BaseFeeField";
import {combineDateTime, splitDateTime} from "./utils/segmentDateTime";
import SegmentActions from "./SegmentActions";
import SegmentHeader from "./SegmentHeader";
import SegmentInfoSummary from "./SegmentInfoSummary";
import type {SegmentData} from "../../../../shared/types/segmentData";
import {SEGMENT_STATUS} from "../../../../services/shipment/shipment.api.service";
import {
  SegmentAssignmentStatus,
  type Shipment,
} from "../../../../shared/types/shipment";
import CargoAssignmentsList from "./CargoAssignmentsList";
import {ShipmentLinkSection} from "./ShipmentLinkSection";
import type {SegmentReadDto} from "../../../../services/shipment/shipment.api.service";
import {useCompanies} from "../../../../services/company/hooks";
import {
  useUpdateSegment,
  useSegmentAnnouncements,
} from "../../../../services/shipment/hooks";
import type {CompanyReadDto} from "../../../../services/company/company.service";
import {
  computeSegmentPlace,
  computeSegmentNextPlace,
} from "../../../../shared/utils/segmentHelpers";

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
  shipment: Shipment;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
  onSave?: (update: Partial<SegmentData>) => void;
  editable?: boolean;
  locked?: boolean;
  segmentId?: string;
  linkShipment?: boolean;
};

export function SegmentDetails({
  className,
  data,
  shipment,
  defaultOpen = false,
  open: controlledOpen,
  onToggle: controlledOnToggle,
  children,
  onSave,
  editable = false,
  locked = false,
  segmentId,
  linkShipment = false,
}: SegmentDetailsProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  // Use controlled state if provided, otherwise use internal state
  const isControlled =
    controlledOpen !== undefined && controlledOnToggle !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const handleToggle = isControlled
    ? controlledOnToggle
    : () => setInternalOpen((v) => !v);

  // Compute place and nextPlace from API fields
  const place = computeSegmentPlace(data);
  const nextPlace = computeSegmentNextPlace(data);

  const [toValue, setToValue] = useState<string>(nextPlace ?? "");
  const [fromValue, setFromValue] = useState<string>(place);

  // Split date-time values into separate date and time states
  const [startDateValue, setStartDateValue] = useState<string>(() => {
    const startAt =
      typeof data.estimatedStartTime === "string"
        ? data.estimatedStartTime
        : "";
    const result = splitDateTime(startAt);
    return result.d;
  });
  const [startTimeValue, setStartTimeValue] = useState<string>(() => {
    const startAt =
      typeof data.estimatedStartTime === "string"
        ? data.estimatedStartTime
        : "";
    const result = splitDateTime(startAt);
    return result.t;
  });
  const [estFinishDateValue, setEstFinishDateValue] = useState<string>(() => {
    const estFinishAt =
      typeof data.estimatedFinishTime === "string"
        ? data.estimatedFinishTime
        : "";
    const result = splitDateTime(estFinishAt);
    return result.d;
  });
  const [estFinishTimeValue, setEstFinishTimeValue] = useState<string>(() => {
    const estFinishAt =
      typeof data.estimatedFinishTime === "string"
        ? data.estimatedFinishTime
        : "";
    const result = splitDateTime(estFinishAt);
    return result.t;
  });

  const [baseFee, setBaseFee] = useState<string>(
    typeof data.baseFee === "number" ? String(data.baseFee) : ""
  );

  const updateSegmentMutation = useUpdateSegment();

  // Sync form fields when data changes externally (e.g., after save)
  useEffect(() => {
    setFromValue(place);
    setToValue(nextPlace ?? "");
    const startAt =
      typeof data.estimatedStartTime === "string"
        ? data.estimatedStartTime
        : "";
    const startResult = splitDateTime(startAt);
    setStartDateValue(startResult.d);
    setStartTimeValue(startResult.t);
    const estFinishAt =
      typeof data.estimatedFinishTime === "string"
        ? data.estimatedFinishTime
        : "";
    const finishResult = splitDateTime(estFinishAt);
    setEstFinishDateValue(finishResult.d);
    setEstFinishTimeValue(finishResult.t);
    setBaseFee(typeof data.baseFee === "number" ? String(data.baseFee) : "");
  }, [
    place,
    nextPlace,
    data.estimatedStartTime,
    data.estimatedFinishTime,
    data.baseFee,
  ]);
  const [showErrors, setShowErrors] = useState(false);
  const [showCargoModal, setShowCargoModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] =
    useState<Partial<SegmentData> | null>(null);

  // Utility function to parse city and country from place string (format: "City, Country")
  const parsePlace = (place: string): {city: string; country: string} => {
    const parts = place.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      return {
        city: parts[0] || "",
        country: parts.slice(1).join(", ") || "",
      };
    }
    return {city: place, country: ""};
  };

  // Fetch companies from API
  const {data: companies = []} = useCompanies();

  // Transform companies to CargoCompany format
  const cargoCompanies = useMemo(() => {
    return companies.map(transformCompanyToCargoCompany);
  }, [companies]);

  // Fetch segment announcements when hasPendingAnnouncements is true
  const {data: announcements = []} = useSegmentAnnouncements(
    data.hasPendingAnnouncements && segmentId ? segmentId : null
  );

  // Track if the segment form has been saved (to show "Cargo Declaration" button)

  // helper state derived inline by Field components when needed
  const step = data.step ?? 0;
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
      data.status === SEGMENT_STATUS.CANCELLED ||
      data.status === SEGMENT_STATUS.LOADING;
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
        nextPlace={data.isPlaceholder ? undefined : nextPlace}
        isCompleted={data.isCompleted}
        open={open}
        isCurrent={data.isCurrent ?? false}
        distanceKm={data.distanceKm}
        eta={(data.estimatedFinishTime ?? null) as string | null}
        avatarUrl={data.assigneeAvatarUrl ?? undefined}
        assigneeName={data.assigneeName ?? undefined}
        locked={locked}
        editable={editable}
        headerId={headerId}
        onToggle={handleToggle}
        showCargoButton={
          !open &&
          editable &&
          Boolean(data.destinationCity) &&
          Boolean(data.originCity) &&
          !data.isCompleted
        }
        onCargoClick={(e) => {
          e.stopPropagation();
          setPendingUpdate({});
          setShowCargoModal(true);
        }}
        assignmentStatus={
          data.status === SEGMENT_STATUS.ASSIGNED
            ? SegmentAssignmentStatus.ASSIGNED
            : data.status === SEGMENT_STATUS.PENDING_ASSIGNMENT
            ? SegmentAssignmentStatus.PENDING_ASSIGNMENT
            : undefined
        }
      />

      {data.progressStage && !open && (
        <div className="px-3 pb-3">
          <SegmentProgress
            current={data.progressStage}
            dateTime={
              (data.estimatedStartTime ?? undefined) as string | undefined
            }
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
            {shipment && linkShipment && (
              <div className="mb-4">
                <ShipmentLinkSection
                  shipmentTitle={shipment.title}
                  shipmentId={shipment.id}
                  fromPlace={shipment.originCity ?? ""}
                  toPlace={shipment.destinationCity}
                  fromCountryCode={shipment.fromCountryCode}
                  toCountryCode={shipment.toCountryCode ?? ""}
                  step={data.step ?? 0}
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

            {editable ? (
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
                        estimatedStartTime: combineDateTime(
                          startDateValue.trim(),
                          startTimeValue.trim()
                        ),
                        estimatedFinishTime: combineDateTime(
                          estFinishDateValue.trim(),
                          estFinishTimeValue.trim()
                        ),
                        baseFee: parseFloat(baseFee),
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
                          apiResponse = await updateSegmentMutation.mutateAsync(
                            {
                              id: segmentId,
                              data: updatePayload,
                            }
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
                          estimatedStartTime:
                            apiResponse.estimatedStartTime || undefined,
                          estimatedFinishTime:
                            apiResponse.estimatedFinishTime || undefined,
                          baseFee: apiResponse.baseFee ?? undefined,
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
                        estimatedStartTime: combineDateTime(
                          startDateValue.trim(),
                          startTimeValue.trim()
                        ),
                        estimatedFinishTime: combineDateTime(
                          estFinishDateValue.trim(),
                          estFinishTimeValue.trim()
                        ),
                        baseFee: parseFloat(baseFee),
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
                        estimatedStartTime: combineDateTime(
                          startDateValue.trim(),
                          startTimeValue.trim()
                        ),
                        estimatedFinishTime: combineDateTime(
                          estFinishDateValue.trim(),
                          estFinishTimeValue.trim()
                        ),
                        baseFee: parseFloat(baseFee),
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
                          apiResponse = await updateSegmentMutation.mutateAsync(
                            {
                              id: segmentId,
                              data: updatePayload,
                            }
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
                          estimatedStartTime:
                            apiResponse.estimatedStartTime || undefined,
                          estimatedFinishTime:
                            apiResponse.estimatedFinishTime || undefined,
                          baseFee: apiResponse.baseFee ?? undefined,
                          isPlaceholder: false,
                        });
                      } else {
                        setPendingUpdate(update);
                      }
                      setShowCargoModal(true);
                    } catch (error) {
                      console.error("Failed to update segment:", error);
                      // Still proceed with cargo modal even if API fails
                      setPendingUpdate({
                        place: fromValue.trim(),
                        nextPlace: toValue.trim(),
                        estimatedStartTime: combineDateTime(
                          startDateValue.trim(),
                          startTimeValue.trim()
                        ),
                        estimatedFinishTime: combineDateTime(
                          estFinishDateValue.trim(),
                          estFinishTimeValue.trim()
                        ),
                        baseFee: parseFloat(baseFee),
                        isPlaceholder: false,
                      });
                      setShowCargoModal(true);
                    }
                  }}
                />
              </div>
            ) : data.hasPendingAnnouncements ? (
              <CargoAssignmentsList announcements={announcements ?? []} />
            ) : (
              <SegmentInfoSummary
                vehicleLabel={
                  (data.vehicleLabel ?? undefined) as string | undefined
                }
                localCompany={
                  (data.localCompany ?? undefined) as string | undefined
                }
                startAt={
                  (data.estimatedStartTime ?? undefined) as string | undefined
                }
                finishedAt={
                  (data.estimatedFinishTime ?? undefined) as string | undefined
                }
                documents={data.documents?.map((doc) => ({
                  ...doc,
                  sizeLabel: doc.sizeLabel || "0 KB",
                }))}
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
