import { useEffect, useMemo, useState } from "react";
import { EntityCard } from "../../shared/components/ui/EntityCard";
import { COMPANIES } from "./data";
import { StatusFilterChips } from "./components/StatusFilterChips";
import type { FilterKey } from "./components/StatusFilterChips";
import { ListPanel } from "../../shared/components/ui/ListPanel";
import { DetailsPanel } from "../shipment/details/DetailsPanel";
import { CompanyDetails } from "./components/CompanyDetails";
import { AddLocalCompany } from "./components/AddLocalCompany";
import { PanelRightClose } from "lucide-react";
import DocumentsList from "./components/DocumentsList";
import InternalNotes from "./components/InternalNotes";
import RecentActivities from "./components/RecentActivities";

// Using FilterKey type from StatusFilterChips to avoid keeping a runtime-only array

export function LocalCompaniesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);

  const filteredCompanies = useMemo(() => {
    if (activeFilter === "all") return COMPANIES;
    return COMPANIES.filter((c) => c.status === activeFilter);
  }, [activeFilter]);

  const countByFilter = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: COMPANIES.length,
      pending: 0,
      active: 0,
      rejected: 0,
      inactive: 0,
    };
    for (const c of COMPANIES) counts[c.status] += 1;
    return counts;
  }, []);

  // Determine selected company for split view; keep hooks before any early returns
  const selectedCompany =
    COMPANIES.find((c) => c.id === selectedId) ?? filteredCompanies[0];

  useEffect(() => {
    if (selectedCompany) {
      setIsActive(selectedCompany.status !== "inactive");
    }
  }, [selectedCompany]);

  // Default list view
  if (!selectedId) {
    return (
      <div className="py-6 space-y-6 h-screen  max-w-7xl mx-auto  transition-all">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Local Companies</h1>
          </div>
        </div>

        <StatusFilterChips
          active={activeFilter}
          onChange={setActiveFilter}
          counts={countByFilter as Record<FilterKey, number>}
          isListPanel={selectedId !== null}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filteredCompanies.map((c) => (
            <EntityCard
              key={c.id}
              entity={c}
              onView={(id) => setSelectedId(id)}
              statsLabels={{
                driversLabel: "drivers",
                activeLabel: "active",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Split view matching left-side list panel layout
  return (
    <div className="flex w-full  overflow-hidden ">
      <ListPanel title="Local Companies">
        <StatusFilterChips
          active={activeFilter}
          onChange={setActiveFilter}
          counts={countByFilter as Record<FilterKey, number>}
          isListPanel={selectedCompany !== null}
        />
        <AddLocalCompany />
        <div className="grid gap-4">
          {filteredCompanies.map((c) => (
            <EntityCard
              key={c.id}
              entity={c}
              selected={selectedId === c.id}
              onView={(id) => setSelectedId(id)}
              statsLabels={{
                driversLabel: "drivers",
                activeLabel: "active",
              }}
            />
          ))}
        </div>
      </ListPanel>

      <div className="flex-1 h-screen max-w-5xl mx-auto overflow-hidden">
        <div className="h-full overflow-y-auto no-scrollbar">
          <div className="p-9 flex flex-col gap-4">
            <DetailsPanel className="min-h-0 p-0 " title="">
              {selectedCompany && (
                <div className="flex flex-col gap-4">
                  <div className="flex w-full items-center justify-between rounded-xl ">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-400 hover:bg-slate-50 transition-colors"
                      aria-label="Close details panel"
                    >
                      <PanelRightClose className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsActive((v) => !v)}
                      role="switch"
                      aria-checked={isActive}
                      className={
                        (isActive
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600") +
                        " inline-flex items-center gap-2 rounded-full justify-between min-w-33 px-2 py-1.5 text-sm font-medium transition-colors duration-200"
                      }
                    >
                      <span
                        className={
                          (isActive ? "bg-red-600" : "bg-green-600") +
                          " relative inline-block h-4 w-7 rounded-full transition-colors duration-200"
                        }
                      >
                        <span
                          className={
                            (isActive ? "translate-x-3" : "translate-x-0") +
                            " absolute left-0.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white transition-transform duration-200"
                          }
                        ></span>
                      </span>
                      {isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                  <CompanyDetails company={selectedCompany} />
                  <DocumentsList />
                  <InternalNotes />
                  <RecentActivities />
                </div>
              )}
            </DetailsPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
