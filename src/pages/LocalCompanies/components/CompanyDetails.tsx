import type {CompanyReadDto} from "../../../services/company/company.service";
import ReactCountryFlag from "react-country-flag";
import {
  Phone as PhoneIcon,
  Users as UsersIcon,
  Truck as TruckIcon,
  User as UserIcon,
  Calendar as CalendarIcon,
  Pencil as PencilIcon,
  Mail as MailIcon,
  Plus as PlusIcon,
  PencilLine,
  MessagesSquareIcon,
} from "lucide-react";
import {STATUS_TO_COLOR, apiStatusToUiStatus} from "../types";
import {getLogoUrl} from "../utils";
import {getCountryCode} from "../../../shared/utils/countryCode";
import {useChatWithRecipient} from "../../../shared/hooks/useChatWithRecipient";
import {ChatOverlay} from "../../../shared/components/ChatOverlay";
import {CHAT_RECIPIENT_TYPE} from "../../../services/chat/chat.types";
import {DEFAULT_ACTIONABLE_ALERTS} from "../../../shared/constants/actionableAlerts";
import {useTranslation} from "react-i18next";

type Props = {
  company: CompanyReadDto;
};

export function CompanyDetails({company}: Props) {
  const {t} = useTranslation();
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

  // Use the reusable chat hook
  const chatHook = useChatWithRecipient({
    recipientType: CHAT_RECIPIENT_TYPE.COMPANY,
    companyId: company.id,
    recipientName: company.name,
  });

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
              <button
                type="button"
                onClick={() => chatHook.setIsChatOpen(true)}
                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                aria-label={t("localCompanies.page.details.openChat")}
              >
                <MessagesSquareIcon className="size-4 text-blue-600" />
              </button>
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
                  {t("localCompanies.page.details.register")}:{" "}
                  {new Date(company.createdAt).toLocaleDateString()}
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
              {t(`localCompanies.page.status.${uiStatus}`)}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 w-full justify-center bg-blue-600/10">
            <UsersIcon className="size-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">
              {company.totalDrivers ?? 0}
            </span>
            <span className="text-xs text-blue-600">
              {t("localCompanies.page.details.drivers")}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 w-full justify-center bg-blue-600/10">
            <TruckIcon className="size-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">
              {company.totalSegments ?? 0}
            </span>
            <span className="text-xs text-blue-600">
              {t("localCompanies.page.details.segments")}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Contact Information */}
      <div className="space-y-3 flex">
        <div className="flex items-center gap-4 text-xs text-slate-900">
          <PhoneIcon className="size-5 text-slate-400" />
          <div className="flex flex-col gap-1">
            <p className="text-slate-400 font-semibold">
              {t("localCompanies.page.details.phone")}
            </p>
            <p className="text-xs text-slate-900">{company.phone}</p>
          </div>
        </div>
        <div className="w-px bg-slate-200 mx-6" />
        <div className="flex items-center gap-4 text-xs text-slate-900">
          <MailIcon className="size-5 text-slate-400" />
          <div className="flex flex-col gap-1">
            <p className="text-slate-400 font-semibold">
              {t("localCompanies.page.details.email")}
            </p>
            <p className="text-xs text-slate-900">{company.email}</p>
          </div>
        </div>
        <div className="w-px bg-slate-200 mx-6" />
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors"
            aria-label={t("localCompanies.page.details.add")}
          >
            <PlusIcon className="size-5 text-slate-400" />
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors"
            aria-label={t("localCompanies.page.details.edit")}
          >
            <PencilLine className="size-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Chat Overlay */}
      <ChatOverlay
        isOpen={chatHook.isChatOpen}
        onClose={() => chatHook.setIsChatOpen(false)}
        recipientName={company.name}
        chatHook={chatHook}
        actionableAlerts={DEFAULT_ACTIONABLE_ALERTS}
      />
    </section>
  );
}

export default CompanyDetails;
