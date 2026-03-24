namespace EmployeeService.Features.Employees.GetEmployeeByUserId
{
    public record GetEmployeeByUserIdQuery(int UserId) : IRequest<EmployeeProfileDto?>;
}
