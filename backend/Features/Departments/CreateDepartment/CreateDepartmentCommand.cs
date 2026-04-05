namespace backend.Features.Departments.CreateDepartment
{
    public record CreateDepartmentCommand(CreateDepartmentDto dto) : IRequest<int>;
}
