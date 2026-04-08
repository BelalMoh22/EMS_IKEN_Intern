namespace backend.Features.TimeTrack.WorkLogs.Dto_s
{
    public class CreateWorkLogDTO
    {
        [Required(ErrorMessage = "Project ID is required")]
        public int ProjectId { get; set; }

        [Required(ErrorMessage = "Work date is required")]
        public DateTime WorkDate { get; set; }

        [Required(ErrorMessage = "Hours are required")]
        [Range(0.01, 24, ErrorMessage = "Hours must be between 0.01 and 24")]
        public decimal Hours { get; set; }

        [Required(ErrorMessage = "Status is required")]
        public WorkStatus Status { get; set; }

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }
    }
}
// User adds ONE project to a day