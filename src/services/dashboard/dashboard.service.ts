import { http } from "../../lib/http";
import type { Segment } from "../../shared/types/segmentData";

export interface DashboardSummaryResponse {
  segmentsArrivingToOriginCount: number;
  segmentsUnassignedCount: number;
  shipmentsImpactedCount: number;
  companiesWaitingForApprovalCount: number;
  driversWaitingForApprovalCount: number;
  lastDriverOrCompanyRegisterTimestamp: string;
  unreadMessagesCount: number;
  waitingToResponseChatCount: number;
  lastMessageTimestamp: string;
  totalAlertsCount: number;
  newAlertsCount: number;
}

export type SegmentSummaryType = "arriving_soon" | "pending_driver_action";

export interface SegmentSummary {
  shipmentId: string;
  shipmentTitle: string;
  type: SegmentSummaryType;
  segmentOriginCountry: string;
  segmentOriginCity: string;
  segmentDestinationCountry: string;
  segmentDestinationCity: string;
  segmentOrder: number;
}

export interface RegistrationSummary {
  companyId: string;
  companyName: string;
  companyLogo: string;
  type: "company" | "driver";
  driverName: string;
  driverAvatarUrl: string;
  companyCountry: string;
  createdAt: string;
}

export interface ConversationSummary {
  conversationId: string;
  conversationTitle: string;
  conversationAvatarUrl: string;
  lastMessageContent: string;
  lastMessageAt: string;
  unreadMessageCount: number;
  unreadAlertCount: number;
}

export interface ConversationsSummariesResponse {
  unreadMessageSummaries: ConversationSummary[];
  unreadAlertSummaries: ConversationSummary[];
}

/**
 * Get dashboard summary data
 */
export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  try {
    const response = await http.get<DashboardSummaryResponse>(
      "/dashboard/summary"
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch dashboard summary");
  }
}

/**
 * Get segment summaries
 */
export async function getSegmentSummaries(): Promise<SegmentSummary[]> {
  try {
    const response = await http.get<SegmentSummary[]>(
      "/dashboard/segment-summaries"
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch segment summaries");
  }
}

/**
 * Get registration summaries
 */
export async function getRegistrationSummaries(): Promise<
  RegistrationSummary[]
> {
  try {
    const response = await http.get<RegistrationSummary[]>(
      "/dashboard/registration-summaries"
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch registration summaries");
  }
}

/**
 * Get conversation summaries (unread messages and alerts)
 */
export async function getConversationsSummaries(): Promise<ConversationsSummariesResponse> {
  try {
    const response = await http.get<ConversationsSummariesResponse>(
      "/dashboard/conversations-summaries"
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch conversation summaries");
  }
}

/**
 * Get active segments
 */
export async function getActiveSegments(): Promise<Segment[]> {
  try {
    const response = await http.get<
      Segment[] | { segments?: Segment[]; data?: Segment[] }
    >("/segments/active");

    // Handle different response formats
    const data = response.data;

    // If response is an array, return it directly
    if (Array.isArray(data)) {
      return data;
    }

    // If response is an object with segments property
    if (
      data &&
      typeof data === "object" &&
      "segments" in data &&
      Array.isArray(data.segments)
    ) {
      return data.segments;
    }

    // If response is an object with data property
    if (
      data &&
      typeof data === "object" &&
      "data" in data &&
      Array.isArray(data.data)
    ) {
      return data.data;
    }

    // If none of the above, return empty array
    console.warn("Unexpected response format from /segments/active:", data);
    return [];
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch active segments");
  }
}
