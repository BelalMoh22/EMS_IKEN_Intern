import api from "./axios";
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  ApiResponse,
} from "@/types";

export const departmentApi = {
  getAll: () =>
    api
      .get<ApiResponse<Department[]>>("/departments")
      .then((r) => r.data.data!),

  getById: (id: number) =>
    api
      .get<ApiResponse<Department>>(`/departments/${id}`)
      .then((r) => r.data.data!),

  create: (data: CreateDepartmentRequest) =>
    api
      .post<ApiResponse<number>>("/departments", data)
      .then((r) => r.data.data!),

  update: (id: number, data: UpdateDepartmentRequest) =>
    api.put<ApiResponse<void>>(`/departments/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/departments/${id}`).then((r) => r.data),
};
