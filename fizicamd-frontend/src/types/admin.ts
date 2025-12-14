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
