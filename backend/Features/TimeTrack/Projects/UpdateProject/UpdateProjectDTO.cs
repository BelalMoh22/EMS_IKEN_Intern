namespace backend.Features.TimeTrack.Projects.UpdateProject
{
    public class UpdateProjectDTO
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [Range(1, 12)]
        public int? Month { get; set; }

        public int? Year { get; set; }
    }
}
