import {Button} from "../../../shared/components/ui/Button";
import type {Company} from "../types";
import {cn} from "../../../shared/utils/cn";
import {
  User as UserIcon,
  Users as UsersIcon,
  Truck as TruckIcon,
  Clock as ClockIcon,
  Phone as PhoneIcon,
  X as XIcon,
  Check as CheckIcon,
  AlertTriangleIcon,
} from "lucide-react";
import {getFileUrl} from "../utils";
import {
  useApproveCompany,
  useRejectCompany,
} from "../../../services/company/hooks";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {apiStatusToUiStatus, STATUS_TO_COLOR} from "../types";
import {COMPANY_STATUS} from "../../../services/company/company.service";
import {useCurrentUser} from "../../../services/user/hooks";

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
      />
      <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
    </svg>
  );
}

type Props = {
  company: Company;
  selected?: boolean;
  className?: string;
  onView?: (id: string) => void;
};

export function CompanyCard({
  company,
  selected = false,
  className,
  onView,
}: Props) {
  const approveMutation = useApproveCompany();
  const rejectMutation = useRejectCompany();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const {data: user} = useCurrentUser();

  // Get permissions array from user data
  const userRecord = user as Record<string, unknown> | undefined;
  const permissions = (userRecord?.permissions as string[] | undefined) || [];
  const hasCompaniesManage = permissions.includes("companies:manage");

  const handleApprove = async () => {
    if (window.confirm(`Are you sure you want to approve "${company.name}"?`)) {
      try {
        await approveMutation.mutateAsync(company.id);
      } catch (error) {
        console.error("Failed to approve company:", error);
        alert("Failed to approve company. Please try again.");
      }
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
  const {t} = useTranslation();
  const uiStatus = apiStatusToUiStatus(company.status);
  const statusColors = STATUS_TO_COLOR[uiStatus];
  return (
    <div
      dir="ltr"
      className={cn(
        "relative overflow-hidden p-2 rounded-2xl transition-shadow",
        selected ? "bg-[#1b54fe] text-white shadow" : "bg-white",
        onView && "cursor-pointer hover:shadow-md",
        className
      )}
      aria-pressed={selected}
      onClick={() => onView?.(company.id)}
    >
      {/* <div className={cn("h-1.5 rounded-full", `${colors.bar}`)} /> */}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {company.logoUrl ? (
              <img
                src={getFileUrl(company.logoUrl)}
                alt="logo"
                className="h-8 w-8 rounded"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-slate-200 grid place-items-center text-xs font-semibold"></div>
            )}
            <p
              className={cn(
                "font-semibold truncate",
                selected ? "text-white" : "text-slate-900"
              )}
            >
              {company.name}
            </p>
          </div>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px]",
              selected
                ? "bg-white/15 text-white"
                : statusColors.pill + " " + statusColors.pillText
            )}
          >
            {t(`localCompanies.page.status.${uiStatus}`)}
          </span>
        </div>

        {/* Location & Manager */}
        <div
          className={cn(
            "flex items-center justify-between text-sm",
            selected ? "text-white" : "text-slate-900"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="flex text-xs items-center gap-1 font-bold">
              {company.country}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center justify-between gap-2 text-sm",
            selected ? "text-white/80" : "text-slate-600"
          )}
        >
          <span className="inline-flex items-center gap-2 text-xs">
            <UserIcon className="size-3" />
            {company.primaryContactFullName}
          </span>
          <div className="flex items-center gap-2">
            <PhoneIcon className="size-4" />
            <span
              className={cn(
                "text-mainBlue cursor-pointer select-none",
                selected ? "text-white" : "text-blue-600"
              )}
            >
              {company.phone}
            </span>
          </div>
        </div>

        <div className=" h-[1px] bg-slate-100" />

        {/* Stats */}
        <div
          className={cn(
            "grid grid-cols-3 gap-2 text-xs",
            selected ? "text-white/80" : "text-slate-600"
          )}
        >
          <div className="flex items-center gap-2">
            <UsersIcon className="size-3" />
            <span>
              <span
                className={cn(
                  "text-xs font-medium",
                  selected ? "text-white" : "text-slate-900"
                )}
              >
                {company.totalDrivers ?? 0}
              </span>{" "}
              {t("localCompanies.page.card.drivers")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TruckIcon className="size-3" />
            <span>
              <span
                className={cn(
                  "text-xs font-medium",
                  selected ? "text-white" : "text-slate-900"
                )}
              >
                {company.vehicleTypes?.length ?? 0}
              </span>{" "}
              {t("localCompanies.page.card.types")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="size-3" />
            <span
              className={cn(
                "text-xs font-medium",
                selected ? "text-white" : "text-slate-900"
              )}
            >
              {new Date(company.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        {company.status === COMPANY_STATUS.PENDING ? (
          <div
            className={cn(
              "mt-5 grid gap-2",
              hasCompaniesManage ? "grid-cols-3" : "grid-cols-1"
            )}
          >
            {hasCompaniesManage && (
              <>
                <Button
                  variant="ghost"
                  className={cn(
                    "!p-0 h-7 inline-flex items-center gap-1.5",
                    selected
                      ? "bg-green-500/15 text-green-300 hover:bg-white/20"
                      : "bg-green-600/20 hover:!bg-green-600/30 text-green-600"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove();
                  }}
                >
                  {t("localCompanies.page.card.approve")}
                  <CheckIcon className="size-3 " />
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-7 !p-0 inline-flex items-center gap-1.5",
                    selected
                      ? "bg-red-500/15 text-red-300 hover:bg-white/20"
                      : "bg-red-600/20 hover:!bg-red-600/30 text-red-600"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject();
                  }}
                >
                  {t("localCompanies.page.card.reject")}
                  <XIcon className="size-3" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              className={cn(
                "!p-0 h-7 inline-flex items-center gap-1.5",
                selected
                  ? "bg-white/15 text-white hover:bg-white/20"
                  : "bg-slate-100 hover:bg-slate-200"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onView?.(company.id);
              }}
            >
              {t("localCompanies.page.card.view")}
              <EyeIcon className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="mt-2">
            <Button
              variant="ghost"
              className={cn(
                "!p-0 h-7 w-full inline-flex items-center justify-center gap-1.5",
                selected
                  ? "bg-white/15 text-white hover:bg-white/20"
                  : "bg-slate-100 hover:bg-slate-200"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onView?.(company.id);
              }}
            >
              {t("localCompanies.page.card.viewDetails")}
              <EyeIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* Reject Dialog */}
        {showRejectDialog && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => {
              e.stopPropagation();
              setShowRejectDialog(false);
              setRejectionReason("");
            }}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangleIcon className="size-6 text-red-600" />
                <h3 className="text-lg font-semibold">Reject Company</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to reject "{company.name}"? Please provide
                a reason:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  e.stopPropagation();
                  setRejectionReason(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter rejection reason (required)..."
                className="w-full min-h-24 text-black rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRejectDialog(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmReject();
                  }}
                  disabled={!rejectionReason.trim() || rejectMutation.isPending}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
