import api from "./axios";
import type { ApiResponse } from "@/types";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/types/project";

export const projectApi = {
  /**
   * GET /api/projects → returns Project[] for the authenticated manager's department
   */
  getAll: (filters?: { month?: number; year?: number; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.month) params.append("month", filters.month.toString());
    if (filters?.year) params.append("year", filters.year.toString());
    if (filters?.status && filters.status !== "All")
      params.append("status", filters.status);

    return api
      .get<ApiResponse<Project[]>>(`/projects?${params.toString()}`)
      .then((r) => r.data.data!);
  },

  /**
   * GET /api/projects/{id}
   */
  getById: (id: number) =>
    api
      .get<ApiResponse<Project>>(`/projects/${id}`)
      .then((r) => r.data.data!),

  /**
   * POST /api/projects → creates project (department auto-assigned server-side)
   */
  create: (data: CreateProjectRequest) =>
    api
      .post<ApiResponse<number>>("/projects", data)
      .then((r) => r.data.data!),

  /**
   * PUT /api/projects/{id}
   */
  update: (id: number, data: UpdateProjectRequest) =>
    api
      .put<ApiResponse<void>>(`/projects/${id}`, data)
      .then((r) => r.data),

  /**
   * DELETE /api/projects/{id}
   */
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/projects/${id}`).then((r) => r.data),

  /**
   * PUT /api/projects/{id}/reopen
   */
  reopen: (id: number) =>
    api
      .put<ApiResponse<void>>(`/projects/${id}/reopen`)
      .then((r) => r.data),

  /**
   * PUT /api/projects/{id}/close
   */
  close: (id: number) =>
    api
      .put<ApiResponse<void>>(`/projects/${id}/close`)
      .then((r) => r.data),
};
