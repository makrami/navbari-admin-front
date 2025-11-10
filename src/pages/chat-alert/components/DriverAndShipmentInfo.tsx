import {
  MapPin,
  MessagesSquareIcon,
  Truck,
  BoxesIcon,
  WeightIcon,
  Target,
} from "lucide-react";
import { InfoCard } from "../../../shared/components/ui/InfoCard";
import CargoMap, { type Segment } from "../../../components/CargoMap";
import { MAPBOX_TOKEN } from "../../dashboard/constants";
import type { ChatAlert } from "../data";

interface DriverAndShipmentInfoProps {
  chatAlert: ChatAlert;
  mapSegments: Segment[];
  initialView: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

export function DriverAndShipmentInfo({
  chatAlert,
  mapSegments,
  initialView,
}: DriverAndShipmentInfoProps) {
  return (
    <div className="flex gap-4">
      {/* Left Column: Driver Info and Shipment Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Driver Information */}
        <div className="flex flex-col  gap-2">
          <div className="flex items-start gap-3">
            <img
              src={chatAlert.avatarUrl}
              alt={chatAlert.name}
              className="size-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <span className="text-sm font-semibold text-slate-900">
                  {chatAlert.name}
                </span>

                <button className="p-2 bg-[#1B54FE1A] rounded-lg flex items-center justify-center">
                  <MessagesSquareIcon className="size-4 text-[#1B54FE]" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-900 bg-slate-50 px-2 py-1 rounded-xl justify-between">
            <div className="flex items-center gap-6">
              <MapPin className="w-3 h-3" />
              <span>{chatAlert.status}</span>
            </div>
            <span className="text-xs !text-slate-400 !font-medium">
              {chatAlert.statusTime}
            </span>
          </div>
        </div>
        {/* Divider */}
        <div className="border-t border-slate-100"></div>

        {/* Shipment Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <InfoCard
            icon={<Truck className="size-4 text-slate-400" />}
            title="VEHICLE"
            value={chatAlert.vehicle}
          />
          <InfoCard
            icon={<BoxesIcon className="size-4 text-slate-400" />}
            title="LOCAL COMPANY"
            value={chatAlert.localCompany}
          />
          <InfoCard
            icon={<WeightIcon className="size-4 text-slate-400" />}
            title="WEIGHT"
            value={chatAlert.weight}
          />
          <InfoCard
            icon={<Target className="size-4 text-slate-400" />}
            title="DESTINATION"
            value={chatAlert.destination}
          />
        </div>
      </div>

      {/* Right Column: Map */}
      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-slate-200 overflow-hidden w-full h-[240px]">
          <CargoMap
            segments={mapSegments}
            initialView={initialView}
            mapboxToken={MAPBOX_TOKEN}
          />
        </div>
      </div>
    </div>
  );
}
