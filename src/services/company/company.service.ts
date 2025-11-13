import { z } from "zod";
import { http } from "../../lib/http";

// Enums matching API
export enum COMPANY_STATUS {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
}

export enum VEHICLE_TYPE {
  TENTED = "tented",
  REFRIGERATED = "refrigerated",
  FLATBED = "flatbed",
  DOUBLE_WALL = "double_wall",
}

export enum LANGUAGE {
  EN = "en",
  FA = "fa",
}

// Zod schemas for validation
const vehicleTypeSchema = z.nativeEnum(VEHICLE_TYPE);
const languageSchema = z.nativeEnum(LANGUAGE);
const companyStatusSchema = z.nativeEnum(COMPANY_STATUS);

// Company Read DTO schema
const companyReadDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  country: z.string(),
  address: z.string().optional(),
  email: z.string().email(),
  phone: z.string(),
  status: companyStatusSchema,
  registrationId: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  driverCapacityCount: z.number(),
  vehicleTypes: z.array(vehicleTypeSchema).optional().nullable(),
  primaryContactFullName: z.string(),
  primaryContactEmail: z.string().email(),
  primaryContactPhoneNumber: z.string(),
  preferredLanguage: languageSchema.optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  internalNote: z.string().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
  totalDrivers: z.number().optional(),
  totalSegments: z.number().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CompanyReadDto = z.infer<typeof companyReadDtoSchema>;

// Update Company DTO schema (all fields optional)
const updateCompanyDtoSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  country: z.string().min(1).max(100).optional(),
  address: z.string().max(500).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).max(50).optional(),
  registrationId: z.string().max(100).optional(),
  website: z.string().max(500).optional(),
  driverCapacityCount: z.number().optional(),
  vehicleTypes: z.array(vehicleTypeSchema).optional(),
  primaryContactFullName: z.string().min(1).max(200).optional(),
  primaryContactEmail: z.string().email().optional(),
  primaryContactPhoneNumber: z.string().min(1).max(50).optional(),
  preferredLanguage: languageSchema.optional(),
  internalNote: z.string().max(2000).optional(),
}).partial();

export type UpdateCompanyDto = z.infer<typeof updateCompanyDtoSchema>;

// Reject Company DTO schema
const rejectCompanyDtoSchema = z.object({
  rejectionReason: z.string().min(1).max(500),
});

export type RejectCompanyDto = z.infer<typeof rejectCompanyDtoSchema>;

// Company filter DTO schema
export type CompanyFilters = {
  skip?: number;
  take?: number;
  status?: COMPANY_STATUS;
  country?: string;
  registrationId?: string;
};

/**
 * List companies with optional filters
 */
export async function listCompanies(filters: CompanyFilters = {}): Promise<CompanyReadDto[]> {
  try {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append("skip", filters.skip.toString());
    if (filters.take !== undefined) params.append("take", filters.take.toString());
    if (filters.status) params.append("status", filters.status);
    if (filters.country) params.append("country", filters.country);
    if (filters.registrationId) params.append("registrationId", filters.registrationId);

    const queryString = params.toString();
    const url = `/companies${queryString ? `?${queryString}` : ""}`;
    
    const response = await http.get<CompanyReadDto[]>(url);
    
    // Validate response array
    return z.array(companyReadDtoSchema).parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch companies");
  }
}

/**
 * Get company by ID
 */
export async function getCompany(id: string): Promise<CompanyReadDto> {
  try {
    const response = await http.get<CompanyReadDto>(`/companies/${id}`);
    return companyReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch company");
  }
}

/**
 * Get company details with statistics
 */
export async function getCompanyDetails(id: string): Promise<CompanyReadDto> {
  try {
    const response = await http.get<CompanyReadDto>(`/companies/${id}/details`);
    return companyReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch company details");
  }
}

/**
 * Update company
 */
export async function updateCompany(id: string, data: UpdateCompanyDto): Promise<CompanyReadDto> {
  try {
    // Validate input
    const validatedData = updateCompanyDtoSchema.parse(data);
    
    const response = await http.put<CompanyReadDto>(`/companies/${id}`, validatedData);
    return companyReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError?.message || "Invalid input");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update company");
  }
}

/**
 * Approve company
 */
export async function approveCompany(id: string): Promise<CompanyReadDto> {
  try {
    const response = await http.patch<CompanyReadDto>(`/companies/${id}/approve`);
    return companyReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to approve company");
  }
}

/**
 * Reject company
 */
export async function rejectCompany(id: string, rejectionReason: string): Promise<CompanyReadDto> {
  try {
    const validatedData = rejectCompanyDtoSchema.parse({ rejectionReason });
    
    const response = await http.patch<CompanyReadDto>(`/companies/${id}/reject`, validatedData);
    return companyReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError?.message || "Invalid input");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to reject company");
  }
}

/**
 * Suspend company (UI: Deactivate)
 */
export async function suspendCompany(id: string): Promise<CompanyReadDto> {
  try {
    const response = await http.patch<CompanyReadDto>(`/companies/${id}/suspend`);
    return companyReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to suspend company");
  }
}

/**
 * Unsuspend company (UI: Activate)
 */
export async function unsuspendCompany(id: string): Promise<CompanyReadDto> {
  try {
    const response = await http.patch<CompanyReadDto>(`/companies/${id}/unsuspend`);
    return companyReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to unsuspend company");
  }
}

/**
 * Delete company
 */
export async function deleteCompany(id: string): Promise<void> {
  try {
    await http.delete(`/companies/${id}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete company");
  }
}

