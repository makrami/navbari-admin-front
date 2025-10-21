import {
  MinusIcon,
  PlusIcon,
  RefreshCcwIcon,
  Fullscreen,
  ChevronDownIcon,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
import worldmap from "../../../assets/images/worldmap.png";
export function MapSection() {
  const [selectedFilter] = useState("All");

  const legendItems = [
    {
      name: "Shipments",
      icon: (
        <div className=" p-3 rounded-lg bg-slate-50 flex items-center justify-center ">
          <div className="w-3 h-2 rounded bg-slate-500"></div>
        </div>
      ),
    },
    {
      name: "Drivers",
      icon: (
        <div className="p-3 rounded-lg bg-slate-50 flex items-center justify-center">
          <div className="size-2 rounded-full bg-slate-700"></div>
        </div>
      ),
    },
    {
      name: "Alerts",
      icon: (
        <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-center ">
          <AlertTriangle className="size-4 text-amber-600" />
        </div>
      ),
    },
    {
      name: "Finance",
      icon: (
        <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-center ">
          <DollarSign className="size-4 text-green-600" />
        </div>
      ),
    },
  ];

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden bg-white">
      {/* Map Background */}
      <div
        className="absolute top-5 left-5 right-5 bottom-5 bg-cover bg-center bg-no-repeat rounded-2xl "
        style={{
          backgroundImage: `url(${worldmap})`,
        }}
      />

      {/* Dropdown Button - Top Left */}
      <div className="absolute top-8 left-8 ">
        <button className="bg-white gap-10 rounded-xl px-4 py-2 duration-200 flex items-center ">
          <span className="text-slate-700 font-medium">{selectedFilter}</span>
          <ChevronDownIcon className="size-4 text-slate-600" />
        </button>
      </div>

      {/* Legend Card - Below Dropdown */}
      <div className="absolute bottom-8 left-8">
        <div className="bg-white rounded-xl p-3   duration-200">
          <div className="space-y-2">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-sm md:text-sm text-slate-900 font-medium">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zoom Controls - Right Side */}
      <div className="absolute top-8 right-8">
        <div className="bg-white rounded-xl duration-200 overflow-hidden">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 transition-colors duration-200">
            <PlusIcon />
          </button>
          <div className="border-t border-slate-200"></div>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 transition-colors duration-200">
            <MinusIcon />
          </button>
        </div>
      </div>

      {/* Refresh Button - Below Zoom Controls */}
      <div className="absolute top-30 right-8">
        <button className="w-10 h-10 bg-white rounded-full duration-200 flex items-center justify-center">
          <RefreshCcwIcon className="size-4 text-blue-600" />
        </button>
      </div>

      {/* Search Input - Bottom Center */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-6">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by Shipment, Drivers…"
            className="w-full bg-white rounded-xl pl-12 pr-4 py-3 shadow-lg hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Fullscreen Button - Bottom Right */}
      <div className="absolute bottom-8 right-8">
        <button className="w-10 h-10 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center">
          <Fullscreen className="size-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

export default MapSection;
