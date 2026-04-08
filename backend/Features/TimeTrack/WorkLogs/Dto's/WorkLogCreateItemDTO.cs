namespace backend.Features.TimeTrack.WorkLogs.Dto_s
{
    public class WorkLogCreateItemDTO
    {
        [Required(ErrorMessage = "Project ID is required")]
        public int ProjectId { get; set; }

        [Required(ErrorMessage = "Hours are required")]
        [Range(0.01, 24, ErrorMessage = "Hours must be between 0.01 and 24")]
        public decimal Hours { get; set; }

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }
    }
}
// One project inside a day