namespace backend.Infrastructure.BusinessRules.Employees
{
    public interface IEmployeeBusinessRules
    {
        Task ValidateForCreateAsync(CreateEmployeeDTO dto);
        Task ValidateForUpdateAsync(int employeeId, UpdateEmployeeDTO dto, Employee existingEmployee);
        Task<string?> HandleManagerRemovalAsync(int employeeId);
    }
}