namespace backend.Features.TimeTrack.WorkLogs.Dto_s
{
    public class DailyWorkLogDetailsDTO
    {
        public DateTime Date { get; set; }
        public decimal TotalHours { get; set; }
        public List<WorkLogItemDTO> Logs { get; set; } = new();
    }
}
