namespace backend.Features.TimeTrack.WorkLogs.Dto_s
{
    public class WorkLogItemDTO
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public decimal Hours { get; set; }
        public WorkStatus Status { get; set; }
        public string? Notes { get; set; }
    }
}
