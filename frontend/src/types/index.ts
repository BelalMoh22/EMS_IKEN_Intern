// ─── Roles ───────────────────────────────────────────────
export type Role = "HR" | "Manager" | "Employee";

// ─── Auth ────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  role: Role;
  mustChangePassword?: boolean; // ? : Optional
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

// ─── Employee ────────────────────────────────────────────
export type EmployeeStatus = "Active" | "Inactive" | "Terminated";

export interface Employee {
  id: number;
  firstName: string;
  lastname: string;
  nationalId: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  salary: number;
  hireDate: string;
  status: EmployeeStatus;
  positionId: number;
  position?: Position | null;
  user?: User | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface EmployeeProfile extends Employee {
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
  status?: number; // 1=Active, 2=Inactive, 3=Terminated
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
  managerId: number | null;
  isActive: boolean | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface CreateDepartmentRequest {
  departmentName: string;
  description?: string;
  managerId?: number | null;
}

export interface UpdateDepartmentRequest {
  departmentName?: string;
  description?: string;
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
  targetEmployeeCount: number;
  currentEmployeeCount: number;
  isFull: boolean;
  createdAt: string;
  isDeleted: boolean;
}

export interface CreatePositionRequest {
  positionName: string;
  minSalary: number;
  maxSalary: number;
  departmentId: number;
  targetEmployeeCount: number;
}

export interface UpdatePositionRequest {
  positionName?: string;
  minSalary?: number;
  maxSalary?: number;
  departmentId?: number;
  targetEmployeeCount?: number;
}

// ─── Attendance ──────────────────────────────────────────
export interface AttendancePreviewDto {
  employeeId: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workingMinutes: number;
  status: string;
  isValid: boolean;
  errors: string[];
}

export interface SyncResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  records: AttendanceRecordDto[];
}

export interface AttendanceRecordDto {
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workingMinutes: number;
  status: string;
}

export interface MyAttendanceRecord {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workingMinutes: number;
}

export interface EmployeeMonthlyAttendanceDto {
  employeeId: number;
  employeeName: string;
  totalLateMinutes: number;
  totalEarlyMinutes: number;
  totalExcuseHours: number;
  deductionHours: number;
  status: string;
  totalWorkingHours: number;
}

export interface MyAttendanceResult {
  records: MyAttendanceRecord[];
  totalLateMinutes: number;
  totalEarlyLeaveMinutes: number;
  totalWorkingMinutes: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
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

export const STATUS_ENUM_MAP: Record<EmployeeStatus, number> = {
  Active: 1,
  Inactive: 2,
  Terminated: 3,
};

export const STATUS_FROM_NUMBER: Record<number, EmployeeStatus> = {
  1: "Active",
  2: "Inactive",
  3: "Terminated",
};

export const SHIFT_OPTIONS = [
  { label: "7:00 AM", value: 7 },
  { label: "8:00 AM", value: 8 },
  { label: "9:00 AM", value: 9 },
  { label: "10:00 AM", value: 10 },
];
