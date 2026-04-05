namespace backend.Features.Attendance.Sync
{
    public class SyncResultDto
    {
        public int Inserted { get; set; }
        public int Updated { get; set; }
        public int Skipped { get; set; }
        public List<string> Errors { get; set; } = [];
        public List<AttendanceRecordDto> Records { get; set; } = [];
    }
}
