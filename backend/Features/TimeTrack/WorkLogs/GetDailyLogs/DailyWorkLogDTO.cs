namespace backend.Features.TimeTrack.WorkLogs.GetDailyLogs
{
    public class DailyWorkLogDTO
    {
        public DateTime Date { get; set; }
        public decimal TotalHours { get; set; }
        public int ProjectsCount { get; set; }
        public string? ProjectDetails { get; set; }
    }
}
// Table row in UI