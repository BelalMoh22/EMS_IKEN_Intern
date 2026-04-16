import api from "./axios";
import type { ApiResponse } from "@/types";
import type {
  MonthlyWorkLogDTO,
  SaveTimesheetRequest,
  ProjectSummaryDTO,
  EmployeeContributionDTO,
  EmployeeDailyReportDTO,
  WorkLogReportDto,
} from "@/types/worklog";

export const worklogApi = {
  // ─── Employee: Timesheet ────────────────────────────────

  /** GET /api/worklogs/month?year=YYYY&month=MM */
  getMonthlyLogs: (year: number, month: number) =>
    api
      .get<ApiResponse<MonthlyWorkLogDTO[]>>(`/worklogs/month?year=${year}&month=${month}`)
      .then((r) => r.data.data!),

  /** POST /api/worklogs/daily/ — Timesheet Save (UPSERT) */
  saveTimesheet: (data: SaveTimesheetRequest) =>
    api
      .post<ApiResponse<boolean>>("/worklogs", data) // Fixed base path: backend is group.MapPost("/") in WorkLogs group
      .then((r) => r.data),

  // ─── Manager: Reports ────────────────────────────────────

  /** GET /api/worklogs/projects/summary */
  getProjectsSummary: () =>
    api
      .get<ApiResponse<ProjectSummaryDTO[]>>("/worklogs/projects/summary")
      .then((r) => r.data.data!),

  /** GET /api/worklogs/projects/{projectId}/employees */
  getProjectEmployees: (projectId: number) =>
    api
      .get<ApiResponse<EmployeeContributionDTO[]>>(
        `/worklogs/projects/${projectId}/employees`
      )
      .then((r) => r.data.data!),

  /** GET /api/worklogs/projects/{projectId}/employees/{employeeId}/report */
  getEmployeeReport: (projectId: number, employeeId: number) =>
    api
      .get<ApiResponse<EmployeeDailyReportDTO[]>>(
        `/worklogs/projects/${projectId}/employees/${employeeId}/report`
      )
      .then((r) => r.data.data!),

  /** GET /api/worklogs/report */
  getWorkLogsReport: (startDate: string, endDate: string) =>
    api
      .get<ApiResponse<WorkLogReportDto[]>>(
        `/worklogs/report?startDate=${startDate}&endDate=${endDate}`
      )
      .then((r) => r.data.data!),

  // ─── Settings ────────────────────────────────────────────
  /** GET /api/settings */
  getSettings: () =>
    api
      .get<ApiResponse<{ workLogGracePeriodDays: number; reminderTime: string; isReminderEnabled: boolean; isDeleted: boolean }>>(
        "/settings"
      )
      .then((r) => r.data.data!),

  /** PUT /api/settings */
  updateSettings: (data: { workLogGracePeriodDays: number; reminderTime: string; isReminderEnabled: boolean }) =>
    api.put<ApiResponse<boolean>>("/settings", data).then((r) => r.data),

  /** DELETE /api/settings */
  disableSettings: () =>
    api.delete<ApiResponse<boolean>>("/settings").then((r) => r.data),
};
