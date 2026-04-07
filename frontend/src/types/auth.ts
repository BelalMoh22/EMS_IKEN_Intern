// ─── Roles ───────────────────────────────────────────────
export type Role = "HR" | "Manager" | "Employee";

// ─── Auth ────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  role: Role;
  mustChangePassword?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  role: string;
  mustChangePassword: boolean;
}

export type RefreshResponse = AuthTokenPair;

export interface RegisterRequest {
  username: string;
  password: string;
  role: number;
}

export interface RegisterResponse {
  userId: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ─── Role enum mapping helper ────────────────────────────
export const ROLE_ENUM_MAP: Record<Role, number> = {
  HR: 1,
  Manager: 2,
  Employee: 3,
};

export const ROLE_FROM_NUMBER: Record<number, Role> = {
  1: "HR",
  2: "Manager",
  3: "Employee",
};
