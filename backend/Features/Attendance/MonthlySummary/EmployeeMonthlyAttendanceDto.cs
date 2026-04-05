namespace backend.Features.Attendance.MonthlySummary
{
    public class EmployeeMonthlyAttendanceDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int TotalLateMinutes { get; set; }
        public int TotalEarlyMinutes { get; set; }
        public double TotalExcuseHours { get; set; }
        public double DeductionHours { get; set; }
        public string Status { get; set; } = "No Deduction";
        public double TotalWorkingHours { get; set; }
    }
}
