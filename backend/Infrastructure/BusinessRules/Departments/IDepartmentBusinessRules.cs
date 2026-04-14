namespace backend.Infrastructure.BusinessRules.Departments
{
    public interface IDepartmentBusinessRules
    {
        Task ValidateForCreateAsync(CreateDepartmentDto dto);
        Task ValidateForUpdateAsync(int departmentId, UpdateDepartmentDto dto, Department existingDepartment);
        Task ValidateForDeleteAsync(int departmentId);
    }
}
