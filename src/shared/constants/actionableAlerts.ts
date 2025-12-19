import type {ActionableAlertChip} from "../../pages/chat-alert/types/chat";

/**
 * Default actionable alerts configuration.
 * These can be customized with translations when used in components.
 */
export const DEFAULT_ACTIONABLE_ALERTS: ActionableAlertChip[] = [
  {id: "1", label: "GPS Lost", alertType: "alert"},
  {id: "2", label: "Delay Expected", alertType: "warning"},
  {id: "3", label: "Route Cleared", alertType: "success"},
  {id: "4", label: "Documentation Pending", alertType: "info"},
];
