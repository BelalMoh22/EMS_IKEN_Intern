namespace backend.Features.Employees.DeleteEmployee
{
    public record DeleteEmployeeCommand(int id): IRequest<EmployeeActionResult>;
}
