namespace EmployeeService.Infrastructure.BusinessRules.Departments
{
    public sealed class DepartmentBusinessRules : IDepartmentBusinessRules
    {
        private readonly IRepository<Department> _departmentRepository;
        private readonly IRepository<Employee> _employeeRepository;
        private readonly IRepository<Position> _positionRepository;

        public DepartmentBusinessRules(IRepository<Department> departmentRepository,IRepository<Employee> employeeRepository,IRepository<Position> positionRepository)
        {
            _departmentRepository = departmentRepository;
            _employeeRepository = employeeRepository;
            _positionRepository = positionRepository;
        }

        public async Task ValidateForCreateAsync(CreateDepartmentDto dto)
        {
            var errors = new List<string>();
            errors.AddRange(ValidationHelper.ValidateModel(dto));

            var departmentNameExists = await _departmentRepository.ExistsAsync(d => d.DepartmentName == dto.DepartmentName);

            if (departmentNameExists)
                errors.Add($"Department name : '{dto.DepartmentName}' already exists.");

            var emailExists = await _departmentRepository.ExistsAsync(d => d.Email == dto.Email);
            if (emailExists)
                errors.Add($"Email : '{dto.Email}' already exists.");

            Employee? manager = null;
            if (dto.ManagerId.HasValue)
            {
                manager = await _employeeRepository.GetByIdAsync(dto.ManagerId.Value);
                if (manager == null)
                    errors.Add($"Employee with Id {dto.ManagerId.Value} does not exist.");

                var managerAlreadyAssigned = await _departmentRepository.ExistsAsync(d => d.ManagerId == dto.ManagerId.Value);
                if (managerAlreadyAssigned)
                    errors.Add($"Employee with Id: {dto.ManagerId.Value} is already assigned as a manager to another department.");
            }

            if (errors.Any())
                throw new Exceptions.ValidationException(errors);
        }

        public async Task ValidateForUpdateAsync(int departmentId,UpdateDepartmentDto dto,Department existingDepartment)
        {
            var errors = new List<string>();
            errors.AddRange(ValidationHelper.ValidateModel(dto));

            var effectiveName = dto.DepartmentName ?? existingDepartment.DepartmentName;
            var effectiveEmail =dto.Email ?? existingDepartment.Email;
            var effectiveManagerId = dto.ManagerId != 0 ? dto.ManagerId : existingDepartment.ManagerId;

            var nameExists = await _departmentRepository.ExistsAsync(d => d.DepartmentName == effectiveName && d.Id != departmentId);
            if (nameExists)
                errors.Add($"Department name : '{effectiveName}' already exists.");

            var emailExists = await _departmentRepository.ExistsAsync(d => d.Email == effectiveEmail && d.Id != departmentId);
            if (emailExists)
                errors.Add($"Email : '{effectiveEmail}' already exists.");

            Employee? manager = null;
            if (effectiveManagerId.HasValue)
            {
                manager = await _employeeRepository.GetByIdAsync(effectiveManagerId.Value);
                if (manager == null)
                    errors.Add($"Employee with Id {effectiveManagerId.Value} does not exist.");

                var managerAlreadyAssigned = await _departmentRepository.ExistsAsync(d => d.ManagerId == effectiveManagerId && d.Id != departmentId);
                if (managerAlreadyAssigned)
                    errors.Add($"Employee with Id: {effectiveManagerId.Value} is already assigned as manager of another department.");
            }

            if (errors.Any())
                throw new Exceptions.ValidationException(errors);
        }

        public async Task ValidateForDeleteAsync(int departmentId)
        {
            var errors = new List<string>();

            var hasPositions = await _positionRepository.ExistsAsync(p => p.DepartmentId == departmentId);
            if (hasPositions)
                errors.Add("Cannot delete department because it is assigned to one or more positions.");

            if (errors.Any())
                throw new Exceptions.ValidationException(errors);
        }
    }
}