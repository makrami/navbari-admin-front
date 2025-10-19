import type { Company } from "../types";
import ReactCountryFlag from "react-country-flag";
import {
  Phone as PhoneIcon,
  Users as UsersIcon,
  Truck as TruckIcon,
  User as UserIcon,
  Calendar as CalendarIcon,
  Plus as PlusIcon,
  Pencil as PencilIcon,
} from "lucide-react";
import { STATUS_TO_COLOR } from "../types";

type Props = {
  company: Company;
};

export function CompanyDetails({ company }: Props) {
  const colors = STATUS_TO_COLOR[company.status];

  const statusDotColor =
    company.status === "active"
      ? "bg-green-500"
      : company.status === "pending"
      ? "bg-amber-500"
      : company.status === "rejected"
      ? "bg-rose-500"
      : "bg-slate-500";

  return (
    <section className="bg-white rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Logo + Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-24 w-24 rounded-lg bg-slate-50 overflow-hidden grid place-items-center">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="logo" className="max-h-14" />
            ) : (
              <div className="h-10 w-10 rounded bg-slate-200" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-slate-900 font-bold text-xl leading-none truncate">
                {company.name}
              </p>
              <PencilIcon className="size-4 text-slate-400" />
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-900">
              <ReactCountryFlag
                svg
                countryCode={company.countryCode}
                className=" text-2xl"
              />
              <span className="flex items-center gap-1 font-bold">
                {company.country} <span>/</span>
                <span className="font-normal">{company.city}</span>
              </span>
            </div>

            <div className="mt-2 flex items-center gap-6 text-xs text-slate-900">
              <div className="flex items-center gap-2">
                <UserIcon className="size-3.5 text-slate-400" />
                <span>{company.managerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-3.5 text-slate-400" />
                <span>Register: 2023-10-26</span>
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
              {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 w-full justify-center bg-blue-600/10">
            <UsersIcon className="size-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">
              {company.numDrivers}
            </span>
            <span className="text-xs text-blue-600">Drivers</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 w-full justify-center bg-blue-600/10">
            <TruckIcon className="size-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">
              {company.numActiveVehicles}
            </span>
            <span className="text-xs text-blue-600">Shipments</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Bottom contacts */}
      <div className="flex items-center gap-4 text-xs text-slate-900">
        <PhoneIcon className="size-6 text-slate-400" />

        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1 min-w-[7.5rem]">
            <p className="text-slate-400 font-semibold">Manager</p>
            <p>{company.phone}</p>
          </div>

          <div className="h-10 border-l border-slate-200" />

          <div className="flex flex-col gap-1 min-w-[7.5rem]">
            <p className="text-slate-400 font-semibold">Coordinator</p>
            <p>{company.phone}</p>
          </div>

          <div className="h-10 border-l border-slate-200" />

          <div className="flex flex-col gap-1 min-w-[7.5rem]">
            <p className="text-slate-400 font-semibold">Sales Manager</p>
            <p>{company.phone}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="bg-white border border-slate-200 rounded-lg p-2"
          >
            <PlusIcon className="size-5 text-slate-400" />
          </button>
          <button
            type="button"
            className="bg-white border border-slate-200 rounded-lg p-2"
          >
            <PencilIcon className="size-5 text-slate-400" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default CompanyDetails;
