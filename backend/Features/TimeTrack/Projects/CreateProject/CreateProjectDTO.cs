namespace backend.Features.TimeTrack.Projects.CreateProject
{
    public class CreateProjectDTO
    {
        [Required(ErrorMessage = "Project name is required.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Project name must be between 3 and 100 characters.")]
        public string Name { get; set; } = default!;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Department is required.")]
        public int DepartmentId { get; set; }

        [Required(ErrorMessage = "Month is required.")]
        [Range(1, 12, ErrorMessage = "Month must be between 1 and 12.")]
        public int Month { get; set; }

        [Required(ErrorMessage = "Year is required.")]
        public int Year { get; set; }
    }
}