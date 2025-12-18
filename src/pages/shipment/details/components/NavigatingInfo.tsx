import type {PropsWithChildren} from "react";
import {useEffect, useRef, useState, useMemo} from "react";
import {cn} from "../../../../shared/utils/cn";
import {
  MapPinIcon,
  MessagesSquareIcon,
  CarIcon,
  Building2Icon,
  WeightIcon,
  LocateFixedIcon,
  PlusIcon,
  MinusIcon,
  PlaneIcon,
  UserRoundIcon,
  BellIcon,
  XIcon,
  Check,
  Paperclip,
  ListCheck,
} from "lucide-react";
import {type MapRef} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {MAPBOX_TOKEN} from "../../../dashboard/constants";
import type {Segment} from "../../../../shared/types/segmentData";
import {useChatWithRecipient} from "../../../../shared/hooks/useChatWithRecipient";
import {ChatOverlay} from "../../../../shared/components/ChatOverlay";
import {DriverInfo} from "../../../../shared/components/DriverInfo";
import {CHAT_RECIPIENT_TYPE} from "../../../../services/chat/chat.types";
import type {ActionableAlertChip} from "../../../chat-alert/types/chat";
import {useTranslation} from "react-i18next";

type NavigatingInfoProps = PropsWithChildren<{
  segments: Segment[];
  driverId: string;
  className?: string;
  title: string;
  shipmentId: string;
  driverName: string;
  driverPhoto?: string; // Optional - if not provided, show user icon
  vehicle: string;
  weight: string;
  localCompany: string;
  destination: string;
  lastActivity: string;
  lastActivityTime: string;
  onClose?: () => void;
}>;

// Figma snapshot image URLs (used as static assets to match design)

import avatarImg from "../../../../assets/images/avatar.png";
import {getFileUrl} from "../../../LocalCompanies/utils";
import CargoMap from "../../../../components/CargoMap";
import {getCountryCode} from "../../../../shared/utils/countryCode";
import ReactCountryFlag from "react-country-flag";

const ACTIONABLE_ALERTS: ActionableAlertChip[] = [
  {id: "1", label: "GPS Lost", alertType: "alert"},
  {id: "2", label: "Delay Expected", alertType: "warning"},
  {id: "3", label: "Route Cleared", alertType: "success"},
  {id: "4", label: "Documentation Pending", alertType: "info"},
];

