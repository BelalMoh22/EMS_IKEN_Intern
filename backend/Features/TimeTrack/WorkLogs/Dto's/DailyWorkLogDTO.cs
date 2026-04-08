namespace backend.Features.TimeTrack.WorkLogs.Dto_s
{
    public class DailyWorkLogDTO
    {
        public DateTime Date { get; set; }
        public decimal TotalHours { get; set; }
        public int ProjectsCount { get; set; }
    }
}
// Table row in UI