/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worklogApi } from "@/api/worklogApi";
import type { SaveTimesheetRequest } from "@/types/worklog";

// ─── Shared/Settings Hooks ─────────────────────────────────
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => worklogApi.getSettings(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { workLogGracePeriod: number }) =>
      worklogApi.updateSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useDisableSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => worklogApi.disableSettings(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

// ─── Employee Hooks (Timesheet) ─────────────────────────────
export function useMonthlyLogs(year: number, month: number) {
  return useQuery({
    queryKey: ["worklogs", "monthly", year, month],
    queryFn: () => worklogApi.getMonthlyLogs(year, month),
    enabled: !!year && !!month,
  });
}

export function useSaveTimesheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveTimesheetRequest) => worklogApi.saveTimesheet(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["worklogs"] });
    },
  });
}

// ─── Manager Hooks ───────────────────────────────────────
export function useProjectsSummary() {
  return useQuery({
    queryKey: ["worklogs", "projects-summary"],
    queryFn: () => worklogApi.getProjectsSummary(),
  });
}

export function useProjectEmployees(projectId: number) {
  return useQuery({
    queryKey: ["worklogs", "project-employees", projectId],
    queryFn: () => worklogApi.getProjectEmployees(projectId),
    enabled: !!projectId,
  });
}

export function useEmployeeReport(projectId: number, employeeId: number) {
  return useQuery({
    queryKey: ["worklogs", "employee-report", projectId, employeeId],
    queryFn: () => worklogApi.getEmployeeReport(projectId, employeeId),
    enabled: !!projectId && !!employeeId,
  });
}

export function useReportsData(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["worklogs", "reports-matrix", startDate, endDate],
    queryFn: () => worklogApi.getWorkLogsReport(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

