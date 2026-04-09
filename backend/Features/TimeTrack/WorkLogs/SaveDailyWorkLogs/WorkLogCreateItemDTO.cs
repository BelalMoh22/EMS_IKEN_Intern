namespace backend.Features.TimeTrack.WorkLogs.SaveDailyWorkLogs
{
    public class WorkLogCreateItemDTO
    {
        [Required(ErrorMessage = "Project ID is required")]
        public int ProjectId { get; set; }

        [Required(ErrorMessage = "Hours are required")]
        public decimal Hours { get; set; }

        [Required(ErrorMessage = "Status is required")]
        public WorkStatus Status { get; set; }

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }
    }
}
// One project inside a day