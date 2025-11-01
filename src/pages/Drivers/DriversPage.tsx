import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EntityCard } from "../../shared/components/ui/EntityCard";
import { DRIVERS } from "./data";
import { StatusFilterChips } from "./components/StatusFilterChips";
import type { FilterKey } from "./components/StatusFilterChips";
import { ListPanel } from "../../shared/components/ui/ListPanel";
import { DetailsPanel } from "../shipment/details/DetailsPanel";
import { DriverDetails } from "./components/DriverDetails";
import { AddDriver } from "./components/AddDriver";
import { PanelRightClose } from "lucide-react";
import DocumentsList from "./components/DocumentsList";
import InternalNotes from "./components/InternalNotes";
import RecentActivities from "./components/RecentActivities";
import { DriversPageSkeleton } from "./components/DriversSkeleton";

// Using FilterKey type from StatusFilterChips to avoid keeping a runtime-only array

export function DriversPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    DRIVERS[0]?.id || null
  );
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const filteredDrivers = useMemo(() => {
    if (activeFilter === "all") return DRIVERS;
    return DRIVERS.filter((d) => d.status === activeFilter);
  }, [activeFilter]);

  const countByFilter = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: DRIVERS.length,
      pending: 0,
      active: 0,
      rejected: 0,
      inactive: 0,
    };
    for (const d of DRIVERS) counts[d.status] += 1;
    return counts;
  }, []);

  // Determine selected driver for split view; keep hooks before any early returns
  const selectedDriver =
    DRIVERS.find((d) => d.id === selectedId) ?? filteredDrivers[0];

  useEffect(() => {
    if (selectedDriver) {
      setIsActive(selectedDriver.status !== "inactive");
    }
  }, [selectedDriver]);

  if (isLoading) {
    return <DriversPageSkeleton />;
  }

  // Default list view
  if (!selectedId) {
    return (
      <div className="py-6 space-y-6 h-screen  max-w-7xl mx-auto  transition-all">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {t("drivers.page.title")}
            </h1>
          </div>
        </div>

        <StatusFilterChips
          active={activeFilter}
          onChange={setActiveFilter}
          counts={countByFilter as Record<FilterKey, number>}
          isListPanel={selectedId !== null}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filteredDrivers.map((d) => (
            <EntityCard
              key={d.id}
              entity={d}
              onView={(id) => setSelectedId(id)}
              statsLabels={{
                driversLabel: t("drivers.page.stats.shipments"),
                activeLabel: t("drivers.page.stats.vehicles"),
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
      <ListPanel title={t("drivers.page.title")}>
        <StatusFilterChips
          active={activeFilter}
          onChange={setActiveFilter}
          counts={countByFilter as Record<FilterKey, number>}
          isListPanel={selectedDriver !== null}
        />
        <AddDriver />
        <div className="grid gap-4">
          {filteredDrivers.map((d) => (
            <EntityCard
              key={d.id}
              entity={d}
              selected={selectedId === d.id}
              onView={(id) => setSelectedId(id)}
              statsLabels={{
                driversLabel: t("drivers.page.stats.shipments"),
                activeLabel: t("drivers.page.stats.vehicles"),
              }}
            />
          ))}
        </div>
      </ListPanel>

      <div className="flex-1 h-screen max-w-4xl mx-auto overflow-hidden">
        <div className="h-full overflow-y-auto no-scrollbar">
          <div className="p-9 flex flex-col gap-4">
            <DetailsPanel className="min-h-0 p-0 " title="">
              {selectedDriver && (
                <div className="flex flex-col gap-4">
                  <div className="flex w-full items-center justify-between rounded-xl ">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-400 hover:bg-slate-50 transition-colors"
                      aria-label={t("drivers.page.closeDetails")}
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
                      {isActive
                        ? t("drivers.page.actions.deactivate")
                        : t("drivers.page.actions.activate")}
                    </button>
                  </div>
                  <DriverDetails driver={selectedDriver} />
                  <RecentActivities />
                  <DocumentsList />
                  <InternalNotes />
                </div>
              )}
            </DetailsPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
