import type { Driver } from "../types";
import {
  Phone as PhoneIcon,
  Users as UsersIcon,
  Truck as TruckIcon,
  Calendar as CalendarIcon,
  ScanBarcode,
  Weight,
} from "lucide-react";
import { STATUS_TO_COLOR } from "../types";
import { formatDriverForEntityCard } from "../utils";
import { ENV } from "../../../lib/env";

type Props = {
  driver: Driver;
};

function getFileUrl(filePath: string | null | undefined): string | undefined {
  if (!filePath) return undefined;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `${ENV.FILE_BASE_URL}/${cleanPath}`;
}

export function DriverDetails({ driver }: Props) {
  const colors = STATUS_TO_COLOR[driver.status];
  const driverCard = formatDriverForEntityCard(driver);
  const driverName = driver.user?.fullName || "Unknown Driver";
  const phone = driver.user?.phoneNumber || "N/A";

  const statusDotColor =
    driver.status === "approved"
      ? "bg-green-500"
      : driver.status === "pending"
      ? "bg-amber-500"
      : driver.status === "rejected"
      ? "bg-rose-500"
      : "bg-slate-500";

  const joinDate = driver.createdAt
    ? new Date(driver.createdAt).toLocaleDateString()
    : "N/A";

  return (
    <section className="bg-white rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-24 w-24 rounded-full bg-slate-50 overflow-hidden grid place-items-center">
            {driver.avatarUrl ? (
              <img
                src={getFileUrl(driver.avatarUrl)}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-slate-200" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-slate-900 font-bold text-xl leading-none truncate">
                {driverName}
              </p>
              {/* <PencilIcon className="size-4 text-slate-400" /> */}
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-900">
              {driver.company.logoUrl && (
                <img
                  src={getFileUrl(driver.company.logoUrl)}
                  alt="Company Logo"
                  className=" h-4 w-7 rounded object-cover"
                />
              )}
              <span className="flex items-center gap-1 font-bold">
                {driver.company.name}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-6 text-xs text-slate-900">
              <div className="flex items-center gap-2">
                <PhoneIcon className="size-3.5 text-slate-400" />
                <span> {phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-3.5 text-slate-400" />
                <span>Register: {joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status & Stats */}
        <div className="flex flex-col gap-2 items-center justify-center min-w-[8.75rem]">
          <div
            className={`inline-flex items-center gap-2 rounded-lg px-2 py-2 w-full justify-center ${colors.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor}`} />
            <span className={`text-xs ${colors.pillText}`}>
              {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 w-full justify-center bg-blue-600/10">
            <UsersIcon className="size-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">
              {driver.totalDeliveries || 0}
            </span>
            <span className="text-xs text-blue-600">Shipments</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 w-full justify-center bg-blue-600/10">
            <TruckIcon className="size-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">
              {driverCard.numActiveVehicles}
            </span>
            <span className="text-xs text-blue-600">Vehicles</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Bottom contacts */}
      <div className="flex items-center gap-4 text-xs text-slate-900">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1 min-w-[7.5rem]">
            <p className="text-slate-400 flex items-center gap-2 font-semibold">
              <TruckIcon className="size-4  text-slate-400" />
              VEHICLE
            </p>

            <p>
              {driver.vehicleType
                ? driver.vehicleType.charAt(0).toUpperCase() +
                  driver.vehicleType.slice(1)
                : ""}
            </p>
          </div>

          <div className="h-10 border-l border-slate-200" />

          <div className="flex flex-col gap-1 min-w-[7.5rem]">
            <p className="text-slate-400 flex items-center gap-2 font-semibold">
              <ScanBarcode className="size-4  text-slate-400" />
              PLATE NUMBER
            </p>

            <p>{driver.vehiclePlate}</p>
          </div>

          <div className="h-10 border-l border-slate-200" />

          <div className="flex flex-col gap-1 min-w-[7.5rem]">
            <p className="text-slate-400 flex items-center gap-2 font-semibold">
              <Weight className="size-4  text-slate-400" />
              CAPACITY
            </p>

            <p>{(driver.vehicleCapacity / 1000).toFixed(2)} Tons</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DriverDetails;
