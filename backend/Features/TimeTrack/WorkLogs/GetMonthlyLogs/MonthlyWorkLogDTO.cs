namespace backend.Features.TimeTrack.WorkLogs.GetMonthlyLogs
{
    public class MonthlyWorkLogDTO
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public decimal Hours { get; set; }
    }
}
