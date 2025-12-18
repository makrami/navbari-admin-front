import {useMemo, useState, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {useSearchParams, useLocation} from "react-router-dom";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {EntityCard} from "../../shared/components/ui/EntityCard";
import {StatusFilterChips} from "./components/StatusFilterChips";
import type {FilterKey} from "./components/StatusFilterChips";
import {ListPanel} from "../../shared/components/ui/ListPanel";
import {DetailsPanel} from "../shipment/details/DetailsPanel";
import {DriverDetails} from "./components/DriverDetails";
import {PanelRightClose, AlertTriangle, Trash2} from "lucide-react";
import DocumentsList from "./components/DocumentsList";
import InternalNotes from "./components/InternalNotes";
import RecentActivities from "./components/RecentActivities";
import {DriversPageSkeleton} from "./components/DriversSkeleton";
import {useDrivers, driverKeys} from "../../services/driver/hooks";
import {formatDriverForEntityCard} from "./utils";
import {
  approveDriver,
  rejectDriver,
  deleteDriver,
  updateDriverStatus,
} from "../../services/driver/driver.service";
import {RejectionReasonModal} from "./components/RejectionReasonModal";
import {useCurrentUser} from "../../services/user/hooks";

// Using FilterKey type from StatusFilterChips to avoid keeping a runtime-only array

export function DriversPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [driverToReject, setDriverToReject] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const {
    data: drivers = [],
    isLoading,
    isError,
    error,
    refetch: refetchDrivers,
  } = useDrivers();
  const {data: user} = useCurrentUser();

  // Get permissions array from user data
  const userRecord = user as Record<string, unknown> | undefined;
  const permissions = (userRecord?.permissions as string[] | undefined) || [];
  const hasDriversDelete = permissions.includes("drivers:delete");
  const hasDriversManage = permissions.includes("drivers:manage");

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

  // Refetch drivers data on window focus and route changes
  useEffect(() => {
    const handleFocus = () => {
      refetchDrivers();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetchDrivers]);

  // Refetch when navigating to this route
  useEffect(() => {
    if (location.pathname === "/drivers") {
      refetchDrivers();
    }
  }, [location.pathname, refetchDrivers]);

  // Sync selectedId with URL params
  useEffect(() => {
    const urlSelectedId = searchParams.get("selectedId");
    const urlCompanyId = searchParams.get("companyId");
    const urlDriverName = searchParams.get("driverName");

    if (urlSelectedId) {
      // Direct driver ID selection
      const driverExists = drivers.some((d) => d.id === urlSelectedId);
      if (driverExists && selectedId !== urlSelectedId) {
        setSelectedId(urlSelectedId);
      }
    } else if (urlCompanyId && urlDriverName) {
      // Find driver by company ID and driver name
      const decodedDriverName = decodeURIComponent(urlDriverName);
      const foundDriver = drivers.find(
        (d) =>
          d.companyId === urlCompanyId &&
          (d.user.fullName === decodedDriverName ||
            d.user.email === decodedDriverName)
      );
      if (foundDriver && selectedId !== foundDriver.id) {
        setSelectedId(foundDriver.id);
        // Update URL to use driver ID instead of company ID + name
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("companyId");
        newSearchParams.delete("driverName");
        newSearchParams.set("selectedId", foundDriver.id);
        setSearchParams(newSearchParams, {replace: true});
      }
    }
  }, [searchParams, drivers, selectedId, setSearchParams]);

  // Determine selected driver for split view; keep hooks before any early returns
  // Find the original driver object for DriverDetails component
  const selectedDriver = selectedId
    ? drivers.find((d) => d.id === selectedId)
    : null;

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: approveDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: driverKeys.list()});
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({id, reason}: {id: string; reason: string}) =>
      rejectDriver(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: driverKeys.list()});
      setRejectionModalOpen(false);
      setDriverToReject(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: driverKeys.list()});
      setDeleteModalOpen(false);
      setDriverToDelete(null);
      if (selectedId === driverToDelete?.id) {
        setSelectedId(null);
      }
    },
  });

  // Update driver status mutation (for activate/deactivate)
  const updateStatusMutation = useMutation({
    mutationFn: ({id, status}: {id: string; status: "approved" | "inactive"}) =>
      updateDriverStatus(id, {status}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: driverKeys.list()});
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
    refetchDrivers();
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
      rejectMutation.mutate({id: driverToReject.id, reason});
    }
  };

  const handleDeleteClick = () => {
    if (selectedDriver) {
      setDriverToDelete({
        id: selectedDriver.id,
        name: selectedDriver.user.fullName || selectedDriver.user.email,
      });
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (driverToDelete) {
      deleteMutation.mutate(driverToDelete.id);
    }
  };

  const handleToggleStatus = () => {
    if (!selectedDriver) return;

    const newStatus: "approved" | "inactive" =
      selectedDriver.status === "approved" ? "inactive" : "approved";

    updateStatusMutation.mutate({
      id: selectedDriver.id,
      status: newStatus,
    });
    refetchDrivers();
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
            onChange={(filter) => {
              setActiveFilter(filter);
              refetchDrivers();
            }}
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
                onView={(id) => {
                  setSelectedId(id);
                  refetchDrivers();
                }}
                onApprove={hasDriversManage ? handleApprove : undefined}
                onReject={hasDriversManage ? handleReject : undefined}
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
          onChange={(filter) => {
            setActiveFilter(filter);
            refetchDrivers();
          }}
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
                onView={(id) => {
                  setSelectedId(id);
                  refetchDrivers();
                }}
                onApprove={hasDriversManage ? handleApprove : undefined}
                onReject={hasDriversManage ? handleReject : undefined}
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
                      onClick={() => {
                        setSelectedId(null);
                        // Remove selectedId from URL params
                        const newSearchParams = new URLSearchParams(
                          searchParams
                        );
                        newSearchParams.delete("selectedId");
                        newSearchParams.delete("companyId");
                        newSearchParams.delete("driverName");
                        setSearchParams(newSearchParams);
                      }}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-400 hover:bg-slate-50 transition-colors"
                      aria-label={t("drivers.page.closeDetails")}
                    >
                      <PanelRightClose className="size-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      {selectedDriver.status === "approved" ||
                      selectedDriver.status === "inactive" ? (
                        <button
                          type="button"
                          onClick={handleToggleStatus}
                          disabled={updateStatusMutation.isPending}
                          role="switch"
                          aria-checked={selectedDriver.status === "approved"}
                          className={
                            (selectedDriver.status === "inactive"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600") +
                            " inline-flex items-center gap-2 rounded-full justify-between min-w-33 px-2 py-1.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          }
                        >
                          <span
                            className={
                              (selectedDriver.status === "inactive"
                                ? "bg-red-600"
                                : "bg-green-600") +
                              " relative inline-block h-4 w-7 rounded-full transition-colors duration-200"
                            }
                          >
                            <span
                              className={
                                (selectedDriver.status === "inactive"
                                  ? "translate-x-3"
                                  : "translate-x-0") +
                                " absolute left-0.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white transition-transform duration-200"
                              }
                            ></span>
                          </span>
                          {selectedDriver.status === "inactive"
                            ? t("drivers.page.status.inactive", "Inactive")
                            : t("drivers.page.status.active", "Active")}
                        </button>
                      ) : null}
                      {hasDriversDelete && (
                        <button
                          type="button"
                          onClick={handleDeleteClick}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition-colors duration-200"
                        >
                          <Trash2 className="size-4" />
                          {t("drivers.page.actions.delete", "Delete")}
                        </button>
                      )}
                    </div>
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="size-6 text-red-600" />
              <h3 className="text-lg font-semibold">
                {t("drivers.page.actions.deleteDriver", "Delete Driver")}
              </h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              {t(
                "drivers.page.actions.deleteDriverConfirm",
                `Are you sure you want to delete "${driverToDelete?.name}"? This action cannot be undone.`,
                {name: driverToDelete?.name}
              )}
            </p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDriverToDelete(null);
                }}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending
                  ? t("drivers.page.actions.deleting", "Deleting...")
                  : t("drivers.page.actions.confirmDelete", "Confirm Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
