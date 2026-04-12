import api from "./axios";
import type { ApiResponse } from "@/types";
import type {
  DailyWorkLogDTO,
  DailyWorkLogDetailsDTO,
  CreateWorkLogRequest,
  CreateUpdateDailyWorkLogsRequest,
  UpdateWorkLogRequest,
  WorkLogResponseItemDTO,
  ProjectSummaryDTO,
  EmployeeContributionDTO,
  EmployeeDailyReportDTO,
  WorkLogReportDto,
} from "@/types/worklog";

export const worklogApi = {
  // ─── Employee: Daily Logs ────────────────────────────────

  /** GET /api/worklogs/daily/ */
  getDailyLogs: () =>
    api
      .get<ApiResponse<DailyWorkLogDTO[]>>("/worklogs/daily")
      .then((r) => r.data.data!),

  /** GET /api/worklogs/daily/{date} */
  getDayDetails: (date: string) =>
    api
      .get<ApiResponse<DailyWorkLogDetailsDTO>>(`/worklogs/daily/${date}`)
      .then((r) => r.data.data!),

  /** POST /api/worklogs/daily/ — Bulk save (create / replace) */
  saveDailyLogs: (data: CreateUpdateDailyWorkLogsRequest) =>
    api
      .post<ApiResponse<boolean>>("/worklogs/daily", data)
      .then((r) => r.data),

  // ─── Employee: Single Log CRUD ───────────────────────────

  /** POST /api/worklogs/log/ — Quick add one log */
  createLog: (data: CreateWorkLogRequest) =>
    api
      .post<ApiResponse<number>>("/worklogs/log", data)
      .then((r) => r.data.data!),

  /** PUT /api/worklogs/log/{id} */
  updateLog: (id: number, data: UpdateWorkLogRequest) =>
    api
      .put<ApiResponse<WorkLogResponseItemDTO>>(`/worklogs/log/${id}`, data)
      .then((r) => r.data),

  /** DELETE /api/worklogs/log/{id} */
  deleteLog: (id: number) =>
    api
      .delete<ApiResponse<boolean>>(`/worklogs/log/${id}`)
      .then((r) => r.data),

  /** DELETE /api/worklogs/daily/project/{projectId} */
  deleteProjectLogs: (projectId: number) =>
    api
      .delete<ApiResponse<boolean>>(`/worklogs/daily/project/${projectId}`)
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
      .get<ApiResponse<{ workLogGracePeriod: number; isDisabled: boolean }>>(
        "/settings"
      )
      .then((r) => r.data.data!),

  /** PUT /api/settings */
  updateSettings: (data: { workLogGracePeriod: number }) =>
    api.put<ApiResponse<boolean>>("/settings", data).then((r) => r.data),

  /** DELETE /api/settings */
  disableSettings: () =>
    api.delete<ApiResponse<boolean>>("/settings").then((r) => r.data),
};
