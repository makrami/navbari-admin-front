import { useMemo, useState } from "react";
import { X, Search, Users, CalendarDays, UserIcon } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { DRIVER_LIST, type Driver } from "../data/drivers";

import company1 from "../../../assets/images/companieslogo/company1.png";
import company2 from "../../../assets/images/companieslogo/company2.png";
import company3 from "../../../assets/images/companieslogo/company3.png";
import company4 from "../../../assets/images/companieslogo/company4.png";

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

const DEFAULT_COMPANIES: CargoCompany[] = [
  {
    id: "cntrans",
    name: "CNTRANS",
    country: "China",
    countryCode: "CN",
    admin: "Lee Sin",
    registeredAt: "2023-10-26",
    logoUrl: company1,
    availableDrivers: 5,
    drivers: DRIVER_LIST.slice(0, 4),
  },
  {
    id: "namous",
    name: "NAMOUS Transport",
    country: "United States",
    countryCode: "US",
    admin: "Lee Sin",
    registeredAt: "2023-10-26",
    logoUrl: company2,
    availableDrivers: 5,
    drivers: DRIVER_LIST.slice(1, 5),
  },
  {
    id: "ups",
    name: "UPS Transport",
    country: "United States",
    countryCode: "US",
    admin: "Lee Sin",
    registeredAt: "2023-10-26",
    logoUrl: company3,
    availableDrivers: 5,
    drivers: DRIVER_LIST.slice(0, 3),
  },
  {
    id: "dhl",
    name: "DHL Transport",
    country: "Germany",
    countryCode: "DE",
    admin: "Lee Sin",
    registeredAt: "2023-10-26",
    logoUrl: company4,
    availableDrivers: 5,
    drivers: DRIVER_LIST.slice(0, 4),
  },
];

type CargoDeclarationModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (companies: CargoCompany[]) => void;
  companies?: CargoCompany[];
  defaultSelectedIds?: string[];
};

export default function CargoDeclarationModal({
  open,
  onClose,
  onSelect,
  companies = DEFAULT_COMPANIES,
  defaultSelectedIds,
}: CargoDeclarationModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(defaultSelectedIds ?? [])
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return companies;
    const q = query.toLowerCase();
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-50 shadow-xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100"
            aria-label="Close"
            onClick={onClose}
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

        {/* List */}
        <div className="px-5 py-4">
          <div className="grid  bg-white rounded-xl p-4">
            {filtered.map((co) => (
              <label
                key={co.id}
                className="flex items-center justify-between gap-4 b  border-b  border-slate-100 p-3 hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(co.id)}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      if (e.target.checked) next.add(co.id);
                      else next.delete(co.id);
                      setSelectedIds(next);
                    }}
                    aria-label={`Select ${co.name}`}
                    className="h-5 w-5 rounded-[6px] border border-slate-300 bg-white appearance-none cursor-pointer transition-all hover:border-blue-300 checked:bg-[#1b54fe] checked:border-[#1b54fe] [box-shadow:inset_0_0_0_2px_white] checked:[box-shadow:inset_0_0_0_2px_white]"
                  />
                  <img
                    src={co.logoUrl}
                    alt=""
                    className="size-8 rounded-md object-contain bg-white"
                  />
                  <div className="min-w-0 ">
                    <div className="text-slate-900 font-semibold text-sm truncate flex items-center gap-2">
                      <ReactCountryFlag
                        svg
                        countryCode={co.countryCode}
                        style={{ width: 18, height: 12, borderRadius: 2 }}
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
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-4">
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={selectedIds.size === 0}
            onClick={() => {
              const list = companies.filter((c) => selectedIds.has(c.id));
              if (list.length) onSelect(list);
            }}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
