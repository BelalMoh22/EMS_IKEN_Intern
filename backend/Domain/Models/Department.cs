namespace backend.Domain.Models
{
    public class Department : BaseEntity
    {
        private Department() { }

        public string DepartmentName { get; private set; }
        public string? Description { get; private set; }
        public bool? IsActive { get; private set; } = true;

        public Department(string departmentName, string? description)
        {
            DepartmentName = departmentName;
            Description = description ?? string.Empty;
        }

        public void Update(string? departmentName, string? description, bool? isActive)
        {
            DepartmentName = departmentName ?? DepartmentName;
            Description = description ?? Description;
            IsActive = isActive ?? IsActive;
        }
    }
}
