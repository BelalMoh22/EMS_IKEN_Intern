/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "@/api/projectApi";
import type { CreateProjectRequest, UpdateProjectRequest } from "@/types/project";
import { enqueueSnackbar } from "notistack";
import { extractErrorMessage } from "@/utils/handleApiErrors";

export function useProjects(filters?: { month?: number; year?: number; status?: string }) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => projectApi.getAll(filters),
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectApi.getById(id),
    enabled: !!id, //Prevents query from running if id = 0 or undefined
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] }); // "Projects list is outdated → refetch it"
      enqueueSnackbar("Project created successfully", { variant: "success" });
    },
    onError: (error: any) => {
      enqueueSnackbar(extractErrorMessage(error, "Failed to create project"), { variant: "error" });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectRequest }) => projectApi.update(id, data),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      enqueueSnackbar(response.message || "Project updated successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(extractErrorMessage(error, "Failed to update project"), { variant: "error" });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectApi.delete(id),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      enqueueSnackbar(response.message || "Project deleted successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(extractErrorMessage(error, "Failed to delete project"), { variant: "error" });
    },
  });
}

export function useReopenProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectApi.reopen(id),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      enqueueSnackbar(response.message || "Project reopened successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(extractErrorMessage(error, "Failed to reopen project"), { variant: "error" });
    },
  });
}

export function useCloseProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectApi.close(id),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      enqueueSnackbar(response.message || "Project closed successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(extractErrorMessage(error, "Failed to close project"), { variant: "error" });
    },
  });
}

