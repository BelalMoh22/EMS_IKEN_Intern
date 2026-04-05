namespace backend.Features.Attendance.MyAttendance
{
    public class MyAttendanceRecordDto
    {
        public string Date { get; set; } = string.Empty;
        public string? CheckIn { get; set; }
        public string? CheckOut { get; set; }
        public string Status { get; set; } = string.Empty;
        public int LateMinutes { get; set; }
        public int EarlyLeaveMinutes { get; set; }
        public int WorkingMinutes { get; set; }
    }

    public class MyAttendanceResultDto
    {
        public List<MyAttendanceRecordDto> Records { get; set; } = [];
        public int TotalLateMinutes { get; set; }
        public int TotalEarlyLeaveMinutes { get; set; }
        public int TotalWorkingMinutes { get; set; }
    }
}
