// ─── Employee: Timesheet (Monthly) ─────────────────────
export interface MonthlyWorkLogDTO {
  projectId: number;
  projectName: string;
  date: string;
  hours: number;
}

// ─── Employee: Save Timesheet ──────────────────────────
export interface TimesheetEntryDTO {
  projectId: number;
  date: string; // YYYY-MM-DD
  hours: number;
  notes?: string;
}

export interface SaveTimesheetRequest {
  entries: TimesheetEntryDTO[];
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

// ─── Manager: Work Logs Report (Matrix) ────────────────
export interface WorkLogReportDto {
  employeeId: number;
  employeeName: string;
  projectId: number;
  projectName: string;
  totalHours: number;
}
