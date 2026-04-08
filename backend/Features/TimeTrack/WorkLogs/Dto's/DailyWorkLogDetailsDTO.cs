namespace backend.Features.TimeTrack.WorkLogs.Dto_s
{
    public class DailyWorkLogDetailsDTO
    {
        public DateTime Date { get; set; }
        public decimal TotalHours { get; set; }
        public List<WorkLogResponseItemDTO> Logs { get; set; } = new();
    }
}
// Full day details (edit screen)