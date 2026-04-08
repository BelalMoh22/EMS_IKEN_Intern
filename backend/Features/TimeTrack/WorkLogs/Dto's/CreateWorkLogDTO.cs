namespace backend.Features.TimeTrack.WorkLogs.Dto_s
{
    public class CreateWorkLogDTO
    {
        public int ProjectId { get; set; }
        public DateTime WorkDate { get; set; }
        public decimal Hours { get; set; }
        public string? Notes { get; set; }
    }
}
