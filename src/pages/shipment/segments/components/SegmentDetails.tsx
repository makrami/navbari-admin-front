import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import SegmentProgress from "./SegmentProgress";
import { cn } from "../../../../shared/utils/cn";
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
import { StarRating } from "./StarRating";
import type { Segment } from "../../../../shared/types/segmentData";
import { SEGMENT_STATUS } from "../../../../services/shipment/shipment.api.service";
import type { Shipment } from "../../../../shared/types/shipment";
import CargoAssignmentsList from "./CargoAssignmentsList";
import { ShipmentLinkSection } from "./ShipmentLinkSection";
import type { SegmentReadDto } from "../../../../services/shipment/shipment.api.service"; // SegmentReadDto is now an alias for Segment
import { useCompanies } from "../../../../services/company/hooks";
import {
  useUpdateSegment,
  useSegmentAnnouncements,
  useRateSegment,
  useSegmentRoute,
} from "../../../../services/shipment/hooks";
import {
  COMPANY_STATUS,
  type CompanyReadDto,
} from "../../../../services/company/company.service";
import {
  computeSegmentPlace,
  computeSegmentNextPlace,
} from "../../../../shared/utils/segmentHelpers";
import { getCountryCode } from "../../../../shared/utils/countryCode";
import { useChatWithRecipient } from "../../../../shared/hooks/useChatWithRecipient";
import { ChatOverlay } from "../../../../shared/components/ChatOverlay";
import {
  CHAT_RECIPIENT_TYPE,
  CHAT_ALERT_TYPE,
} from "../../../../services/chat/chat.types";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "../../../../services/user/hooks";
import { useCities } from "../../../../services/geography/hooks";
import { MapPin } from "lucide-react";
import { MapSelectionModal } from "../../components/MapSelectionModal";

type DocumentItem = NonNullable<Segment["documents"]>[number];

