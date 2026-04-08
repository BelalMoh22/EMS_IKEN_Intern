namespace backend.Features.TimeTrack.WorkLogs.Dto_s
{
    public class CreateDailyWorkLogsDTO
    {
        public DateTime WorkDate { get; set; }
        public List<ProjectLogItemDTO> Logs { get; set; } = new();
    }
}
