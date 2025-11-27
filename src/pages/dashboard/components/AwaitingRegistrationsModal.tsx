import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Building2, UserIcon, Globe } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import ReactCountryFlag from "react-country-flag";
import { useRegistrationSummaries } from "../../../services/dashboard/hooks";
import { getCountryCode } from "../../../shared/utils/countryCode";
import { ENV } from "../../../lib/env";

/**
 * Construct full URL for file (avatar, logo, etc.)
 */
function getFileUrl(filePath: string | null | undefined): string | undefined {
  if (!filePath) return undefined;

  // If already a full URL, return as is
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  // Construct full URL from relative path
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `${ENV.FILE_BASE_URL}/${cleanPath}`;
}

type AwaitingRegistrationsModalProps = {
  open: boolean;
  onClose: () => void;
  cardPosition: { top: number; left: number; width: number } | null;
};

type Registration = {
  id: string;
  name: string;
  type: "driver" | "company";
  status: string;
  avatar?: string;
  logo?: string;
  company?: {
    name: string;
    logo?: string;
  };
  location?: {
    country: string;
    city: string;
    countryCode: string;
  };
};

export function AwaitingRegistrationsModal({
  open,
  onClose,
  cardPosition,
}: AwaitingRegistrationsModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: registrationSummaries = [], isLoading } =
    useRegistrationSummaries();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Map API data to component format
  const registrations: Registration[] = useMemo(() => {
    return registrationSummaries.map((summary) => {
      if (summary.type === "driver") {
        return {
          id: summary.companyId,
          name: summary.driverName,
          type: "driver" as const,
          status: "Pending",
          avatar: getFileUrl(summary.driverAvatarUrl),
          company: {
            name: summary.companyName,
            logo: getFileUrl(summary.companyLogo),
          },
        };
      } else {
        return {
          id: summary.companyId,
          name: summary.companyName,
          type: "company" as const,
          status: "Pending",
          logo: getFileUrl(summary.companyLogo),
          location: {
            country: summary.companyCountry,
            city: "", // API doesn't provide city
            countryCode: getCountryCode(summary.companyCountry),
          },
        };
      }
    });
  }, [registrationSummaries]);

  const handleShowAll = () => {
    onClose();
    navigate("/local-companies");
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          open
            ? " opacity-100 pointer-events-auto"
            : "bg-transparent opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed z-[60] bg-black/50 w-full max-w-md rounded-3xl backdrop-blur-[50px]  ease-in-out",
          open
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
          ...(cardPosition
            ? {
                top: `${cardPosition.top + 8}px`,
                left: `${cardPosition.left}px`,
              }
            : {
                left: "35%",
                top: "38%",
                transform: "translateY(-50%)",
              }),
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="registrations-modal-title"
      >
        {/* Registrations List */}
        <div className="max-h-[60vh] overflow-y-auto pt-3">
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Loading...</div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No pending registrations
              </div>
            ) : (
              registrations.map((registration, index) => (
                <div
                  key={registration.id}
                  className={cn(
                    "flex items-start gap-3 p-3 transition-colors cursor-pointer",
                    index !== registrations.length - 1 &&
                      "border-b-1 border-slate-600"
                  )}
                >
                  {/* Avatar/Icon */}
                  {registration.type === "driver" ? (
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 border border-slate-400 overflow-hidden">
                      {registration.avatar &&
                      !imageErrors.has(`avatar-${registration.id}`) ? (
                        <img
                          src={registration.avatar}
                          alt={registration.name}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImageErrors((prev) =>
                              new Set(prev).add(`avatar-${registration.id}`)
                            );
                          }}
                        />
                      ) : (
                        <UserIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-slate-400 overflow-hidden">
                      {registration.logo &&
                      !imageErrors.has(`logo-${registration.id}`) ? (
                        <img
                          src={registration.logo}
                          alt={registration.name}
                          className="w-full h-full object-contain p-1"
                          onError={() => {
                            setImageErrors((prev) =>
                              new Set(prev).add(`logo-${registration.id}`)
                            );
                          }}
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 flex-col min-w-0 flex items-start justify-between gap-1">
                    {/* Left side: Name and details */}
                    <div className="flex-1 flex items-center justify-between w-full min-w-0">
                      <span className="text-sm font-semibold text-white">
                        {registration.name}
                      </span>
                      {/* Status badge */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center text-xs font-bold text-yellow-500 bg-[#CA8A041A] px-2 py-1 rounded-lg">
                          {registration.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      {registration.type === "driver" ? (
                        <>
                          {registration.company?.logo &&
                          !imageErrors.has(
                            `company-logo-${registration.id}`
                          ) ? (
                            <img
                              src={registration.company.logo}
                              alt={registration.company.name}
                              className="size-6 object-contain bg-black/10 rounded-lg p-1"
                              onError={() => {
                                setImageErrors((prev) =>
                                  new Set(prev).add(
                                    `company-logo-${registration.id}`
                                  )
                                );
                              }}
                            />
                          ) : (
                            <UserIcon className="size-7 text-white bg-black/10 rounded-lg p-1" />
                          )}
                          <p className="text-sm text-slate-300">
                            {registration.company?.name || "Unknown"}
                          </p>
                        </>
                      ) : (
                        <>
                          {registration.location?.countryCode ? (
                            <ReactCountryFlag
                              countryCode={registration.location.countryCode}
                              svg
                              style={{
                                width: "1.5rem",
                                height: "1rem",
                              }}
                            />
                          ) : (
                            <Globe className="w-6 h-6 text-slate-300" />
                          )}
                          <p className="text-sm text-slate-300">
                            {registration.location?.country || "Unknown"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={handleShowAll}
          className="w-full bg-[#1B54FE] hover:bg-[#1B54FE]/80 text-sm text-white font-semibold py-3 px-4 rounded-b-3xl transition-colors"
        >
          {t("dashboard.kpiCards.newAwaitingRegistrations.modal.showAll")}
        </button>
      </div>
    </>
  );
}