// Helper function to transform CompanyReadDto to CargoCompany
function transformCompanyToCargoCompany(company: CompanyReadDto): CargoCompany {
  return {
    id: company.id,
    name: company.name,
    country: company.country,
    countryCode: getCountryCode(company.country ?? ""),
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
  data: Segment;
  shipment: Shipment;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
  onSave?: (update: Partial<Segment>) => void;
  editable?: boolean;
  locked?: boolean;
  segmentId?: string;
  linkShipment?: boolean;
  previousSegment?: Segment;
};

export function SegmentDetails({
  className,
  data,
  shipment,
  defaultOpen = false,
  open: controlledOpen,
  onToggle: controlledOnToggle,
  onSave,
  editable = false,
  locked = false,
  segmentId,
  linkShipment = false,
  previousSegment,
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

  // Check if previous segment has destination and is in progress
  const previousSegmentDestination = previousSegment
    ? computeSegmentNextPlace(previousSegment)
    : undefined;
  const isPreviousSegmentInProgress =
    previousSegment &&
    previousSegment.status !== SEGMENT_STATUS.PENDING_ASSIGNMENT &&
    previousSegment.status !== SEGMENT_STATUS.CANCELLED &&
    previousSegment.status !== SEGMENT_STATUS.DELIVERED &&
    previousSegment.status !== undefined;
  const shouldLockOrigin =
    !!previousSegmentDestination &&
    isPreviousSegmentInProgress &&
    editable &&
    data.status === SEGMENT_STATUS.PENDING_ASSIGNMENT;

  const [toValue, setToValue] = useState<string>(nextPlace ?? "");
  const [fromValue, setFromValue] = useState<string>(
    shouldLockOrigin && previousSegmentDestination
      ? previousSegmentDestination
      : place
  );

  // Coordinate states
  const [originLatitude, setOriginLatitude] = useState<number | undefined>();
  const [originLongitude, setOriginLongitude] = useState<number | undefined>();
  const [destinationLatitude, setDestinationLatitude] = useState<
    number | undefined
  >();
  const [destinationLongitude, setDestinationLongitude] = useState<
    number | undefined
  >();

  // Map selection modal state
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapSelectionType, setMapSelectionType] = useState<"from" | "to">(
    "from"
  );

  // Fetch segment route to get existing coordinates
  // Only fetch when segmentId exists AND both origin and destination are available
  const hasOrigin = place.trim().length > 0;
  const hasDestination = nextPlace !== undefined && nextPlace.trim().length > 0;
  const { data: segmentRoute } = useSegmentRoute(segmentId || null, {
    enabled: !!segmentId && hasOrigin && hasDestination,
  });

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

  const [baseFee, setBaseFee] = useState<string>(String(data.baseFee));

  // Origin and destination details state
  const [originDetails, setOriginDetails] = useState<string>(
    ((data as unknown as Record<string, unknown>).originDetails as string) || ""
  );
  const [destinationDetails, setDestinationDetails] = useState<string>(
    ((data as unknown as Record<string, unknown>)
      .destinationDetails as string) || ""
  );

  const updateSegmentMutation = useUpdateSegment();
  const rateSegmentMutation = useRateSegment();
  const { data: user } = useCurrentUser();

  // Get permissions array from user data
  const userRecord = user as Record<string, unknown> | undefined;
  const permissions = (userRecord?.permissions as string[] | undefined) || [];
  const hasSegmentsManage = permissions.includes("segments:manage");

  // Track previous segment ID and key data fields to detect actual changes
  const prevSegmentIdRef = useRef<string | undefined>(segmentId);
  const prevDataKeyRef = useRef<string>("");

  // Sync form fields when segment ID changes or when data actually changes (not just refetch)
  useEffect(() => {
    // Create a key from the data fields that matter for the form
    const dataKey = `${data.id}-${place}-${nextPlace}-${data.estimatedStartTime}-${data.estimatedFinishTime}-${data.baseFee}`;
    const segmentChanged = prevSegmentIdRef.current !== segmentId;
    const dataChanged = prevDataKeyRef.current !== dataKey;

    // Only sync form fields if:
    // 1. Segment ID changed (new segment selected)
    // 2. Key data fields actually changed (not just a refetch with same data)
    if (segmentChanged || dataChanged) {
      // Check if origin should be locked from previous segment
      const prevSegmentDest = previousSegment
        ? computeSegmentNextPlace(previousSegment)
        : undefined;
      const isPrevInProgress =
        previousSegment &&
        previousSegment.status !== SEGMENT_STATUS.PENDING_ASSIGNMENT &&
        previousSegment.status !== SEGMENT_STATUS.CANCELLED &&
        previousSegment.status !== SEGMENT_STATUS.DELIVERED &&
        previousSegment.status !== undefined;
      const shouldLock =
        !!prevSegmentDest &&
        isPrevInProgress &&
        editable &&
        data.status === SEGMENT_STATUS.PENDING_ASSIGNMENT;

      setFromValue(shouldLock && prevSegmentDest ? prevSegmentDest : place);
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
      setBaseFee(String(data.baseFee));
      const dataRecord = data as unknown as Record<string, unknown>;
      setOriginDetails((dataRecord.originDetails as string) || "");
      setDestinationDetails((dataRecord.destinationDetails as string) || "");

      // Update refs
      prevSegmentIdRef.current = segmentId;
      prevDataKeyRef.current = dataKey;
    }
  }, [
    segmentId,
    place,
    nextPlace,
    data,
    data.estimatedStartTime,
    data.estimatedFinishTime,
    data.baseFee,
    data.id,
    data.status,
    editable,
    previousSegment,
  ]);
  const [showErrors, setShowErrors] = useState(false);
  const [showCargoModal, setShowCargoModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<Partial<Segment> | null>(
    null
  );

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
  const { data: companies = [], refetch: refetchCompanies } = useCompanies();

  // Fetch cities from API
  const { data: cities = [] } = useCities();

  // Transform cities to "City, Country" format for select options
  const cityOptions = useMemo(() => {
    return cities.map((city) => `${city.city}, ${city.country}`);
  }, [cities]);

  // Initialize coordinates from segment data first, then fall back to segment route if available
  useEffect(() => {
    // If origin is locked from previous segment, use previous segment's destination coordinates
    if (shouldLockOrigin && previousSegment) {
      if (
        previousSegment.destinationLatitude != null &&
        previousSegment.destinationLongitude != null
      ) {
        setOriginLatitude(Number(previousSegment.destinationLatitude));
        setOriginLongitude(Number(previousSegment.destinationLongitude));
      }
    } else {
      // First, try to read from segment data (from server)
      if (data.originLatitude != null && data.originLongitude != null) {
        setOriginLatitude(Number(data.originLatitude));
        setOriginLongitude(Number(data.originLongitude));
      } else if (
        segmentRoute?.originLatitude &&
        segmentRoute?.originLongitude
      ) {
        // Fall back to segment route if not in segment data
        setOriginLatitude(Number(segmentRoute.originLatitude));
        setOriginLongitude(Number(segmentRoute.originLongitude));
      }
    }

    if (data.destinationLatitude != null && data.destinationLongitude != null) {
      setDestinationLatitude(Number(data.destinationLatitude));
      setDestinationLongitude(Number(data.destinationLongitude));
    } else if (
      segmentRoute?.destinationLatitude &&
      segmentRoute?.destinationLongitude
    ) {
      // Fall back to segment route if not in segment data
      setDestinationLatitude(Number(segmentRoute.destinationLatitude));
      setDestinationLongitude(Number(segmentRoute.destinationLongitude));
    }
  }, [
    data.originLatitude,
    data.originLongitude,
    data.destinationLatitude,
    data.destinationLongitude,
    segmentRoute,
    shouldLockOrigin,
    previousSegment,
  ]);

  // Clear coordinates when origin field is cleared
  useEffect(() => {
    if (!fromValue.trim()) {
      setOriginLatitude(undefined);
      setOriginLongitude(undefined);
    }
  }, [fromValue]);

  // Clear coordinates when destination field is cleared
  useEffect(() => {
    if (!toValue.trim()) {
      setDestinationLatitude(undefined);
      setDestinationLongitude(undefined);
    }
  }, [toValue]);

  // Check if a value matches a city from the cities list
  const isCityFromList = useCallback(
    (value: string): boolean => {
      if (!value.trim() || cities.length === 0) return false;
      const cityOptions = cities.map((city) => `${city.city}, ${city.country}`);
      return cityOptions.includes(value.trim());
    },
    [cities]
  );

  // Handle origin field change - clear coordinates if city selected from list
  const handleFromChange = useCallback(
    (value: string) => {
      // Don't allow changes if origin is locked from previous segment
      if (shouldLockOrigin) {
        return;
      }
      setFromValue(value);
      // If the value matches a city from the list, clear coordinates
      if (value.trim() && isCityFromList(value)) {
        setOriginLatitude(undefined);
        setOriginLongitude(undefined);
      }
    },
    [isCityFromList, shouldLockOrigin]
  );

  // Handle destination field change - clear coordinates if city selected from list
  const handleToChange = useCallback(
    (value: string) => {
      setToValue(value);
      // If the value matches a city from the list, clear coordinates
      if (value.trim() && isCityFromList(value)) {
        setDestinationLatitude(undefined);
        setDestinationLongitude(undefined);
      }
    },
    [isCityFromList]
  );

  const handleMapSelect = (
    latitude: number,
    longitude: number,
    city?: string,
    country?: string
  ) => {
    if (mapSelectionType === "from") {
      setOriginLatitude(latitude);
      setOriginLongitude(longitude);
      // Update the "from" field if city and country are available
      if (city && country) {
        setFromValue(`${city}, ${country}`);
      }
    } else {
      setDestinationLatitude(latitude);
      setDestinationLongitude(longitude);
      // Update the "to" field if city and country are available
      if (city && country) {
        setToValue(`${city}, ${country}`);
      }
    }
    setMapModalOpen(false);
  };

  const handleOpenMapModal = (type: "from" | "to") => {
    setMapSelectionType(type);
    setMapModalOpen(true);
  };

  // Transform companies to CargoCompany format
  const cargoCompanies = useMemo(() => {
    return companies
      .filter((company) => company.status === COMPANY_STATUS.APPROVED)
      .map(transformCompanyToCargoCompany);
  }, [companies]);

  // Refetch companies when cargo modal opens
  useEffect(() => {
    if (showCargoModal) {
      refetchCompanies();
    }
  }, [showCargoModal, refetchCompanies]);

  // Fetch segment announcements when hasPendingAnnouncements is true or when cargo modal is open
  const { data: announcements = [] } = useSegmentAnnouncements(
    (data.hasPendingAnnouncements || showCargoModal) && segmentId
      ? segmentId
      : null
  );

  // Extract company IDs from announcements to disable them in the modal
  const announcedCompanyIds = useMemo(() => {
    return announcements.map((announcement) => announcement.companyId);
  }, [announcements]);

  const { t } = useTranslation();

  // Use chat hook for driver chat (for alert sending)
  const chatHook = useChatWithRecipient({
    recipientType: CHAT_RECIPIENT_TYPE.DRIVER,
    driverId: data.driverId ?? undefined,
    recipientName: data.driverName || t("segments.cardHeader.driver"),
  });

  // Handle alert icon click - send alert message and open chat
  const handleAlertClick = () => {
    if (!data.driverId || !data.alertMessage) return;

    // Get translated alert message
    const alertText = t(
      `shipment.segments.progress.alert.${data.alertMessage}`
    );

    // Send alert message
    chatHook.handleAlertChipClick({
      id: "alert",
      label: alertText,
      alertType: CHAT_ALERT_TYPE.ALERT,
    });

    // Open chat overlay
    chatHook.setIsChatOpen(true);
  };

  // Handle rating submission
  const handleRatingSubmit = async (rating: number) => {
    if (!segmentId) return;

    await rateSegmentMutation.mutateAsync({
      id: segmentId,
      rating,
    });
  };

  // Track if the segment form has been saved (to show "Cargo Declaration" button)

  // helper state derived inline by Field components when needed

  useMemo<DocumentItem[]>(() => {
    return data.documents ?? [];
  }, [data.documents]);

  // Determine if segment is assigned
  const isAssigned =
    data.status !== SEGMENT_STATUS.PENDING_ASSIGNMENT &&
    data.status !== undefined;

  // Determine background color - all segments should have white background
  const getBackgroundColor = () => {
    return "bg-white";
  };

  // Determine border color based on segment status
  const getBorderColor = () => {
    if (locked) return "border-transparent";

    // Check for error/alert state first (highest priority)
    const hasError =
      data.hasDisruption || data.status === SEGMENT_STATUS.CANCELLED;
    if (hasError) {
      return "border-red-600";
    }

    // Check for delivered state
    if (data.status === SEGMENT_STATUS.DELIVERED || data.isCompleted) {
      return "border-green-600";
    }

    // Also check for active progress stages or current segment
    const isActive =
      (data.status !== SEGMENT_STATUS.PENDING_ASSIGNMENT &&
        data.status !== SEGMENT_STATUS.DELIVERED) ||
      data.isCurrent;

    if (isAssigned || isActive) {
      return "border-yellow-600";
    }

    // Editable segments that are pending assignment get blue border
    if (editable && data.status === SEGMENT_STATUS.PENDING_ASSIGNMENT) {
      return "border-dotted border-blue-500";
    }

    // Not started yet (pending assignment or no status)
    return "border-slate-200";
  };

  return (
    <div
      dir="ltr"
      className={cn(
        "relative border-2 rounded-xl shadow-[0_0_0_1px_rgba(99,102,241,0.04)]",
        getBackgroundColor(),
        getBorderColor(),
        className
      )}
      data-name="Segment Item"
    >
      <SegmentHeader
        order={data.order}
        segmentStatus={data.status as SEGMENT_STATUS | undefined}
        originCity={data.originCity ?? undefined}
        originCountry={data.originCountry ?? undefined}
        destinationCity={data.destinationCity ?? undefined}
        destinationCountry={data.destinationCountry ?? undefined}
        isCompleted={data.isCompleted}
        lastGpsUpdate={data.lastGpsUpdate ?? undefined}
        open={open}
        isCurrent={data.isCurrent ?? false}
        distanceKm={data.distanceKm ? parseFloat(data.distanceKm) : null}
        eta={(data.estimatedFinishTime ?? null) as string | null}
        driverAvatarUrl={data.driverAvatarUrl ?? undefined}
        driverId={data.driverId ?? undefined}
        driverName={data.driverName ?? undefined}
        driverRating={data.driverRating ?? null}
        editable={editable}
        segmentId={data.id}
        shipmentId={data.shipmentId}
        onToggle={handleToggle}
        showCargoButton={
          hasSegmentsManage &&
          !!data.originCountry &&
          !!data.destinationCountry &&
          data.status === SEGMENT_STATUS.PENDING_ASSIGNMENT
        }
        onCargoClick={(e) => {
          e.stopPropagation();
          if (hasSegmentsManage) {
            setPendingUpdate({});
            setShowCargoModal(true);
          }
        }}
        isAssigned={isAssigned}
        previousSegmentDestination={previousSegmentDestination}
      />

      {data.status !== SEGMENT_STATUS.PENDING_ASSIGNMENT &&
        data.status !== SEGMENT_STATUS.CANCELLED &&
        !open && (
          <div className="px-3 pb-3 space-y-3">
            <SegmentProgress
              current={data.status as SEGMENT_STATUS}
              dateTime={
                (data.estimatedStartTime ?? undefined) as string | undefined
              }
              showWarningIcon={data.hasDisruption ?? false}
              segment={data}
              onAlertClick={handleAlertClick}
            />
            {data.status === SEGMENT_STATUS.DELIVERED && segmentId && (
              <StarRating
                segmentId={segmentId}
                currentRating={data.rating ?? null}
                onSubmit={handleRatingSubmit}
                driverAvatarUrl={data.driverAvatarUrl ?? undefined}
                driverName={data.driverName ?? undefined}
              />
            )}
          </div>
        )}

      {/* Expandable content container */}
      <div
        id={data.id}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
        aria-hidden={!open}
        role="region"
        aria-labelledby={data.id}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "px-3 bg-slate-50 py-2 gap-6",
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
                  fromCountryCode={shipment.originCountry}
                  toCountryCode={shipment.destinationCountry ?? ""}
                  step={data.step ?? 0}
                />
              </div>
            )}

            {/* Segment progress appears here when segment is expanded */}
            {data.status !== SEGMENT_STATUS.PENDING_ASSIGNMENT &&
            data.status !== SEGMENT_STATUS.CANCELLED &&
            !locked ? (
              <div className="space-y-3">
                <SegmentProgress
                  current={data.status as SEGMENT_STATUS}
                  showWarningIcon={data.hasDisruption ?? false}
                  segment={data}
                  onAlertClick={handleAlertClick}
                />
                {data.status === SEGMENT_STATUS.DELIVERED && segmentId && (
                  <StarRating
                    segmentId={segmentId}
                    currentRating={data.rating ?? null}
                    onSubmit={handleRatingSubmit}
                    driverAvatarUrl={data.driverAvatarUrl ?? undefined}
                    driverName={data.driverName ?? undefined}
                  />
                )}
              </div>
            ) : null}

            {/* Show form only when editable AND segment is pending assignment */}
            {editable && data.status === SEGMENT_STATUS.PENDING_ASSIGNMENT ? (
              <div className=" rounded-xl  grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <FieldBoxSelect
                    label="FROM"
                    value={fromValue}
                    onChange={handleFromChange}
                    options={cityOptions}
                    disabled={!hasSegmentsManage || shouldLockOrigin}
                  />
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleOpenMapModal("from")}
                    disabled={!hasSegmentsManage || shouldLockOrigin}
                  >
                    <MapPin className="size-4" />
                    <span>{t("shipment.addModal.selectFromMap")}</span>
                  </button>
                  {originLatitude !== undefined &&
                    originLongitude !== undefined && (
                      <p className="text-xs text-slate-500">
                        {t("shipment.addModal.coordinatesSelected")}:{" "}
                        {(+originLatitude).toFixed(6)},{" "}
                        {(+originLongitude).toFixed(6)}
                      </p>
                    )}
                </div>
                <div className="grid gap-1">
                  <FieldBoxSelect
                    label="TO"
                    value={toValue}
                    onChange={handleToChange}
                    options={cityOptions}
                    disabled={!hasSegmentsManage}
                  />
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleOpenMapModal("to")}
                    disabled={!hasSegmentsManage}
                  >
                    <MapPin className="size-4" />
                    <span>{t("shipment.addModal.selectFromMap")}</span>
                  </button>
                  {destinationLatitude !== undefined &&
                    destinationLongitude !== undefined && (
                      <p className="text-xs text-slate-500">
                        {t("shipment.addModal.coordinatesSelected")}:{" "}
                        {(+destinationLatitude).toFixed(6)},{" "}
                        {(+destinationLongitude).toFixed(6)}
                      </p>
                    )}
                </div>
                <DatePicker
                  label="START DATE"
                  value={startDateValue}
                  onChange={setStartDateValue}
                  error={showErrors && !startDateValue.trim()}
                  disabled={!hasSegmentsManage}
                />
                <DatePicker
                  label="EST. FINISH DATE"
                  value={estFinishDateValue}
                  onChange={setEstFinishDateValue}
                  error={showErrors && !estFinishDateValue.trim()}
                  disabled={!hasSegmentsManage}
                />
                <TimePicker
                  label="START TIME"
                  value={startTimeValue}
                  onChange={setStartTimeValue}
                  error={showErrors && !startTimeValue.trim()}
                  disabled={!hasSegmentsManage}
                />

                <TimePicker
                  label="EST. FINISH TIME"
                  value={estFinishTimeValue}
                  onChange={setEstFinishTimeValue}
                  error={showErrors && !estFinishTimeValue.trim()}
                  disabled={!hasSegmentsManage}
                />
                <BaseFeeField
                  value={baseFee}
                  onChange={setBaseFee}
                  error={showErrors && !baseFee.trim()}
                  disabled={!hasSegmentsManage}
                />
                <SegmentActions
                  readOnly={locked || !editable || !hasSegmentsManage}
                  onReset={() => {
                    // Don't reset origin if it's locked from previous segment
                    if (!shouldLockOrigin) {
                      setFromValue(place);
                    }
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
                      const baseFeeNum = baseFee ? parseFloat(baseFee) : null;
                      const update: Partial<Segment> = {
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
                        baseFee:
                          baseFeeNum !== null ? String(baseFeeNum) : null,

                        isPlaceholder: false,
                      };

                      // Call API if segmentId is provided
                      let apiResponse: SegmentReadDto | null = null;
                      if (segmentId) {
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
                          baseFee: baseFeeNum ?? undefined,
                          originLongitude,
                          originLatitude,
                          destinationLongitude,
                          destinationLatitude,
                        };
                        apiResponse = await updateSegmentMutation.mutateAsync({
                          id: segmentId,
                          data: updatePayload,
                        });
                      }

                      // Use API response if available, otherwise use local update
                      if (apiResponse) {
                        // Map API response back to Segment format
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
                          baseFee: apiResponse.baseFee
                            ? String(apiResponse.baseFee)
                            : null,
                          isPlaceholder: false,
                        });
                      } else {
                        onSave?.(update);
                      }
                      // Close segment after save if it's currently open
                      if (open) {
                        handleToggle();
                      }
                    } catch {
                      // Still call onSave for local state update even if API fails
                      const baseFeeNum = baseFee ? parseFloat(baseFee) : null;
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
                        baseFee:
                          baseFeeNum !== null ? String(baseFeeNum) : null,
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
                      const baseFeeNum = baseFee ? parseFloat(baseFee) : null;
                      const update: Partial<Segment> = {
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
                        baseFee:
                          baseFeeNum !== null ? String(baseFeeNum) : null,
                        isPlaceholder: false,
                      };

                      // Call API if segmentId is provided
                      let apiResponse: SegmentReadDto | null = null;
                      if (segmentId) {
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
                          baseFee: baseFeeNum ?? undefined,
                          originLongitude: Number(originLongitude),
                          originLatitude: Number(originLatitude),
                          destinationLongitude: Number(destinationLongitude),
                          destinationLatitude: Number(destinationLatitude),
                        };
                        apiResponse = await updateSegmentMutation.mutateAsync({
                          id: segmentId,
                          data: updatePayload,
                        });
                      }

                      // Use API response if available, otherwise use local update
                      if (apiResponse) {
                        // Map API response back to Segment format
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
                          baseFee: apiResponse.baseFee
                            ? String(apiResponse.baseFee)
                            : null,
                          isPlaceholder: false,
                        });
                      } else {
                        setPendingUpdate(update);
                      }
                      setShowCargoModal(true);
                    } catch {
                      // Still proceed with cargo modal even if API fails
                      const baseFeeNum = baseFee ? parseFloat(baseFee) : null;
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
                        baseFee:
                          baseFeeNum !== null ? String(baseFeeNum) : null,
                        isPlaceholder: false,
                      });
                      setShowCargoModal(true);
                    }
                  }}
                />
              </div>
            ) : data.hasPendingAnnouncements ? (
              <CargoAssignmentsList
                announcements={announcements ?? []}
                segmentId={segmentId}
                originDetails={originDetails}
                destinationDetails={destinationDetails}
                estimatedStartTime={data.estimatedStartTime || undefined}
                estimatedFinishTime={data.estimatedFinishTime || undefined}
                cargoType={shipment?.cargoType || undefined}
                cargoWeight={shipment?.cargoWeight || undefined}
              />
            ) : (
              <SegmentInfoSummary
                driverId={data.driverId || null}
                driverName={data.driverName || null}
                localCompany={
                  (data.companyName ?? undefined) as string | undefined
                }
                companyId={data.companyId || null}
                estimatedStartTime={data.estimatedStartTime || undefined}
                estimatedFinishTime={data.estimatedFinishTime || undefined}
                etaToOrigin={data.etaToOrigin}
                etaToDestination={data.etaToDestination}
                finishedAt={data.deliveredAt || undefined}
                startedAt={data.startedAt || undefined}
                eta={data.eta}
                baseFee={data.baseFee ? parseFloat(data.baseFee) : undefined}
                vehicleType={data.vehicleType || undefined}
                lastGpsUpdate={data.lastGpsUpdate || undefined}
                alertCount={data.alertCount}
                delaysInMinutes={data.delaysInMinutes}
                pendingDocuments={data.pendingDocuments || 0}
                documents={data.documents?.map((doc) => ({
                  ...doc,
                  sizeLabel: doc.sizeLabel || "0 KB",
                }))}
                segmentId={segmentId}
                status={data.status as SEGMENT_STATUS | undefined}
                arrivedOriginAt={data.arrivedOriginAt}
                startLoadingAt={data.startLoadingAt}
                loadingCompletedAt={data.loadingCompletedAt}
                enterCustomsAt={data.enterCustomsAt}
                customsClearedAt={data.customsClearedAt}
                arrivedDestinationAt={data.arrivedDestinationAt}
                deliveredAt={data.deliveredAt}
                estLoadingCompletionTime={data.estLoadingCompletionTime}
                estCustomsClearanceTime={data.estCustomsClearanceTime}
                initialEtaToOrigin={data.initialEtaToOrigin}
                distanceToOrigin={data.distanceToOrigin}
                durationOriginToDestination={data.durationOriginToDestination}
                originDetails={originDetails}
                destinationDetails={destinationDetails}
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
        disabledCompanyIds={announcedCompanyIds}
        onSelect={(companies) => {
          const update: Partial<Segment> = {
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

      {/* Chat Overlay for alert messages */}
      {data.driverId && (
        <ChatOverlay
          isOpen={chatHook.isChatOpen}
          onClose={() => chatHook.setIsChatOpen(false)}
          recipientName={data.driverName || t("segments.cardHeader.driver")}
          chatHook={chatHook}
          actionableAlerts={[]}
        />
      )}

      <MapSelectionModal
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onSelect={handleMapSelect}
        initialLatitude={
          mapSelectionType === "from"
            ? originLatitude !== undefined
              ? Number(originLatitude)
              : undefined
            : destinationLatitude !== undefined
            ? Number(destinationLatitude)
            : undefined
        }
        initialLongitude={
          mapSelectionType === "from"
            ? originLongitude !== undefined
              ? Number(originLongitude)
              : undefined
            : destinationLongitude !== undefined
            ? Number(destinationLongitude)
            : undefined
        }
      />
    </div>
  );
}

export default SegmentDetails;
