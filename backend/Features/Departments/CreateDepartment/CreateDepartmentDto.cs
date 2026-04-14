namespace backend.Features.Departments.CreateDepartment
{
    public class CreateDepartmentDto
    {
        [Required(ErrorMessage = "Department name is required.")]
        public string DepartmentName { get; set; }

        public string? Description { get; set; } = string.Empty;
    }
}
