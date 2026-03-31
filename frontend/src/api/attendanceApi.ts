import api from "./axios";
import type { ApiResponse, AttendancePreviewDto, SyncResult, MyAttendanceResult } from "@/types";

export const attendanceApi = {
  /**
   * POST /api/attendance/sync
   * Validates and saves the data from the static server file directly to the database.
   */
  sync: async () => {
    const response = await api.post<ApiResponse<SyncResult>>(
      "/attendance/sync"
    );
    return response.data;
  },

  /**
   * GET /api/attendance/my
   * Gets the attendance records and summary for the currently logged in employee.
   */
  getMyAttendance: async (year?: number, month?: number, day?: number) => {
    const response = await api.get<ApiResponse<MyAttendanceResult>>("/attendance/my", {
      params: { year, month, day }
    });
    return response.data.data!;
  },
};
