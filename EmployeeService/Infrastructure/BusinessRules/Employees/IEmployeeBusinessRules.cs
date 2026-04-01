namespace EmployeeService.Infrastructure.BusinessRules.Employees
{
    public interface IEmployeeBusinessRules
    {
        Task ValidateForCreateAsync(CreateEmployeeDTO dto);
        Task ValidateForUpdateAsync(int employeeId, UpdateEmployeeDTO dto, Employee existingEmployee);
        Task<List<string>> HandleManagerRemovalAsync(int employeeId);
    }
}