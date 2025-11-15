// Re-export API types and enums
export {
  COMPANY_STATUS,
  VEHICLE_TYPE,
  LANGUAGE,
  type CompanyReadDto,
  type UpdateCompanyDto,
  type CompanyFilters,
} from "../../services/company/company.service";

export {
  COMPANY_DOCUMENT_TYPE,
  COMPANY_DOCUMENT_STATUS,
  type CompanyDocumentReadDto,
} from "../../services/company/document.service";

// UI Status type (mapped from API status)
export type CompanyStatus = "pending" | "active" | "rejected" | "inactive";

// Status mapping utilities
/**
 * Map API status to UI status
 * approved → active, suspended → inactive
 */
export function apiStatusToUiStatus(apiStatus: string): CompanyStatus {
  switch (apiStatus) {
    case "approved":
      return "active";
    case "suspended":
      return "inactive";
    case "pending":
      return "pending";
    case "rejected":
      return "rejected";
    default:
      return "pending";
  }
}

/**
 * Map UI status to API status
 * active → approved, inactive → suspended
 */
export function uiStatusToApiStatus(uiStatus: CompanyStatus): string {
  switch (uiStatus) {
    case "active":
      return "approved";
    case "inactive":
      return "suspended";
    case "pending":
      return "pending";
    case "rejected":
      return "rejected";
    default:
      return "pending";
  }
}

// Status color mapping for UI
export const STATUS_TO_COLOR: Record<CompanyStatus, { bar: string; pill: string; pillText: string }> = {
  pending: {
    bar: "bg-amber-300",
    pill: "bg-amber-100",
    pillText: "text-amber-700",
  },
  active: {
    bar: "bg-emerald-300",
    pill: "bg-emerald-100",
    pillText: "text-emerald-700",
  },
  rejected: {
    bar: "bg-rose-300",
    pill: "bg-rose-100",
    pillText: "text-rose-700",
  },
  inactive: {
    bar: "bg-slate-300",
    pill: "bg-slate-200",
    pillText: "text-slate-700",
  },
};

// Type alias for backward compatibility
export type Company = import("../../services/company/company.service").CompanyReadDto;
