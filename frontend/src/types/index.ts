// ─── Roles ───────────────────────────────────────────────
export type Role = "Admin" | "HR" | "Manager" | "Employee";

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

/** Backend returns { token: { accessToken, refreshToken } } from /login */
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

/** /auth/refresh returns { accessToken, refreshToken } directly */
export type RefreshResponse = AuthTokenPair;

export interface RegisterRequest {
  username: string;
  password: string;
  role: number; // 1=Admin, 2=HR, 3=Manager, 4=Employee
}

export interface RegisterResponse {
  userId: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── Employee ────────────────────────────────────────────
export type EmployeeStatus = "Active" | "Inactive" | "Suspended" | "Terminated";

export interface Employee {
  id: number;
  firstName: string;
  lastname: string;        // backend uses "lastname" (lowercase 'n')
  nationalId: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  salary: number;
  hireDate: string;
  status: EmployeeStatus | null;
  positionId: number;
  position?: Position | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface EmployeeProfile extends Omit<Employee, 'status'> {
  status: number;
  positionName: string;
  departmentName: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastname: string;
  nationalId: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  salary: number;
  hireDate?: string;
  status?: number;    // 1=Active, 2=Inactive, 3=Suspended, 4=Terminated
  positionId: number;
  username: string;
  password: string;
  role: number;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastname?: string;
  nationalId?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  salary?: number;
  hireDate?: string;
  status?: number;
  positionId?: number;
}

// ─── Department ──────────────────────────────────────────
export interface Department {
  id: number;
  departmentName: string;
  description: string | null;
  email: string;
  managerId: number | null;
  isActive: boolean | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface CreateDepartmentRequest {
  departmentName: string;
  description?: string;
  email: string;
  managerId?: number | null;
}

export interface UpdateDepartmentRequest {
  departmentName?: string;
  description?: string;
  email?: string;
  managerId?: number | null;
  isActive?: boolean;
}

// ─── Position ────────────────────────────────────────────
export interface Position {
  id: number;
  positionName: string;
  minSalary: number;
  maxSalary: number;
  departmentId: number;
  createdAt: string;
  isDeleted: boolean;
}

export interface CreatePositionRequest {
  positionName: string;
  minSalary: number;
  maxSalary: number;
  departmentId: number;
}

export interface UpdatePositionRequest {
  positionName?: string;
  minSalary?: number;
  maxSalary?: number;
  departmentId?: number;
}

// ─── API Response wrapper (backend uses ApiResponse<T>) ──
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// ─── Role enum mapping helper ────────────────────────────
export const ROLE_ENUM_MAP: Record<Role, number> = {
  Admin: 1,
  HR: 2,
  Manager: 3,
  Employee: 4,
};

export const ROLE_FROM_NUMBER: Record<number, Role> = {
  1: "Admin",
  2: "HR",
  3: "Manager",
  4: "Employee",
};

export const STATUS_ENUM_MAP: Record<EmployeeStatus, number> = {
  Active: 1,
  Inactive: 2,
  Suspended: 3,
  Terminated: 4,
};

export const STATUS_FROM_NUMBER: Record<number, EmployeeStatus> = {
  1: "Active",
  2: "Inactive",
  3: "Suspended",
  4: "Terminated",
};
