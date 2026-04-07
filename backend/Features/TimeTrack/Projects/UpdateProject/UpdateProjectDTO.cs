namespace backend.Features.TimeTrack.Projects.UpdateProject
{
    public class UpdateProjectDTO
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public Domain.Enums.ProjectStatus? Status { get; set; }
    }
}
