import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EntityCard } from "../../shared/components/ui/EntityCard";
import { StatusFilterChips } from "./components/StatusFilterChips";
import type { FilterKey } from "./components/StatusFilterChips";
import { ListPanel } from "../../shared/components/ui/ListPanel";
import { DetailsPanel } from "../shipment/details/DetailsPanel";
import { DriverDetails } from "./components/DriverDetails";
import { PanelRightClose } from "lucide-react";
import DocumentsList from "./components/DocumentsList";
import InternalNotes from "./components/InternalNotes";
import RecentActivities from "./components/RecentActivities";
import { DriversPageSkeleton } from "./components/DriversSkeleton";
import { useDrivers, driverKeys } from "../../services/driver/hooks";
import { formatDriverForEntityCard } from "./utils";
import {
  approveDriver,
  rejectDriver,
} from "../../services/driver/driver.service";
import { RejectionReasonModal } from "./components/RejectionReasonModal";

// Using FilterKey type from StatusFilterChips to avoid keeping a runtime-only array

export function DriversPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [driverToReject, setDriverToReject] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: drivers = [], isLoading, isError, error } = useDrivers();

  const formattedDrivers = useMemo(() => {
    return drivers.map(formatDriverForEntityCard);
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    if (activeFilter === "all") return formattedDrivers;
    return formattedDrivers.filter((d) => d.status === activeFilter);
  }, [activeFilter, formattedDrivers]);

  const countByFilter = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: formattedDrivers.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      inactive: 0,
    };
    for (const d of formattedDrivers) {
      const status = d.status as FilterKey;
      if (status in counts) {
        counts[status] += 1;
      }
    }
    return counts;
  }, [formattedDrivers]);

  // Determine selected driver for split view; keep hooks before any early returns
  // Find the original driver object for DriverDetails component
  const selectedDriver = selectedId
    ? drivers.find((d) => d.id === selectedId)
    : null;

  useEffect(() => {
    if (selectedDriver) {
      setIsActive(selectedDriver.status !== "inactive");
    }
  }, [selectedDriver]);

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: approveDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.list() });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectDriver(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.list() });
      setRejectionModalOpen(false);
      setDriverToReject(null);
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    const driver = drivers.find((d) => d.id === id);
    if (driver) {
      setDriverToReject({
        id: driver.id,
        name: driver.user.fullName || driver.user.email,
      });
      setRejectionModalOpen(true);
    }
  };

  const handleRejectionSubmit = (reason: string) => {
    if (driverToReject) {
      rejectMutation.mutate({ id: driverToReject.id, reason });
    }
  };

  if (isLoading) {
    return <DriversPageSkeleton />;
  }

  if (isError) {
    return (
      <div className="py-6 space-y-6 min-h-screen max-w-7xl mx-auto flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-2">
            {t("drivers.page.error.title", "Error loading drivers")}
          </h1>
          <p className="text-slate-600">
            {error instanceof Error
              ? error.message
              : t(
                  "drivers.page.error.message",
                  "Failed to load drivers. Please try again."
                )}
          </p>
        </div>
      </div>
    );
  }

  // Default wrapped layout view - left-aligned
  if (!selectedId) {
    return (
      <div className="py-6 space-y-6 min-h-screen max-w-7xl mx-auto flex flex-col items-start transition-all">
        <div className="w-full max-w-7xl px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                {t("drivers.page.title")}
              </h1>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl px-6">
          <StatusFilterChips
            active={activeFilter}
            onChange={setActiveFilter}
            counts={countByFilter as Record<FilterKey, number>}
            isListPanel={false}
          />
        </div>

        <div className="w-full max-w-7xl px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {filteredDrivers.map((d) => (
            <div key={d.id} className="w-full">
              <EntityCard
                entity={d}
                className="w-full h-full"
                onView={(id) => setSelectedId(id)}
                onApprove={handleApprove}
                onReject={handleReject}
                statsLabels={{
                  driversLabel: t("drivers.page.stats.shipments"),
                  activeLabel: t("drivers.page.stats.vehicles"),
                }}
              />
            </div>
          ))}
        </div>
        <RejectionReasonModal
          isOpen={rejectionModalOpen}
          onClose={() => {
            setRejectionModalOpen(false);
            setDriverToReject(null);
          }}
          onSubmit={handleRejectionSubmit}
          driverName={driverToReject?.name}
        />
      </div>
    );
  }

  // List panel view - split layout with driver details
  return (
    <div className="flex w-full overflow-hidden">
      <ListPanel title={t("drivers.page.title")}>
        <StatusFilterChips
          active={activeFilter}
          onChange={setActiveFilter}
          counts={countByFilter as Record<FilterKey, number>}
          isListPanel={selectedDriver !== null}
        />
        <div className="grid gap-4">
          {filteredDrivers.map((d) => (
            <div key={d.id} className="w-full">
              <EntityCard
                entity={d}
                className="w-full h-full"
                selected={selectedId === d.id}
                onView={(id) => setSelectedId(id)}
                onApprove={handleApprove}
                onReject={handleReject}
                statsLabels={{
                  driversLabel: t("drivers.page.stats.shipments"),
                  activeLabel: t("drivers.page.stats.vehicles"),
                }}
              />
            </div>
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
                  <RecentActivities driver={selectedDriver} />
                  <DocumentsList driverId={selectedDriver.id} />
                  <InternalNotes />
                </div>
              )}
            </DetailsPanel>
          </div>
        </div>
      </div>
      <RejectionReasonModal
        isOpen={rejectionModalOpen}
        onClose={() => {
          setRejectionModalOpen(false);
          setDriverToReject(null);
        }}
        onSubmit={handleRejectionSubmit}
        driverName={driverToReject?.name}
      />
    </div>
  );
}
