import type { User } from "./auth";
import type { Position } from "./position";

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

  salary?: number;
  hireDate?: string;
  status?: number;
  positionId?: number;
  role?: number;
}

// ─── Status enum mapping ─────────────────────────────────
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

// ─── Shift options ────────────────────────────────────────
export const SHIFT_OPTIONS = [
  { label: "7:00 AM", value: 7 },
  { label: "8:00 AM", value: 8 },
  { label: "9:00 AM", value: 9 },
  { label: "10:00 AM", value: 10 },
];
