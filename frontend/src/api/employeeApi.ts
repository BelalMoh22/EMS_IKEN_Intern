import api from "./axios";
import type {
  Employee,
  EmployeeProfile,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  ApiResponse,
} from "@/types";

export const employeeApi = {
  /**
   * GET /api/employees → returns Employee[] (no pagination from backend)
   */
  getAll: () =>
    api.get<ApiResponse<Employee[]>>("/employees").then((r) => r.data.data!),

  /**
   * GET /api/employees/{id}
   */
  getById: (id: number) =>
    api.get<ApiResponse<Employee>>(`/employees/${id}`).then((r) => r.data.data!),

  /**
   * GET /api/employees/by-user/{userId}
   * Fetches the mapped employee profile for the authenticated User
   */
  getByUserId: (userId: number) =>
    api.get<ApiResponse<EmployeeProfile>>(`/employees/by-user/${userId}`).then((r) => r.data.data!),

  /**
   * POST /api/employees → creates employee record
   * Returns ApiResponse wrapper with created ID
   */
  create: (data: CreateEmployeeRequest) =>
    api.post<ApiResponse<number>>("/employees", data).then((r) => r.data.data!),

  /**
   * PUT /api/employees/{id}
   */
  update: (id: number, data: UpdateEmployeeRequest) =>
    api.put<ApiResponse<void>>(`/employees/${id}`, data).then((r) => r.data.data!),

  /**
   * DELETE /api/employees/{id}
   */
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/employees/${id}`).then((r) => r.data.data!),
};
