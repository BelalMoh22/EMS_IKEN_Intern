namespace backend.Features.TimeTrack.WorkLogs.Dto_s
{
    public class ProjectSummaryDTO
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public decimal TotalHours { get; set; }
    }
}
