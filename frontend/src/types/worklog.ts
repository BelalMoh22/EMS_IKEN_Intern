// ─── WorkLog Status Enum ─────────────────────────────────
export type WorkStatus = "Todo" | "Done";

export const WORK_STATUS_ENUM_MAP: Record<WorkStatus, number> = {
  Todo: 1,
  Done: 2,
} as const;

export const WORK_STATUS_FROM_NUMBER: Record<number, WorkStatus> = {
  1: "Todo",
  2: "Done",
};

// ─── Employee: Daily Logs List ───────────────────────────
export interface DailyWorkLogDTO {
  date: string;
  totalHours: number;
  projectsCount: number;
}

// ─── Employee: Day Detail ────────────────────────────────
export interface WorkLogResponseItemDTO {
  id: number;
  projectId: number;
  projectName: string;
  hours: number;
  status: number; // WorkStatus enum from backend
  notes: string | null;
}

export interface DailyWorkLogDetailsDTO {
  date: string;
  totalHours: number;
  logs: WorkLogResponseItemDTO[];
}

// ─── Employee: Create Single Log (Quick Add) ─────────────
export interface CreateWorkLogRequest {
  projectId: number;
  workDate: string;
  hours: number;
  status: number;
  notes?: string;
}

// ─── Employee: Save Daily Logs (Bulk) ────────────────────
export interface WorkLogCreateItemDTO {
  projectId: number;
  hours: number;
  status: number;
  notes?: string;
}

export interface CreateUpdateDailyWorkLogsRequest {
  workDate: string;
  logs: WorkLogCreateItemDTO[];
}

// ─── Employee: Update Single Log ─────────────────────────
export interface UpdateWorkLogRequest {
  hours?: number;
  status?: number;
  notes?: string;
}

// ─── Manager: Projects Summary ───────────────────────────
export interface ProjectSummaryDTO {
  projectId: number;
  projectName: string;
  totalHours: number;
}

// ─── Manager: Employee Contributions ─────────────────────
export interface EmployeeContributionDTO {
  employeeId: number;
  employeeName: string;
  totalHours: number;
}

// ─── Manager: Employee Daily Report ──────────────────────
export interface EmployeeDailyReportDTO {
  date: string;
  hours: number;
}
