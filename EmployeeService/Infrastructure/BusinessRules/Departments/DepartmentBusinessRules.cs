using EmployeeService.Infrastructure.Repositories;

namespace EmployeeService.Infrastructure.BusinessRules.Departments
{
    public class DepartmentBusinessRules : BaseBusinessRules, IDepartmentBusinessRules
    {
        private readonly IRepository<Department> _departmentRepository;
        private readonly IRepository<Employee> _employeeRepository;
        private readonly IRepository<Position> _positionRepository;

        public DepartmentBusinessRules(
            IRepository<Department> departmentRepository,
            IRepository<Employee> employeeRepository,
            IRepository<Position> positionRepository
            )
        {
            _departmentRepository = departmentRepository;
            _employeeRepository = employeeRepository;
            _positionRepository = positionRepository;
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

        public async Task ValidateForDeleteAsync(int departmentId)
        {
            var errors = new Dictionary<string, List<string>>();

            var exists = await _departmentRepository.ExistsAsync(d => d.Id == departmentId && !d.IsDeleted);
            if (!exists)
                AddError(errors, "general", "Department does not exist.");

            ThrowIfAny(errors);
        }

        public async Task ValidateForUpdateAsync(int id, UpdateDepartmentDto dto, Department existing)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            var name = dto.DepartmentName ?? existing.DepartmentName;

            if (await _departmentRepository.ExistsAsync(d => d.DepartmentName == name && d.Id != id))
                AddError(errors, "departmentName", "Department name already exists.");

            ThrowIfAny(errors);
        }
    }
}