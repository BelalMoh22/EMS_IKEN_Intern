using backend.Infrastructure.Repositories;

namespace backend.Infrastructure.BusinessRules.Departments
{
    public class DepartmentBusinessRules : BaseBusinessRules, IDepartmentBusinessRules
    {
        private readonly IRepository<Department> _departmentRepository;
        private readonly IRepository<Employee> _employeeRepository;

        public DepartmentBusinessRules(
            IRepository<Department> departmentRepository,
            IRepository<Employee> employeeRepository
            )
        {
            _departmentRepository = departmentRepository;
            _employeeRepository = employeeRepository;
        }

        public async Task ValidateForCreateAsync(CreateDepartmentDto dto)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            if (await _departmentRepository.ExistsAsync(d => d.DepartmentName == dto.DepartmentName))
                AddError(errors, "departmentName", "Department name already exists.");

            if (dto.ManagerId.HasValue)
            {
                var manager = await _employeeRepository.GetByIdAsync(dto.ManagerId.Value);
                if (manager is null)
                    AddError(errors, "managerId", "Manager does not exist.");
            }

            ThrowIfAny(errors);
        }

        public async Task ValidateForUpdateAsync(int id, UpdateDepartmentDto dto, Department existing)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            var name = dto.DepartmentName ?? existing.DepartmentName;

            if (await _departmentRepository.ExistsAsync(d => d.DepartmentName == name && d.Id != id))
                AddError(errors, "departmentName", "Department name already exists.");

            var managerId = dto.ManagerId ?? existing.ManagerId;
            if (managerId.HasValue)
            {
                var manager = await _employeeRepository.GetByIdAsync(managerId.Value);
                if (manager is null)
                    AddError(errors, "managerId", "Manager does not exist.");
            }

            ThrowIfAny(errors);
        }
    }
}