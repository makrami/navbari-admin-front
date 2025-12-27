import type { CompanyReadDto } from "../../../services/company/company.service";
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
  X as XIcon,
  Check as CheckIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { STATUS_TO_COLOR, apiStatusToUiStatus, COMPANY_STATUS } from "../types";
import { getLogoUrl } from "../utils";
import { getCountryCode } from "../../../shared/utils/countryCode";
import { useChatWithRecipient } from "../../../shared/hooks/useChatWithRecipient";
import { ChatOverlay } from "../../../shared/components/ChatOverlay";
import { CHAT_RECIPIENT_TYPE } from "../../../services/chat/chat.types";
import { DEFAULT_ACTIONABLE_ALERTS } from "../../../shared/constants/actionableAlerts";
import { useTranslation } from "react-i18next";
import { Button } from "../../../shared/components/ui/Button";
import {
  useApproveCompany,
  useRejectCompany,
} from "../../../services/company/hooks";
import { useState } from "react";
import { useCurrentUser } from "../../../services/user/hooks";

type Props = {
  company: CompanyReadDto;
};

export function CompanyDetails({ company }: Props) {
  const { t } = useTranslation();
  const uiStatus = apiStatusToUiStatus(company.status);
  const colors = STATUS_TO_COLOR[uiStatus];
  const approveMutation = useApproveCompany();
  const rejectMutation = useRejectCompany();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { data: user } = useCurrentUser();

  // Get permissions array from user data
  const userRecord = user as Record<string, unknown> | undefined;
  const permissions = (userRecord?.permissions as string[] | undefined) || [];
  const hasCompaniesManage = permissions.includes("companies:manage");

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

  const handleApprove = () => {
    setShowApproveDialog(true);
  };

  const confirmApprove = async () => {
    try {
      await approveMutation.mutateAsync(company.id);
      setShowApproveDialog(false);
    } catch (error) {
      console.error("Failed to approve company:", error);
      alert("Failed to approve company. Please try again.");
    }
  };

  const handleReject = () => {
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: company.id,
        rejectionReason: rejectionReason.trim(),
      });
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject company:", error);
      alert("Failed to reject company. Please try again.");
    }
  };

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

      {/* Approve/Reject Buttons */}
      {company.status === COMPANY_STATUS.PENDING && hasCompaniesManage && (
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="!p-0 h-10 px-4 inline-flex flex-1 items-center gap-1.5 bg-green-600/20 hover:!bg-green-600/30 text-green-600 rounded-lg"
            onClick={handleApprove}
          >
            {t("localCompanies.page.card.approve")}
            <CheckIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-10 !p-0 px-4 inline-flex flex-1 items-center gap-1.5 bg-red-600/20 hover:!bg-red-600/30 text-red-600 rounded-lg"
            onClick={handleReject}
          >
            {t("localCompanies.page.card.reject")}
            <XIcon className="size-4" />
          </Button>
        </div>
      )}

      {/* Approve Dialog */}
      {showApproveDialog && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setShowApproveDialog(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckIcon className="size-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {t("localCompanies.page.details.approveModal.title")}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {t("localCompanies.page.details.approveModal.subtitle")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApproveDialog(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label={t("common.close")}
                >
                  <XIcon className="size-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-slate-700 mb-6">
                {t("localCompanies.page.details.approveModal.message", {
                  companyName: company.name,
                })}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowApproveDialog(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmApprove();
                  }}
                  disabled={approveMutation.isPending}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {approveMutation.isPending ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t("localCompanies.page.details.approveModal.approving")}
                    </>
                  ) : (
                    <>
                      <CheckIcon className="size-4" />
                      {t("localCompanies.page.details.approveModal.confirm")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setShowRejectDialog(false);
            setRejectionReason("");
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangleIcon className="size-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {t("localCompanies.page.details.rejectModal.title")}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {t("localCompanies.page.details.rejectModal.subtitle")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionReason("");
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label={t("common.close")}
                >
                  <XIcon className="size-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-slate-700 mb-4">
                {t("localCompanies.page.details.rejectModal.message", {
                  companyName: company.name,
                })}
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  e.stopPropagation();
                  setRejectionReason(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder={t(
                  "localCompanies.page.details.rejectModal.placeholder"
                )}
                className="w-full min-h-24 text-sm text-slate-900 rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all resize-none"
                rows={4}
              />
              {!rejectionReason.trim() && (
                <p className="text-xs text-red-600 mt-1">
                  {t("localCompanies.page.details.rejectModal.reasonRequired")}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRejectDialog(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmReject();
                  }}
                  disabled={!rejectionReason.trim() || rejectMutation.isPending}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {rejectMutation.isPending ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t("localCompanies.page.details.rejectModal.rejecting")}
                    </>
                  ) : (
                    <>
                      <XIcon className="size-4" />
                      {t("localCompanies.page.details.rejectModal.confirm")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
