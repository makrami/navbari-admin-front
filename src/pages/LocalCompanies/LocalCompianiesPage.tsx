import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EntityCard } from "../../shared/components/ui/EntityCard";
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
import { LocalCompaniesPageSkeleton } from "./components/LocalCompaniesSkeleton";
import { useCompanies, useCompanyDetails, useSuspendCompany, useUnsuspendCompany } from "../../services/company/hooks";
import { COMPANY_STATUS } from "../../services/company/company.service";
import { formatCompanyForEntityCard } from "./utils";
import { apiStatusToUiStatus } from "./types";

// Using FilterKey type from StatusFilterChips to avoid keeping a runtime-only array

export function LocalCompaniesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { t } = useTranslation();

  // Build filters for API call
  const apiFilters = useMemo(() => {
    const filters: { status?: COMPANY_STATUS } = {};
    if (activeFilter !== "all") {
      // Map UI status to API status
      if (activeFilter === "active") filters.status = COMPANY_STATUS.APPROVED;
      else if (activeFilter === "inactive") filters.status = COMPANY_STATUS.SUSPENDED;
      else if (activeFilter === "pending") filters.status = COMPANY_STATUS.PENDING;
      else if (activeFilter === "rejected") filters.status = COMPANY_STATUS.REJECTED;
    }
    return filters;
  }, [activeFilter]);

  // Fetch companies
  const { data: companies = [], isLoading, error } = useCompanies(apiFilters);
  const { data: companyDetails } = useCompanyDetails(selectedId);
  const suspendMutation = useSuspendCompany();
  const unsuspendMutation = useUnsuspendCompany();

  // Transform companies for EntityCard
  const transformedCompanies = useMemo(() => {
    return companies.map(formatCompanyForEntityCard);
  }, [companies]);

  // Filter companies based on UI filter
  const filteredCompanies = useMemo(() => {
    if (activeFilter === "all") return transformedCompanies;
    return transformedCompanies.filter((c) => c.status === activeFilter);
  }, [transformedCompanies, activeFilter]);

  // Calculate counts by filter
  const countByFilter = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: companies.length,
      pending: 0,
      active: 0,
      rejected: 0,
      inactive: 0,
    };
    for (const c of companies) {
      const uiStatus = apiStatusToUiStatus(c.status);
      counts[uiStatus] += 1;
    }
    return counts;
  }, [companies]);

  // Get selected company
  const selectedCompany = useMemo(() => {
    if (!selectedId) return null;
    return companies.find((c) => c.id === selectedId) || null;
  }, [companies, selectedId]);

  // Auto-select first company if none selected
  useEffect(() => {
    if (!selectedId && filteredCompanies.length > 0) {
      setSelectedId(filteredCompanies[0].id);
    }
  }, [selectedId, filteredCompanies]);

  // Handle activate/deactivate toggle
  const handleToggleActive = async () => {
    if (!selectedCompany) return;

    const currentUiStatus = apiStatusToUiStatus(selectedCompany.status);
    if (currentUiStatus === "inactive") {
      // Activate (unsuspend)
      await unsuspendMutation.mutateAsync(selectedCompany.id);
    } else {
      // Deactivate (suspend)
      await suspendMutation.mutateAsync(selectedCompany.id);
    }
  };

  const isActive = selectedCompany
    ? apiStatusToUiStatus(selectedCompany.status) === "active"
    : false;

  if (isLoading) {
    return <LocalCompaniesPageSkeleton />;
  }

  if (error) {
    return (
      <div className="py-6 space-y-6 h-screen max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {t("localCompanies.page.title")}
            </h1>
          </div>
        </div>
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error instanceof Error ? error.message : "Failed to load companies"}
        </div>
      </div>
    );
  }

  // Default list view
  if (!selectedId || !selectedCompany) {
    return (
      <div className="py-6 space-y-6 h-screen  max-w-7xl mx-auto  transition-all">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {t("localCompanies.page.title")}
            </h1>
          </div>
        </div>

        <StatusFilterChips
          active={activeFilter}
          onChange={setActiveFilter}
          counts={countByFilter as Record<FilterKey, number>}
          isListPanel={false}
        />

        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No companies found
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filteredCompanies.map((c) => (
              <EntityCard
                key={c.id}
                entity={c}
                onView={(id) => setSelectedId(id)}
                statsLabels={{
                  driversLabel: t("localCompanies.page.stats.drivers"),
                  activeLabel: t("localCompanies.page.stats.active"),
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Split view matching left-side list panel layout
  return (
    <div className="flex w-full  overflow-hidden ">
      <ListPanel title={t("localCompanies.page.title")}>
        <StatusFilterChips
          active={activeFilter}
          onChange={setActiveFilter}
          counts={countByFilter as Record<FilterKey, number>}
          isListPanel={true}
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
                driversLabel: t("localCompanies.page.stats.drivers"),
                activeLabel: t("localCompanies.page.stats.active"),
              }}
            />
          ))}
        </div>
      </ListPanel>

      <div className="flex-1 h-screen max-w-4xl mx-auto overflow-hidden">
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
                      aria-label={t("localCompanies.page.closeDetails")}
                    >
                      <PanelRightClose className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleActive}
                      disabled={suspendMutation.isPending || unsuspendMutation.isPending}
                      role="switch"
                      aria-checked={isActive}
                      className={
                        (isActive
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600") +
                        " inline-flex items-center gap-2 rounded-full justify-between min-w-33 px-2 py-1.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
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
                      {suspendMutation.isPending || unsuspendMutation.isPending
                        ? "Loading..."
                        : isActive
                        ? t("localCompanies.page.actions.deactivate")
                        : t("localCompanies.page.actions.activate")}
                    </button>
                  </div>
                  <CompanyDetails company={companyDetails || selectedCompany} />
                  <DocumentsList companyId={selectedId} />
                  <InternalNotes companyId={selectedId} initialValue={selectedCompany.internalNote || ""} />
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
