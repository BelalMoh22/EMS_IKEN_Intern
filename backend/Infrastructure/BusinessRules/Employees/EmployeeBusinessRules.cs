namespace backend.Infrastructure.BusinessRules.Employees
{
    public class EmployeeBusinessRules : BaseBusinessRules, IEmployeeBusinessRules
    {
        private readonly IRepository<Employee> _employeeRepository;
        private readonly IRepository<Position> _positionRepository;
        private readonly UserRepository _userRepository;
        private readonly DepartmentRepository _deptRepository;

        public EmployeeBusinessRules(
            IRepository<Employee> employeeRepository,
            IRepository<Position> positionRepository,
            UserRepository userRepository,
            DepartmentRepository deptRepository)
        {
            _employeeRepository = employeeRepository;
            _positionRepository = positionRepository;
            _userRepository = userRepository;
            _deptRepository = deptRepository;
        }

        public async Task ValidateForCreateAsync(CreateEmployeeDTO dto)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            var position = await _positionRepository.GetByIdAsync(dto.PositionId);
            if (position is null || position.IsDeleted)
                AddError(errors, "positionId", $"Position with Id {dto.PositionId} does not exist.");

            if (await _employeeRepository.ExistsAsync(e => e.Email == dto.Email))
                AddError(errors, "email", $"Email '{dto.Email}' is already in use.");

            if (await _employeeRepository.ExistsAsync(e => e.NationalId == dto.NationalId))
                AddError(errors, "nationalId", $"National ID '{dto.NationalId}' is already in use.");

            if (await _userRepository.ExistsAsync(u => u.Username == dto.Username))
                AddError(errors, "username", "Username already exists.");

            if (dto.Salary <= 0)
                AddError(errors, "salary", "Salary must be greater than zero.");

            if (position != null &&
                (dto.Salary < position.MinSalary || dto.Salary > position.MaxSalary))
                AddError(errors, "salary", $"Salary must be between {position.MinSalary} and {position.MaxSalary}.");

            if (position != null && (dto.Status == EmployeeStatus.Active || dto.Status == null))
            {
                if (position.CurrentEmployeeCount >= position.TargetEmployeeCount)
                    AddError(errors, "positionId", "Position capacity reached");
            }

            ThrowIfAny(errors);
        }

        public async Task ValidateForUpdateAsync(int employeeId, UpdateEmployeeDTO dto, Employee existing)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            var email = dto.Email ?? existing.Email;
            var nationalId = dto.NationalId ?? existing.NationalId;
            var salary = dto.Salary ?? existing.Salary;
            var positionId = dto.PositionId ?? existing.PositionId;

            var position = await _positionRepository.GetByIdAsync(positionId);
            if (position is null || position.IsDeleted)
                AddError(errors, "positionId", $"Position with Id {positionId} does not exist.");

            if (await _employeeRepository.ExistsAsync(e => e.Email == email && e.Id != employeeId))
                AddError(errors, "email", $"Email '{email}' is already in use.");

            if (await _employeeRepository.ExistsAsync(e => e.NationalId == nationalId && e.Id != employeeId))
                AddError(errors, "nationalId", $"National ID '{nationalId}' is already in use.");

            if (salary <= 0)
                AddError(errors, "salary", "Salary must be greater than zero.");

            if (position != null && (salary < position.MinSalary || salary > position.MaxSalary))
                AddError(errors, "salary", $"Salary must be between {position.MinSalary} and {position.MaxSalary}.");

            bool willBeActive = (dto.Status ?? existing.Status) == EmployeeStatus.Active;
            bool isAlreadyActiveInSamePosition = (existing.Status == EmployeeStatus.Active && (dto.PositionId == null || dto.PositionId == existing.PositionId));

            if (position != null && willBeActive && !isAlreadyActiveInSamePosition)
            {
                if (position.CurrentEmployeeCount >= position.TargetEmployeeCount)
                    AddError(errors, "positionId", "Position capacity reached");
            }

            ThrowIfAny(errors);
        }
        public async Task<string?> HandleManagerRemovalAsync(int employeeId)
        {
            var department = await _deptRepository.GetByManagerIdAsync(employeeId);

            if (department == null)
                return null;

            department.Update(
                department.DepartmentName,
                department.Description,
                null,
                department.IsActive
            );

            await _deptRepository.UpdateAsync(department.Id, department);

            return department.DepartmentName;
        }
    }
}