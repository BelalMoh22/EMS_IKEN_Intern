namespace backend.Features.TimeTrack.WorkLogs.Dto_s
{
    public class ProjectLogItemDTO
    {
        public int ProjectId { get; set; }
        public decimal Hours { get; set; }
        public string? Notes { get; set; }
    }
}
