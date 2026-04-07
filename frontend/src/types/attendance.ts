// ─── Attendance ──────────────────────────────────────────
export interface AttendancePreviewDto {
  employeeId: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workingMinutes: number;
  status: string;
  isValid: boolean;
  errors: string[];
}

export interface SyncResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  records: AttendanceRecordDto[];
}

export interface AttendanceRecordDto {
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workingMinutes: number;
  status: string;
}

export interface MyAttendanceRecord {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workingMinutes: number;
}

export interface EmployeeMonthlyAttendanceDto {
  employeeId: number;
  employeeName: string;
  totalLateMinutes: number;
  totalEarlyMinutes: number;
  totalExcuseHours: number;
  deductionHours: number;
  status: string;
  totalWorkingHours: number;
}

export interface MyAttendanceResult {
  records: MyAttendanceRecord[];
  totalLateMinutes: number;
  totalEarlyLeaveMinutes: number;
  totalWorkingMinutes: number;
}
