namespace backend.Features.Departments.UpdateDepartment
{
    public class UpdateDepartmentDto
    {
        public string? DepartmentName { get; set; }

        public string? Description { get; set; } = string.Empty;

        public bool? IsActive { get; set; }
    }
}
