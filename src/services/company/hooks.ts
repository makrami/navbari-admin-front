import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listCompanies,
  getCompany,
  getCompanyDetails,
  updateCompany,
  approveCompany,
  rejectCompany,
  suspendCompany,
  unsuspendCompany,
  deleteCompany,
  type CompanyFilters,
  type UpdateCompanyDto,
} from "./company.service";
import {
  listCompanyDocuments,
  uploadDocument,
  approveDocument,
  rejectDocument,
  COMPANY_DOCUMENT_TYPE,
} from "./document.service";

// Query keys
export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (filters: CompanyFilters) => [...companyKeys.lists(), filters] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
  documents: (companyId: string) => [...companyKeys.all, "documents", companyId] as const,
};

/**
 * Query hook for listing companies
 */
export function useCompanies(filters: CompanyFilters = {}) {
  return useQuery({
    queryKey: companyKeys.list(filters),
    queryFn: () => listCompanies(filters),
  });
}

/**
 * Query hook for single company
 */
export function useCompany(id: string | null) {
  return useQuery({
    queryKey: companyKeys.detail(id!),
    queryFn: () => getCompany(id!),
    enabled: !!id,
  });
}

/**
 * Query hook for company details with statistics
 */
export function useCompanyDetails(id: string | null) {
  return useQuery({
    queryKey: [...companyKeys.detail(id!), "details"],
    queryFn: () => getCompanyDetails(id!),
    enabled: !!id,
  });
}

/**
 * Mutation hook for updating company
 */
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyDto }) =>
      updateCompany(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch company queries
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

/**
 * Mutation hook for approving company
 */
export function useApproveCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveCompany(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

/**
 * Mutation hook for rejecting company
 */
export function useRejectCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      rejectCompany(id, rejectionReason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

/**
 * Mutation hook for suspending company (UI: Deactivate)
 */
export function useSuspendCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suspendCompany(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

/**
 * Mutation hook for unsuspending company (UI: Activate)
 */
export function useUnsuspendCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unsuspendCompany(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

/**
 * Mutation hook for deleting company
 */
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

/**
 * Query hook for company documents
 */
export function useCompanyDocuments(companyId: string | null) {
  return useQuery({
    queryKey: companyKeys.documents(companyId!),
    queryFn: () => listCompanyDocuments(companyId!),
    enabled: !!companyId,
  });
}

/**
 * Mutation hook for uploading document
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      documentType,
      file,
    }: {
      companyId: string;
      documentType: COMPANY_DOCUMENT_TYPE;
      file: File;
    }) => uploadDocument(companyId, documentType, file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.documents(data.companyId) });
    },
  });
}

/**
 * Mutation hook for approving document
 */
export function useApproveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveDocument(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.documents(data.companyId) });
    },
  });
}

/**
 * Mutation hook for rejecting document
 */
export function useRejectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      rejectDocument(id, rejectionReason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.documents(data.companyId) });
    },
  });
}

