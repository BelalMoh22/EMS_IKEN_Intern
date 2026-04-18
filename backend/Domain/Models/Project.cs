namespace backend.Domain.Models
{
    public class Project : BaseEntity
    {
        private Project() { }

        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int DepartmentId { get; set; }
        public ProjectStatus Status { get; set; } = ProjectStatus.Open;
        public int CreatedBy { get; set; }
        public DateTime? ClosedAt { get; set; }
        
        public Project(
            string name,
            string description,
            int departmentId,
            int createdBy)
        {
            Name = name;
            Description = description ?? string.Empty;
            DepartmentId = departmentId;
            CreatedBy = createdBy;

            Status = ProjectStatus.Open;
            CreatedAt = DateTime.UtcNow;
            IsDeleted = false;
        }


        public void Update(
            string? name,
            string? description,
            ProjectStatus? status = null)
        {
            Name = name ?? Name;
            Description = description ?? Description;
            if (status.HasValue)
            {
                Status = status.Value;
                if (status.Value == ProjectStatus.Completed)
                {
                    ClosedAt = DateTime.UtcNow;
                }
                else
                {
                    ClosedAt = null;
                }
            }
        }

        public void Complete()
        {
            if (Status == ProjectStatus.Completed) return;
            Status = ProjectStatus.Completed;
            ClosedAt = DateTime.UtcNow;
        }

        public void Reopen()
        {
            if (Status == ProjectStatus.Open) return;
            Status = ProjectStatus.Open;
            ClosedAt = null;
        }
    }
}
