import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../../../shared/utils/cn";
import {
  MapPinIcon,
  MessagesSquareIcon,
  StarIcon,
  CarIcon,
  Building2Icon,
  WeightIcon,
  LocateFixedIcon,
  PlusIcon,
  MinusIcon,
  PlaneIcon,
  UserRoundIcon,
  DollarSignIcon,
  TimerIcon,
  MapIcon,
  BellIcon,
  XIcon,
  Check,
  Paperclip,
  ListCheck,
} from "lucide-react";

type NavigatingInfoProps = PropsWithChildren<{
  className?: string;
  title?: string;
  shipmentId?: string;
  driverName: string;
  driverPhoto?: string; // Optional - if not provided, show user icon
  rating: number;
  vehicle: string;
  weight: string;
  localCompany: string;
  destination: string;
  lastActivity: string;
  lastActivityTime: string;
  onClose?: () => void;
}>;

// Figma snapshot image URLs (used as static assets to match design)

import navigatemap from "../../../../assets/images/navigatemap.png";
import avatarImg from "../../../../assets/images/avatar.png";
export function NavigatingInfo({
  className,
  title = "Electronic Shipment n.21",
  shipmentId = "#6c23m68",
  driverName,
  driverPhoto,
  rating,
  vehicle,
  weight,
  localCompany,
  destination,
  lastActivity,
  lastActivityTime,
  onClose,
}: NavigatingInfoProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const hasDetails = Boolean(
    (driverName && driverName.trim()) ||
      (vehicle && vehicle.trim()) ||
      (weight && weight.trim()) ||
      (localCompany && localCompany.trim()) ||
      (destination && destination.trim()) ||
      (lastActivity && lastActivity.trim())
  );

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

  const notifications = [
    {
      id: 1,
      time: "13:04",
      actor: "Oni Chan",
      text: "Turned their GPS on.",
      highlight: true,
    },
    {
      id: 2,
      time: "12:56",
      actor: "Driver changed from",
      text: "Xin Zhao to Oni Chan",
      highlight: true,
      isChange: true,
    },
    {
      id: 3,
      time: "11:58",
      actor: "Xin Zhao",
      text: "Turned their GPS off.",
      highlight: true,
    },
    {
      id: 4,
      time: "11:04",
      actor: "Oni Chan",
      text: "Uploaded",
      link: "photo_616512026.jpg",
      highlight: false,
    },
  ];
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
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto"
            aria-label="Pricing"
          >
            <DollarSignIcon className="block size-5 text-slate-400" />
          </button>
          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto"
            aria-label="Time"
          >
            <TimerIcon className="block size-5 text-slate-400" />
          </button>
          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto"
            aria-label="Map"
          >
            <MapIcon className="block size-5 text-slate-400" />
          </button>

          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto relative"
            aria-label="Chat"
          >
            <MessagesSquareIcon className="block size-5 text-slate-400" />
          </button>
          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto relative"
            aria-label="Notifications"
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
                  Notifications
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-[8px] border border-slate-200 bg-white size-7 text-slate-400 hover:text-slate-600"
                    aria-label="Filter"
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
                        <span className="text-[12px] text-slate-500 bg-slate-100 rounded-full px-2 py-[2px] shrink-0">
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
                                Driver changed from
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
                              <span className="text-slate-400">to</span>
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
            aria-label="Close"
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
                {driverPhoto ? (
                  <img
                    src={driverPhoto}
                    alt="Driver avatar"
                    className="size-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-7 rounded-full bg-slate-200 flex items-center justify-center">
                    <UserRoundIcon className="size-4 text-slate-500" />
                  </div>
                )}
                <p className="text-slate-900 font-medium">{driverName}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-slate-900">
                  <span className="text-sm font-medium">
                    {rating.toFixed(1)}
                  </span>
                  <StarIcon className="size-4 text-yellow-500 fill-yellow-500" />
                </div>
                <button
                  type="button"
                  aria-label="Open chat"
                  className="bg-blue-100 text-blue-600 rounded-[8px] p-2 hover:scale-105 transition-transform"
                >
                  <MessagesSquareIcon className="size-4" />
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
                      Vehicle
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-900">{vehicle}</p>
                </div>

                <div className="flex flex-col gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <Building2Icon className="size-[14px] text-slate-300" />
                    <span className="uppercase text-[10px] text-slate-400">
                      Local Company
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] text-slate-900">{localCompany}</p>
                    <span className="inline-flex items-center justify-center p-1 rounded-full bg-blue-600">
                      <PlaneIcon className="size-3 text-white" />
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <WeightIcon className="size-[14px] text-slate-300" />
                    <span className="uppercase text-[10px] text-slate-400">
                      Weight
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-900">{weight}</p>
                </div>
                <div className="flex flex-col gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <LocateFixedIcon className="size-[14px] text-slate-300" />
                    <span className="uppercase text-[10px] text-slate-400">
                      Destination
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-900">{destination}</p>
                </div>
              </div>

              {/* Right vehicle image with controls */}
            </div>
          </div>
          <div className=" relative h-auto max-h-[240px] w-1/2">
            <img
              src={navigatemap}
              alt="Overlay"
              className="size-full object-cover rounded-2xl"
            />

            {/* Zoom & locate controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 w-[30px]">
              <div className="flex flex-col overflow-hidden rounded-[8px] shadow-sm">
                <button className="bg-white p-2">
                  <PlusIcon className="size-[14px] text-slate-500" />
                </button>
                <button className="bg-white border-t border-slate-300 p-2">
                  <MinusIcon className="size-[14px] text-slate-500" />
                </button>
              </div>
              <button className="bg-white rounded-[8px] p-2">
                <LocateFixedIcon className="size-[14px] text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default NavigatingInfo;
