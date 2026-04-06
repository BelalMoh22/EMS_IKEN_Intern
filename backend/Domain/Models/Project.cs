namespace backend.Domain.Models
{
    public class Project : BaseEntity
    {
        private Project() { }

        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int DepartmentId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public ProjectStatus Status { get; set; } = ProjectStatus.Active;
        public int CreatedBy { get; set; }
        public DateTime? ClosedAt { get; set; }

        public Project(
            string name,
            string description,
            int departmentId,
            int month,
            int year,
            int createdBy)
        {
            Name = name;
            Description = description;
            DepartmentId = departmentId;
            Month = month;
            Year = year;
            CreatedBy = createdBy;

            Status = ProjectStatus.Active;
            CreatedAt = DateTime.UtcNow;
            IsDeleted = false;
        }


        public void Update(
            string? name,
            string? description,
            int? month,
            int? year)
        {
            if (!string.IsNullOrWhiteSpace(name))
                Name = name;

            if (!string.IsNullOrWhiteSpace(description))
                Description = description;

            if (month.HasValue)
                Month = month.Value;

            if (year.HasValue)
                Year = year.Value;
        }
    }
}
