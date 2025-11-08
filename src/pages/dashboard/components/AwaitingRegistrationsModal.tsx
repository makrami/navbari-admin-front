import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Building2, UserIcon, Globe } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import imgAvatar from "../../../assets/images/avatar.png";
import company1Logo from "../../../assets/images/companieslogo/company1.png";
import company2Logo from "../../../assets/images/companieslogo/company2.png";
import ReactCountryFlag from "react-country-flag";

type AwaitingRegistrationsModalProps = {
  open: boolean;
  onClose: () => void;
};

// Mock data for registrations
const MOCK_REGISTRATIONS = [
  {
    id: "1",
    type: "driver" as const,
    name: "Amita Sing",
    avatar: imgAvatar,
    company: {
      logo: company1Logo,
      name: "DHL Logestics",
    },
    status: "New Driver",
  },
  {
    id: "2",
    type: "company" as const,
    name: "UPS Logistics",
    logo: company2Logo,
    location: {
      country: "China",
      city: "Hejiang",
      countryCode: "CN",
    },
    status: "New Company",
  },
  {
    id: "3",
    type: "driver" as const,
    name: "Olaf Khan",
    avatar: imgAvatar,
    company: {
      logo: null,
      name: "Independent",
    },
    status: "New Driver",
  },
];

export function AwaitingRegistrationsModal({
  open,
  onClose,
}: AwaitingRegistrationsModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
          "fixed left-[35%] top-[38%] -translate-y-1/2 z-[60] bg-black/50 w-full max-w-md rounded-3xl backdrop-blur-[50px] transition-all duration-300 ease-in-out",
          open
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0  pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="registrations-modal-title"
      >
        {/* Registrations List */}
        <div className="max-h-[60vh] overflow-y-auto pt-3">
          <div className="space-y-3">
            {MOCK_REGISTRATIONS.map((registration, index) => (
              <div
                key={registration.id}
                className={cn(
                  "flex items-start gap-3 p-3 transition-colors cursor-pointer",
                  index !== MOCK_REGISTRATIONS.length - 1 &&
                    "border-b-1 border-slate-600"
                )}
              >
                {/* Avatar/Icon */}
                {registration.type === "driver" ? (
                  <img
                    src={registration.avatar}
                    alt={registration.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-slate-400"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-slate-400 overflow-hidden">
                    {registration.logo ? (
                      <img
                        src={registration.logo}
                        alt={registration.name}
                        className="w-full h-full object-contain p-1"
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
                        {registration.company.logo ? (
                          <img
                            src={registration.company.logo}
                            alt={registration.company.name}
                            className="size-6 object-contain bg-black/10  rounded-lg p-1"
                          />
                        ) : (
                          <UserIcon className="size-7 text-white bg-black/10 rounded-lg p-1" />
                        )}
                        <p className="text-sm text-slate-300">
                          {registration.company.name}
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
                          {registration.location?.country || "Unknown"} /{" "}
                          {registration.location?.city || "Unknown"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
