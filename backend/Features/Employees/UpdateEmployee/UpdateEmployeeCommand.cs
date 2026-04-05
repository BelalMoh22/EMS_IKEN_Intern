namespace backend.Features.Employees.UpdateEmployee
{
    public record UpdateEmployeeCommand(int Id, UpdateEmployeeDTO dto) : IRequest<EmployeeActionResult>;

}
