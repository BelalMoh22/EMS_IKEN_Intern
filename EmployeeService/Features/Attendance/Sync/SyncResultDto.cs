namespace EmployeeService.Features.Attendance.Sync
{
    public class SyncResultDto
    {
        public int Inserted { get; set; }
        public int Updated { get; set; }
        public int Skipped { get; set; }
        public List<string> Errors { get; set; } = [];
        public List<AttendanceRecordDto> Records { get; set; } = [];
    }

    public class AttendanceRecordDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string? CheckIn { get; set; }
        public string? CheckOut { get; set; }
        public int LateMinutes { get; set; }
        public int EarlyLeaveMinutes { get; set; }
        public int WorkingMinutes { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