export function NavigatingInfo({
  segments,
  driverId,
  className,
  title,
  shipmentId,
  driverName,
  driverPhoto,
  vehicle,
  weight,
  localCompany,
  destination,
  lastActivity,
  lastActivityTime,
  onClose,
}: NavigatingInfoProps) {
  const {t} = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  // Use the reusable chat hook
  const chatHook = useChatWithRecipient({
    recipientType: CHAT_RECIPIENT_TYPE.DRIVER,
    driverId: driverId || undefined,
    recipientName: driverName || t("shipment.navigatingInfo.driver"),
  });

  // Default map viewport (can be updated with actual coordinates if available)
  const [viewport] = useState({
    longitude: 116.4074, // Beijing, China (default)
    latitude: 39.9042,
    zoom: 10,
  });
  // Show details if we have a shipment selected (title and shipmentId are required props)
  // This ensures the details section always shows when a shipment is selected
  const hasDetails = Boolean(title && shipmentId);

  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const notifications = useMemo(
    () => [
      {
        id: 1,
        time: "13:04",
        actor: "Oni Chan",
        text: t("shipment.navigatingInfo.turnedGpsOn"),
        highlight: true,
      },
      {
        id: 2,
        time: "12:56",
        actor: t("shipment.navigatingInfo.driverChangedFrom"),
        text: "Xin Zhao " + t("shipment.navigatingInfo.to") + " Oni Chan",
        highlight: true,
        isChange: true,
      },
      {
        id: 3,
        time: "11:58",
        actor: "Xin Zhao",
        text: t("shipment.navigatingInfo.turnedGpsOff"),
        highlight: true,
      },
      {
        id: 4,
        time: "11:04",
        actor: "Oni Chan",
        text: t("shipment.navigatingInfo.uploaded"),
        link: "photo_616512026.jpg",
        highlight: false,
      },
    ],
    [t]
  );

  return (
    <section className="flex flex-col   gap-4 p-4 bg-white rounded-[16px]">
      <div
        className="flex items-center justify-between w-full"
        data-name="Shipment Header"
      >
        <div className="flex flex-col gap-1 min-w-px" data-name="Shipment Info">
          <p className="text-slate-900 font-semibold text-xs leading-none">
            {title}
          </p>
          <p className="text-slate-400 text-xs leading-none">{shipmentId}</p>
        </div>

        <div className="relative flex items-center gap-2" ref={notifRef}>
          {/* Icon buttons (outline, subtle) */}

          <button
            type="button"
            onClick={() => driverId && chatHook.setIsChatOpen(true)}
            disabled={!driverId}
            className={cn(
              "bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto relative",
              !driverId && "opacity-50 cursor-not-allowed"
            )}
            aria-label={t("shipment.navigatingInfo.chat")}
          >
            <MessagesSquareIcon className="block size-5 text-slate-400" />
          </button>
          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto relative"
            aria-label={t("shipment.navigatingInfo.notifications")}
            aria-expanded={showNotifications}
            aria-haspopup="menu"
            onClick={() => setShowNotifications((v) => !v)}
          >
            <BellIcon className="block size-5 text-slate-400" />
            <span className="absolute -top-0 -left-0 block size-[6px] rounded-full bg-red-500" />
          </button>
          {showNotifications ? (
            <div
              role="menu"
              className="absolute right-0 top-12 z-50 w-[520px] rounded-[12px] bg-white shadow-lg border border-slate-200 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">
                  {t("shipment.navigatingInfo.notifications")}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-[8px] border border-slate-200 bg-white size-7 text-slate-400 hover:text-slate-600"
                    aria-label={t("shipment.navigatingInfo.filter")}
                  >
                    <ListCheck className="size-4" />
                  </button>
                </div>
              </div>
              <ul className="max-h-[360px] overflow-auto px-1 py-2">
                {notifications.map((n) => (
                  <li key={n.id} className="px-2 py-1">
                    <div
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-[10px] px-3 py-2",
                        n.highlight ? "bg-amber-50" : "bg-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-[2px] shrink-0">
                          {n.time}
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-flex items-center justify-center rounded-full bg-slate-200 size-5 overflow-hidden">
                            <img
                              src={avatarImg}
                              alt=""
                              className="block size-full object-cover"
                            />
                          </span>
                          {n.isChange ? (
                            <div className="flex items-center gap-2 min-w-0 text-[13px]">
                              <span className="text-slate-700">
                                {t("shipment.navigatingInfo.driverChangedFrom")}
                              </span>
                              <span className="inline-flex items-center gap-1 min-w-0">
                                <span className="inline-flex items-center justify-center rounded-full bg-slate-200 size-5 overflow-hidden">
                                  <img
                                    src={avatarImg}
                                    alt=""
                                    className="block size-full object-cover"
                                  />
                                </span>
                                <span className="font-semibold text-amber-700">
                                  Xin Zhao
                                </span>
                              </span>
                              <span className="text-slate-400">
                                {t("shipment.navigatingInfo.to")}
                              </span>
                              <span className="font-semibold text-amber-700">
                                Oni Chan
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 min-w-0 text-[13px]">
                              <span className="font-semibold text-amber-700 truncate">
                                {n.actor}
                              </span>
                              <span className="text-slate-700 truncate">
                                {n.text}
                              </span>
                              {n.link ? (
                                <span className="inline-flex items-center gap-1 text-blue-600 truncate">
                                  <Paperclip className="size-4" />
                                  <a href="#" className="underline truncate">
                                    {n.link}
                                  </a>
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                      <Check className="size-4 text-slate-300 shrink-0" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <button
            type="button"
            className="bg-red-500/10 hover:scale-105 transition-all duration-300 rounded-[8px] p-2 size-auto"
            aria-label={t("shipment.navigatingInfo.close")}
            onClick={onClose}
          >
            <XIcon className="block size-5 text-red-500" />
          </button>
        </div>
      </div>
      {hasDetails ? (
        <div className="flex gap-4">
          <div
            data-name="Navigating Info"
            className={cn(" w-1/2 flex flex-col gap-4", className)}
          >
            {/* Shipment Header */}

            {/* Header: Driver name, rating, quick chat */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4 min-w-0">
                {driverName ? (
                  <DriverInfo
                    driverName={driverName}
                    driverAvatarUrl={driverPhoto}
                    driverRating={
                      segments.find((s) => s.driverName === driverName)
                        ?.driverRating ?? null
                    }
                    avatarSize="lg"
                    nameClassName="text-slate-900 font-medium"
                    showRating={true}
                    className="gap-4"
                  />
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="size-7 rounded-full bg-slate-200 flex items-center justify-center">
                      <UserRoundIcon className="size-4 text-slate-500" />
                    </div>
                    <p className="text-slate-900 font-medium">
                      {t("shipment.navigatingInfo.notAssigned")}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => driverId && chatHook.setIsChatOpen(true)}
                  disabled={!driverId}
                  aria-label={t("shipment.navigatingInfo.openChat")}
                  className={cn(
                    "bg-blue-100 text-blue-600 rounded-[8px] p-2 hover:scale-105 transition-transform relative",
                    !driverId && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <MessagesSquareIcon className="size-4" />
                  {(() => {
                    const unreadCount =
                      (chatHook.conversation?.unreadMessageCount ?? 0) +
                      (chatHook.conversation?.unreadAlertCount ?? 0);
                    if (unreadCount > 0) {
                      return (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full border-2 border-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </button>
              </div>
            </div>

            {/* Activity chip */}
            <div className="bg-slate-50 rounded-[8px] px-3 py-[6px] flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <MapPinIcon className="size-[14px] text-slate-400" />
                <span className="text-[12px]">{lastActivity}</span>
              </div>
              <span className="text-[12px] text-slate-400">
                {lastActivityTime}
              </span>
            </div>

            <div className="border-t border-slate-200" />

            {/* Content: left details + right image */}
            <div className="grid gap-4 md:grid-cols-[1fr,320px] items-start">
              {/* Left info columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <CarIcon className="size-[14px] text-slate-300" />
                    <span className="uppercase text-[10px] text-slate-400">
                      {t("shipment.navigatingInfo.vehicle")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-900">
                    {vehicle || t("shipment.navigatingInfo.notAssigned")}
                  </p>
                </div>

                <div className="flex flex-col gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <Building2Icon className="size-[14px] text-slate-300" />
                    <span className="uppercase text-[10px] text-slate-400">
                      {t("shipment.navigatingInfo.localCompany")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-900">
                      {localCompany || t("shipment.navigatingInfo.nA")}
                    </p>
                    <span className="inline-flex items-center justify-center p-1 rounded-full bg-blue-600">
                      <PlaneIcon className="size-3 text-white" />
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <WeightIcon className="size-[14px] text-slate-300" />
                    <span className="uppercase text-[10px] text-slate-400">
                      {t("shipment.navigatingInfo.weight")}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-900">
                    {(() => {
                      // Extract numeric value from weight string (handles "146.5 KG", "146.5", etc.)
                      const numericValue = parseFloat(
                        weight.replace(/[^0-9.]/g, "")
                      );
                      if (isNaN(numericValue))
                        return `0 ${t("shipment.navigatingInfo.tons")}`;
                      // Convert from kilograms to tons (1 ton = 1000 kg)
                      const tons = numericValue / 1000;
                      // Format to 2 decimal places, remove trailing zeros
                      return `${tons.toFixed(2).replace(/\.?0+$/, "")} ${t(
                        "shipment.navigatingInfo.tons"
                      )}`;
                    })()}
                  </p>
                </div>
                <div className="flex flex-col gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <LocateFixedIcon className="size-[14px] text-slate-300" />
                    <span className="uppercase text-[10px] text-slate-400">
                      {t("shipment.navigatingInfo.destination")}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-900">
                    <ReactCountryFlag
                      className="mr-1 mb-1"
                      svg
                      countryCode={getCountryCode(destination.split(", ")[1])}
                      style={{width: 16, borderRadius: 2}}
                    />
                    {destination}
                  </p>
                </div>
              </div>

              {/* Right vehicle image with controls */}
            </div>
          </div>
          <div className="relative h-auto max-h-[240px] w-1/2 rounded-2xl overflow-hidden">
            <CargoMap
              segmentIds={segments
                .filter(
                  (segment) => segment.originCity && segment.destinationCity
                )
                .map((segment) => ({
                  id: segment.id,
                  currentLatitude: segment.currentLatitude ?? 0,
                  currentLongitude: segment.currentLongitude ?? 0,
                }))
                .filter(
                  (
                    segment
                  ): segment is {
                    id: string;
                    currentLatitude: number;
                    currentLongitude: number;
                  } => !!segment
                )}
              initialView={viewport}
              mapboxToken={MAPBOX_TOKEN}
            />

            {/* Zoom & locate controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 w-[30px] z-10">
              <div className="flex flex-col overflow-hidden rounded-[8px] shadow-sm">
                <button
                  className="bg-white p-2 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    mapRef.current?.zoomIn({duration: 300});
                  }}
                >
                  <PlusIcon className="size-[14px] text-slate-500" />
                </button>
                <button
                  className="bg-white border-t border-slate-300 p-2 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    mapRef.current?.zoomOut({duration: 300});
                  }}
                >
                  <MinusIcon className="size-[14px] text-slate-500" />
                </button>
              </div>
              <button
                className="bg-white rounded-[8px] p-2 hover:bg-slate-50 transition-colors"
                onClick={() => {
                  if (mapRef.current) {
                    // Reset to initial viewport
                    mapRef.current.flyTo({
                      center: [viewport.longitude, viewport.latitude],
                      zoom: viewport.zoom,
                      duration: 1000,
                    });
                  }
                }}
              >
                <LocateFixedIcon className="size-[14px] text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Chat Overlay */}
      {driverId && (
        <ChatOverlay
          isOpen={chatHook.isChatOpen}
          onClose={() => chatHook.setIsChatOpen(false)}
          recipientName={driverName || t("shipment.navigatingInfo.driver")}
          chatHook={chatHook}
          actionableAlerts={ACTIONABLE_ALERTS}
        />
      )}
    </section>
  );
}

export default NavigatingInfo;
