import type {
  InstitutionStatus,
  UserRole,
} from "@/generated/prisma/client";

export type { InstitutionStatus, UserRole };

export type DeviceOnlineStatus = "online" | "offline" | "never_connected";

export interface InstitutionListItem {
  id: string;
  name: string;
  status: InstitutionStatus;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  _count: {
    devices: number;
    students: number;
    admins: number;
  };
  admins: {
    id: string;
    name: string;
    email: string;
  }[];
}

export interface InstitutionAdmin {
  id: string;
  name: string;
  email: string;
}

export interface InstitutionDetail {
  id: string;
  name: string;
  status: InstitutionStatus;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  updatedAt: string;
  admins: InstitutionAdmin[];
  _count: {
    devices: number;
    students: number;
  };
}

export interface DeviceListItem {
  id: string;
  deviceId: string;
  deviceModel: string | null;
  deviceName: string | null;
  registeredAt: string;
  onlineStatus: DeviceOnlineStatus;
  lastHeartbeatAt: string | null;
  policyVersionApplied: number;
  student: {
    name: string;
    email: string;
  } | null;
}

export interface StudentListItem {
  id: string;
  name: string;
  email: string;
  deviceId: string;
  registeredAt: string;
  device: {
    deviceModel: string | null;
  };
}

export interface PolicyData {
  appWhitelist: string[];
  appBlacklist: string[];
  categoryFilters: string[];
  screenTimeLimitMin: number | null;
  dnsSafeBrowsing: boolean;
  installRestriction: boolean;
  version: number;
}

export interface SyncStatus {
  policyVersion: number;
  totalDevices: number;
  syncedDevices: number;
  pendingDevices: number;
}

export interface InstAdminDashboard {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  totalStudents: number;
  policyVersion: number | null;
  syncedDevices: number;
  hasPolicyConfigured: boolean;
}

export interface SuperAdminDashboard {
  totalInstitutions: number;
  activeInstitutions: number;
  suspendedInstitutions: number;
  totalDevices: number;
}

export const APP_CATEGORIES = [
  "SOCIAL_MEDIA",
  "GAMING",
  "ENTERTAINMENT",
  "EDUCATION",
  "PRODUCTIVITY",
  "COMMUNICATION",
  "NEWS",
  "SHOPPING",
  "TRAVEL",
  "FINANCE",
] as const;

export type AppCategory = (typeof APP_CATEGORIES)[number];
