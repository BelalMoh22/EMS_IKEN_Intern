/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { worklogApi } from "@/api/worklogApi";
import type {
  CreateWorkLogRequest,
  CreateUpdateDailyWorkLogsRequest,
  UpdateWorkLogRequest,
} from "@/types/worklog";
import { enqueueSnackbar } from "notistack";
import { extractErrorMessage } from "@/utils/handleApiErrors";

// ─── Employee Hooks ──────────────────────────────────────
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => worklogApi.getSettings(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { workLogGracePeriod: number }) =>
      worklogApi.updateSettings(data),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      enqueueSnackbar(response.message || "Settings updated successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(extractErrorMessage(error, "Failed to update settings"), {
        variant: "error",
      });
    },
  });
}

export function useDailyLogs() {
  return useQuery({
    queryKey: ["worklogs", "daily"],
    queryFn: () => worklogApi.getDailyLogs(),
  });
}

export function useDayDetails(date: string) {
  return useQuery({
    queryKey: ["worklogs", "daily", date],
    queryFn: () => worklogApi.getDayDetails(date),
    enabled: !!date,
  });
}

export function useSaveDailyLogs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUpdateDailyWorkLogsRequest) =>
      worklogApi.saveDailyLogs(data),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: ["worklogs"] });
      enqueueSnackbar(response.message || "Work logs saved successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(extractErrorMessage(error, "Failed to save work logs"), {
        variant: "error",
      });
    },
  });
}

export function useCreateWorkLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkLogRequest) => worklogApi.createLog(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["worklogs"] });
      enqueueSnackbar("Work log added successfully", { variant: "success" });
    },
    onError: (error: any) => {
      enqueueSnackbar(
        extractErrorMessage(error, "Failed to add work log"),
        { variant: "error" }
      );
    },
  });
}

export function useUpdateWorkLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWorkLogRequest }) =>
      worklogApi.updateLog(id, data),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: ["worklogs"] });
      enqueueSnackbar(response.message || "Work log updated successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(
        extractErrorMessage(error, "Failed to update work log"),
        { variant: "error" }
      );
    },
  });
}

export function useDeleteWorkLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => worklogApi.deleteLog(id),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: ["worklogs"] });
      enqueueSnackbar(response.message || "Work log deleted successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(
        extractErrorMessage(error, "Failed to delete work log"),
        { variant: "error" }
      );
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
