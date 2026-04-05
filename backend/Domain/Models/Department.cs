namespace backend.Domain.Models
{
    public class Department : BaseEntity
    {
        private Department() { }

        public string DepartmentName { get; private set; }
        public string? Description { get; private set; }
        public int? ManagerId { get; private set; }
        public bool? IsActive { get; private set; } = true;

        public Department(string departmentName, string? description, int? managerId)
        {
            DepartmentName = departmentName;
            Description = description ?? string.Empty;
            ManagerId = managerId;
        }

        public void Update(string? departmentName, string? description, int? managerId , bool? isActive)
        {
            DepartmentName = departmentName ?? DepartmentName;
            Description = description ?? Description;
            ManagerId = managerId;
            IsActive = isActive ?? IsActive;
        }
    }
}
