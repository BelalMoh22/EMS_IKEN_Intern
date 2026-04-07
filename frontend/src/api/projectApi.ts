import api from "./axios";
import type { ApiResponse } from "@/types";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/types/project";

export const projectApi = {
  getAll: (filters?: { month?: number; year?: number; status?: string }) => {
    const params = new URLSearchParams(); // Creates a query string builder , Helps generate URLs like: ?param1=value1&param2=value2
    if (filters?.month) // filter?.month is a nullish coalescing operator : Prevents crash if filters is undefined
      params.append("month", filters.month.toString());

    if (filters?.year) 
      params.append("year", filters.year.toString());

    if (filters?.status && filters.status !== "All")
      params.append("status", filters.status);

    return api
      .get<ApiResponse<Project[]>>(`/projects?${params.toString()}`)
      .then((r) => r.data.data!);
  },

  getById: (id: number) =>
    api.get<ApiResponse<Project>>(`/projects/${id}`).then((r) => r.data.data!),

  create: (data: CreateProjectRequest) =>
    api.post<ApiResponse<number>>("/projects", data).then((r) => r.data.data!), // Extracts the actual project

  update: (id: number, data: UpdateProjectRequest) =>
    api.put<ApiResponse<void>>(`/projects/${id}`, data).then((r) => r.data), // Returns full response (not just data) : Because no actual data is returned (void)

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/projects/${id}`).then((r) => r.data),

  reopen: (id: number) =>
    api.put<ApiResponse<void>>(`/projects/${id}/reopen`).then((r) => r.data),

  close: (id: number) =>
    api.put<ApiResponse<void>>(`/projects/${id}/close`).then((r) => r.data),
};
