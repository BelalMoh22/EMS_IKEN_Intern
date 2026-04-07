namespace backend.Features.TimeTrack.Projects.GetFilteredProjects
{
    public class ProjectListDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public ProjectStatus Status { get; set; }
        public int DepartmentId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
