namespace EmployeeService.Features.Departments.GetDepartments
{
    public record GetDepartmentsQuery(int UserId, string UserRole) : IRequest<IEnumerable<Department>>;
}
