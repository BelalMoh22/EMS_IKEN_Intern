import api from "./axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
  ApiResponse,
} from "@/types";

export const authApi = {
  /**
   * POST /api/auth/login
   * Body: { username, password }
   * Returns: { accessToken, refreshToken, id, username, role, mustChangePassword }
   */
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>("/auth/login", data).then((r) => {
      if (!r.data.data)
        throw new Error(r.data.message || "No data returned from server");
      return r.data.data;
    }),

  /**
   * POST /api/auth/register (HR-only: creates a user/employee account)
   * Body: { username, password, role }
   * Returns: { userId }
   */
  register: (data: RegisterRequest) =>
    api
      .post<ApiResponse<RegisterResponse>>("/auth/register", data)
      .then((r) => {
        if (!r.data.data)
          throw new Error(r.data.message || "No data returned from server");
        return r.data.data;
      }),

  /**
   * PUT /api/auth/change-password (requires JWT)
   * Body: { currentPassword, newPassword, confirmPassword }
   * userId is extracted from JWT on the server side
   */
  changePassword: (data: ChangePasswordRequest) =>
    api
      .put<ApiResponse<null>>("/auth/change-password", data)
      .then((r) => r.data),
};
