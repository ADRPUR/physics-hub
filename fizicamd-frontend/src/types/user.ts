export type RoleCode = "ADMIN" | "TEACHER" | "STUDENT";

export interface Profile {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  school?: string;
  gradeLevel?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface User {
  id: string;
  email: string;
  role: RoleCode;
  roles: RoleCode[];
  status: "ACTIVE" | "PENDING" | "DISABLED";
  profile?: Profile;
  lastLoginAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  phone?: string;
  school?: string;
  gradeLevel?: string;
  role?: RoleCode;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  school?: string;
  gradeLevel?: string;
  bio?: string;
}

export interface ProfileResponse {
  user: User;
}

export interface MeResponse {
  user: User;
}
