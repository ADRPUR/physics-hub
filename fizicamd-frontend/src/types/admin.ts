import type { RoleCode } from "./user";

export interface UserListItem {
  id: string;
  email: string;
  status: "ACTIVE" | "PENDING" | "DISABLED";
  primaryRole: RoleCode;
  roles: RoleCode[];
  firstName?: string;
  lastName?: string;
  phone?: string;
  gradeLevel?: string;
  school?: string;
  createdAt?: string;
  lastLoginAt?: string;
  lastSeenAt?: string;
}

export interface UserUpsertPayload {
  email: string;
  password?: string;
  roles: RoleCode[];
  firstName?: string;
  lastName?: string;
  phone?: string;
  school?: string;
  gradeLevel?: string;
  status?: "ACTIVE" | "PENDING" | "DISABLED";
}

export interface ServerMetricSample {
  capturedAt: string;
  heapUsedBytes: number;
  heapMaxBytes: number;
  systemMemoryTotalBytes: number;
  systemMemoryUsedBytes: number;
  diskTotalBytes: number;
  diskUsedBytes: number;
  processCpuLoad?: number | null;
  systemCpuLoad?: number | null;
}
