namespace backend.Domain.Models
{
    public class Project : BaseEntity
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        public int DepartmentId { get; set; }

        public int Month { get; set; }
        public int Year { get; set; }

        public ProjectStatus Status { get; set; } = ProjectStatus.Active;

        public int CreatedBy { get; set; }

        public DateTime? ClosedAt { get; set; }
    }
}
