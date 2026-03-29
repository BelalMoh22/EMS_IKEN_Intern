import api from "./axios";
import type {
  Position,
  CreatePositionRequest,
  UpdatePositionRequest,
  ApiResponse,
} from "@/types";

export const positionApi = {
  getAll: () =>
    api.get<ApiResponse<Position[]>>("/positions").then((r) => r.data.data!),

  getById: (id: number) =>
    api
      .get<ApiResponse<Position>>(`/positions/${id}`)
      .then((r) => r.data.data!),

  create: (data: CreatePositionRequest) =>
    api.post<ApiResponse<number>>("/positions", data).then((r) => r.data.data!),

  update: (id: number, data: UpdatePositionRequest) =>
    api.put<ApiResponse<void>>(`/positions/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/positions/${id}`).then((r) => r.data),
};
