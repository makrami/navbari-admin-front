import { RefreshCcw, Star } from "lucide-react";
import type { CargoCompany } from "../../components/CargoDeclarationModal";
import { ENV } from "../../../../lib/env";

type CargoAssignmentsListProps = {
  companies: CargoCompany[];
};

const getLogoUrl = (logoPath: string | null | undefined): string => {
  if (!logoPath) return "";

  // If already a full URL, return as is
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
    return logoPath;
  }

  // Construct full URL from relative path
  // Remove leading slash if present to avoid double slash
  const cleanPath = logoPath.startsWith("/") ? logoPath.slice(1) : logoPath;
  return `${ENV.FILE_BASE_URL}/${cleanPath}`;
};

export default function CargoAssignmentsList({
  companies,
}: CargoAssignmentsListProps) {
  return (
    <div className="rounded-xl bg-white">
      <div className="grid gap-3">
        {companies.map((co) => (
          <div
            key={co.id}
            className="flex items-center justify-between gap-4 rounded-xl  bg-white px-4 py-3 "
          >
            {/* Left: company */}
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={getLogoUrl(co.logoUrl)}
                alt=""
                className="h-5 w-5 rounded bg-white object-contain"
              />
              <span className="text-sm font-medium text-slate-900 truncate">
                {co.name.replace("Transport", "Logistics")}
              </span>
            </div>

            {/* Middle-left: driver/admin or pending */}
            <div className="min-w-0">
              {co.admin ? (
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-200 text-[10px] text-slate-600">
                    {co.admin
                      .split(" ")
                      .map((s) => s[0])
                      .join("")}
                  </span>
                  <span>{co.admin}</span>
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                </div>
              ) : (
                <div className="text-xs font-semibold text-amber-600 inline-flex items-center gap-1">
                  Pending <RefreshCcw className="size-3" />
                </div>
              )}
            </div>

            {/* Middle-right: distance */}
            <div className="shrink-0">
              <span className="text-xs font-bold text-slate-900">246 KM</span>
              <span className="text-xs text-slate-500 ml-1">to Origin</span>
            </div>

            {/* Right: status */}
            <div className="shrink-0 text-xs font-semibold text-amber-600 inline-flex items-center gap-1">
              Pending <RefreshCcw className="size-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
