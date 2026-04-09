namespace backend.Features.TimeTrack.WorkLogs.UpdateProjectWorkLog
{
    public class UpdateWorkLogDTO
    {
        [Range(0.01, 24, ErrorMessage = "Hours must be between 0.01 and 24")]
        public decimal? Hours { get; set; }

        public WorkStatus? Status { get; set; }

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }
    }
}
// User edits ONE project