import type { PropsWithChildren } from "react";
import { cn } from "../../../../shared/utils/cn";
import avatar from "../../../../assets/images/avatar.png";
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
} from "lucide-react";

type NavigatingInfoProps = PropsWithChildren<{
  className?: string;
  selectedId?: string | null;
}>;

// Figma snapshot image URLs (used as static assets to match design)

const VEHICLE_OVERLAY =
  "http://localhost:3845/assets/65cc805484da3e9e7174da6ce649b827e18e363d.png";

export function NavigatingInfo({ className }: NavigatingInfoProps) {
  return (
    <section className="flex gap-4 p-4 bg-white rounded-[16px]">
      <div
        data-name="Navigating Info"
        className={cn(" w-1/2 flex flex-col gap-4", className)}
      >
        {/* Header: Driver name, rating, quick chat */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={avatar}
              alt="Driver avatar"
              className="size-7 rounded-full object-cover"
            />
            <p className="text-slate-900 font-medium">Xin Zhao</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-900">
              <span className="text-sm font-medium">4.5</span>
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
            <span className="text-[12px]">Turned their GPS on.</span>
          </div>
          <span className="text-[12px] text-slate-400">2m ago</span>
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
              <p className="text-[12px] text-slate-900">Cargo Truck HD320</p>
            </div>

            <div className="flex flex-col gap-3 px-1">
              <div className="flex items-center gap-2">
                <WeightIcon className="size-[14px] text-slate-300" />
                <span className="uppercase text-[10px] text-slate-400">
                  Weight
                </span>
              </div>
              <p className="text-[12px] text-slate-900">
                146.5 <span className="font-bold">KG</span>
              </p>
            </div>

            <div className="flex flex-col gap-3 px-1">
              <div className="flex items-center gap-2">
                <Building2Icon className="size-[14px] text-slate-300" />
                <span className="uppercase text-[10px] text-slate-400">
                  Local Company
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[12px] text-slate-900">Sendm Co.</p>
                <span className="inline-flex items-center justify-center p-1 rounded-full bg-blue-600">
                  <PlaneIcon className="size-3 text-white" />
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-1">
              <div className="flex items-center gap-2">
                <LocateFixedIcon className="size-[14px] text-slate-300" />
                <span className="uppercase text-[10px] text-slate-400">
                  Destination
                </span>
              </div>
              <p className="text-[12px] text-slate-900">Bratsk, Russia</p>
            </div>
          </div>

          {/* Right vehicle image with controls */}
        </div>
      </div>
      <div className=" relative h-auto max-h-[240px] w-1/2">
        <img
          src={VEHICLE_OVERLAY}
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
    </section>
  );
}

export default NavigatingInfo;
