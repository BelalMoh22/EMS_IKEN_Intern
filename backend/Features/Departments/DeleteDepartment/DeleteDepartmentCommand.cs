namespace backend.Features.Departments.DeleteDepartment
{
    public record DeleteDepartmentCommand(int id) : IRequest<int>;
}
