import {useMemo, useState, useEffect} from "react";
import {X, Search, Users, CalendarDays, UserIcon} from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import {type Driver} from "../data/drivers";
import {getFileUrl} from "../../LocalCompanies/utils";
import {useAnnounceSegment} from "../../../services/shipment/hooks";
import {cn} from "../../../shared/utils/cn";

export type CargoCompany = {
  id: string;
  name: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  admin: string;
  registeredAt: string;
  logoUrl: string;
  availableDrivers: number;
  drivers?: Driver[];
};

type CargoDeclarationModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (companies: CargoCompany[]) => void;
  companies?: CargoCompany[];
  defaultSelectedIds?: string[];
  segmentId?: string;
  disabledCompanyIds?: string[];
};

export default function CargoDeclarationModal({
  open,
  onClose,
  onSelect,
  companies,
  defaultSelectedIds,
  segmentId,
  disabledCompanyIds = [],
}: CargoDeclarationModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(defaultSelectedIds ?? [])
  );
  const [error, setError] = useState<string | null>(null);
  const announceSegmentMutation = useAnnounceSegment();

  const filtered = useMemo(() => {
    if (!query.trim()) return companies;
    const q = query.toLowerCase();
    return companies?.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, query]);

  // Clear error when modal opens or closes
  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  // Clear error when modal closes
  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={handleClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-50 shadow-xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100"
            aria-label="Close"
            onClick={handleClose}
          >
            <X className="size-5 text-slate-500" />
          </button>
          <h3 className="text-slate-900 font-semibold">Cargo Declaration</h3>
        </div>

        {/* Search */}
        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              className="w-full rounded-xl border bg-white border-slate-200 pl-9 pr-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-5 pt-2">
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* List */}
        <div className="px-5 py-4">
          <div className="grid  bg-white rounded-xl p-4">
            {filtered?.map((co) => {
              const isDisabled = disabledCompanyIds.includes(co.id);
              return (
                <label
                  key={co.id}
                  className={cn(
                    "flex items-center justify-between gap-4 b  border-b  border-slate-100 p-3",
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-slate-50 cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(co.id)}
                      disabled={isDisabled}
                      onChange={(e) => {
                        if (isDisabled) return;
                        const next = new Set(selectedIds);
                        if (e.target.checked) next.add(co.id);
                        else next.delete(co.id);
                        setSelectedIds(next);
                      }}
                      aria-label={`Select ${co.name}`}
                      className={cn(
                        "h-5 w-5 rounded-[6px] border border-slate-300 bg-white appearance-none transition-all [box-shadow:inset_0_0_0_2px_white] checked:[box-shadow:inset_0_0_0_2px_white]",
                        isDisabled
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:border-blue-300 checked:bg-[#1b54fe] checked:border-[#1b54fe]"
                      )}
                    />
                    <img
                      src={getFileUrl(co.logoUrl) || co.logoUrl}
                      alt=""
                      className="size-8 rounded-md object-contain bg-white"
                    />
                    <div className="min-w-0 ">
                      <div className="text-slate-900 font-semibold text-sm truncate flex items-center gap-2">
                        <ReactCountryFlag
                          svg
                          countryCode={co.countryCode}
                          style={{width: 18, height: 12, borderRadius: 2}}
                        />

                        {co.name}
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <UserIcon className="size-3 text-slate-400" />
                          {co.admin}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3 text-slate-400" />
                          Register: {co.registeredAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className=" shrink-0">
                    <div className="text-xs text-slate-400">
                      Available Drivers
                    </div>
                    <div className="inline-flex items-center gap-1 text-[#1B54FE] text-sm font-bold">
                      <Users className="size-4" /> {co.availableDrivers}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-4">
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={
              selectedIds.size === 0 || announceSegmentMutation.isPending
            }
            onClick={async () => {
              const list = companies?.filter((c) => selectedIds.has(c.id));
              if (!list?.length) return;

              // If segmentId is provided, call the announce API
              if (segmentId) {
                setError(null);
                try {
                  const companyIds = list?.map((c) => c.id);
                  await announceSegmentMutation.mutateAsync({
                    id: segmentId,
                    companyIds,
                  });
                  // Call onSelect callback after successful API call
                  onSelect(list ?? []);
                  // Close modal on success
                  onClose();
                } catch (err) {
                  const errorMessage =
                    err instanceof Error
                      ? err.message
                      : "Failed to announce segment";
                  setError(errorMessage);
                  console.error("Failed to announce segment:", err);
                }
              } else {
                // If no segmentId, just call onSelect (backward compatibility)
                onSelect(list ?? []);
              }
            }}
          >
            {announceSegmentMutation.isPending ? "Announcing..." : "Select"}
          </button>
        </div>
      </div>
    </div>
  );
}
