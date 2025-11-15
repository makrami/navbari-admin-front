import type { CompanyReadDto } from "../../../services/company/company.service";
import ReactCountryFlag from "react-country-flag";
import {
  Phone as PhoneIcon,
  Users as UsersIcon,
  Truck as TruckIcon,
  User as UserIcon,
  Calendar as CalendarIcon,
  Pencil as PencilIcon,
  Globe as GlobeIcon,
  Mail as MailIcon,
  MapPin as MapPinIcon,
} from "lucide-react";
import { STATUS_TO_COLOR, apiStatusToUiStatus } from "../types";
import { getCountryCode, getLogoUrl } from "../utils";

type Props = {
  company: CompanyReadDto;
};

export function CompanyDetails({ company }: Props) {
  const uiStatus = apiStatusToUiStatus(company.status);
  const colors = STATUS_TO_COLOR[uiStatus];

  const statusDotColor =
    uiStatus === "active"
      ? "bg-green-500"
      : uiStatus === "pending"
      ? "bg-amber-500"
      : uiStatus === "rejected"
      ? "bg-rose-500"
      : "bg-slate-500";

  const countryCode = getCountryCode(company.country);
  const city = company.address?.split(",")[0]?.trim() || company.country;

  return (
    <section className="bg-white rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Logo + Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-24 w-24 rounded-lg bg-slate-50 overflow-hidden grid place-items-center">
            {getLogoUrl(company.logoUrl) ? (
              <img
                src={getLogoUrl(company.logoUrl)}
                alt="logo"
                className="max-h-14"
              />
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
                countryCode={countryCode}
                className=" text-2xl"
              />
              <span className="flex items-center gap-1 font-bold">
                {company.country} <span>/</span>
                <span className="font-normal">{city}</span>
              </span>
            </div>

            <div className="mt-2 flex items-center gap-6 text-xs text-slate-900">
              <div className="flex items-center gap-2">
                <UserIcon className="size-3.5 text-slate-400" />
                <span>{company.primaryContactFullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-3.5 text-slate-400" />
                <span>
                  Register: {new Date(company.createdAt).toLocaleDateString()}
                </span>
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
              {uiStatus.charAt(0).toUpperCase() + uiStatus.slice(1)}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 w-full justify-center bg-blue-600/10">
            <UsersIcon className="size-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">
              {company.totalDrivers ?? 0}
            </span>
            <span className="text-xs text-blue-600">Drivers</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 w-full justify-center bg-blue-600/10">
            <TruckIcon className="size-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">
              {company.totalSegments ?? 0}
            </span>
            <span className="text-xs text-blue-600">Segments</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Contact Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-4 text-xs text-slate-900">
          <PhoneIcon className="size-5 text-slate-400" />
          <div className="flex flex-col gap-1">
            <p className="text-slate-400 font-semibold">Phone</p>
            <p>{company.phone}</p>
          </div>
        </div>

        {company.email && (
          <div className="flex items-center gap-4 text-xs text-slate-900">
            <MailIcon className="size-5 text-slate-400" />
            <div className="flex flex-col gap-1">
              <p className="text-slate-400 font-semibold">Email</p>
              <p>{company.email}</p>
            </div>
          </div>
        )}

        {company.website && (
          <div className="flex items-center gap-4 text-xs text-slate-900">
            <GlobeIcon className="size-5 text-slate-400" />
            <div className="flex flex-col gap-1">
              <p className="text-slate-400 font-semibold">Website</p>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {company.website}
              </a>
            </div>
          </div>
        )}

        {company.address && (
          <div className="flex items-center gap-4 text-xs text-slate-900">
            <MapPinIcon className="size-5 text-slate-400" />
            <div className="flex flex-col gap-1">
              <p className="text-slate-400 font-semibold">Address</p>
              <p>{company.address}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-900">
          <UserIcon className="size-5 text-slate-400" />
          <div className="flex flex-col gap-1">
            <p className="text-slate-400 font-semibold">Primary Contact</p>
            <p>{company.primaryContactFullName}</p>
            <p className="text-slate-500">{company.primaryContactEmail}</p>
            <p className="text-slate-500">
              {company.primaryContactPhoneNumber}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CompanyDetails;
