namespace backend.Features.Employees.GetEmployees
{
    public record GetEmployeesQuery(int UserId, string UserRole) : IRequest<IEnumerable<Employee>>;
}
