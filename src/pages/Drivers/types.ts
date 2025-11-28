export const DRIVER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  INACTIVE: "inactive",
} as const;

export type DriverStatus = "pending" | "approved" | "rejected" | "inactive";
export type VehicleType = "tented" | "refrigerated";
export type CompanyStatus = "pending" | "active" | "rejected" | "inactive";
export type DocumentType = "license" | string;
export type DocumentStatus = "pending" | "approved" | "rejected";
export type AppScope = "head_office" | string;

export type Role = {
  id: string;
  name: string;
  title: string;
  appScope: AppScope;
  description: string;
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  permissionCount: number;
  userCount: number;
};

export type Company = {
  id: string;
  name: string;
  country: string;
  address: string;
  email: string;
  phone: string;
  status: CompanyStatus;
  rejectionReason: string;
  registrationId: string;
  website: string;
  driverCapacityCount: number;
  vehicleTypes: VehicleType[];
  primaryContactFullName: string;
  primaryContactEmail: string;
  primaryContactPhoneNumber: string;
  preferredLanguage: string;
  logoUrl: string;
  internalNote: string;
  totalDrivers: number;
  totalSegments: number;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  email: string;
  phoneNumber: string;
  emailVerified: boolean;
  phoneNumberVerified: boolean;
  country: string;
  fullName: string;
  referralCode: string;
  appScope: AppScope;
  roleId: string;
  role: Role;
  companyId: string;
  company: Company;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
};

export type Document = {
  id: string;
  driverId: string;
  documentType: DocumentType;
  filePath: string;
  status: DocumentStatus;
  rejectionReason: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  driver: string;
};

export type Driver = {
  id: string;
  userId: string;
  companyId: string;
  country: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  vehicleCapacity: number;
  licenseNumber: string;
  nationalIdOrPassport: string;
  internalNote: string;
  avatarUrl: string;
  status: DriverStatus;
  rating: number;
  totalDeliveries: number;
  totalDelays: number;
  totalShipments: number;
  gpsUptimePercent: number;
  lastGpsLatitude: number;
  lastGpsLongitude: number;
  lastGpsUpdate: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  company: Company;
  documents: Document[];
};

export const STATUS_TO_COLOR: Record<
  DriverStatus,
  {bar: string; pill: string; pillText: string}
> = {
  pending: {
    bar: "bg-amber-300",
    pill: "bg-amber-100",
    pillText: "text-amber-700",
  },
  approved: {
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
