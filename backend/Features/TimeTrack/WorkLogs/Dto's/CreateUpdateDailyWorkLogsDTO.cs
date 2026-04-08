namespace backend.Features.TimeTrack.WorkLogs.Dto_s
{
    public class CreateUpdateDailyWorkLogsDTO
    {
        [Required(ErrorMessage = "Work date is required")]
        public DateTime WorkDate { get; set; }

        [Required(ErrorMessage = "At least one work log is required")]
        [MinLength(1, ErrorMessage = "At least one work log is required")]
        public List<WorkLogCreateItemDTO> Logs { get; set; } = new();
    }
}
// User is submitting a full day and User edits full day