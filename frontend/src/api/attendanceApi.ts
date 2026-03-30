import api from "./axios";
import type { ApiResponse, AttendancePreviewDto } from "@/types";

export const attendanceApi = {
  /**
   * POST /api/attendance/upload-preview
   * Uploads an Excel/CSV file and returns a validated preview without saving to DB.
   */
  uploadPreview: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ApiResponse<AttendancePreviewDto[]>>(
      "/attendance/upload-preview",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data!;
  },

  /**
   * GET /api/attendance/employees/{id} - stub for future
   */

  /**
   * POST /api/attendance/confirm
   * Sends the reviewed list of valid attendance rows to save to the database.
   */
  confirm: async (rows: AttendancePreviewDto[]) => {
    const response = await api.post<ApiResponse<number>>("/attendance/confirm", rows);
    return response.data;
  },
};
