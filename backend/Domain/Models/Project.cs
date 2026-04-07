namespace backend.Domain.Models
{
    public class Project : BaseEntity
    {
        private Project() { }

        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int DepartmentId { get; set; }
        public ProjectStatus Status { get; set; } = ProjectStatus.Active;
        public int CreatedBy { get; set; }
        public DateTime? ClosedAt { get; set; }

        public Project(
            string name,
            string description,
            int departmentId,
            int createdBy)
        {
            Name = name;
            Description = description;
            DepartmentId = departmentId;
            CreatedBy = createdBy;

            Status = ProjectStatus.Active;
            CreatedAt = DateTime.UtcNow;
            IsDeleted = false;
        }


        public void Update(
            string? name,
            string? description)
        {
            if (!string.IsNullOrWhiteSpace(name))
                Name = name;

            if (!string.IsNullOrWhiteSpace(description))
                Description = description;
        }

        public void Close()
        {
            if (Status == ProjectStatus.Closed) return;
            Status = ProjectStatus.Closed;
            ClosedAt = DateTime.UtcNow;
        }

        public void Reopen()
        {
            if (Status == ProjectStatus.Active) return;
            Status = ProjectStatus.Active;
            ClosedAt = null;
        }
    }
}
