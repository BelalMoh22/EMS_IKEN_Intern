namespace EmployeeService.Infrastructure.BusinessRules.Employees
{
    public class EmployeeBusinessRules : IEmployeeBusinessRules
    {
        private readonly IRepository<Employee> _employeeRepository;
        private readonly IRepository<Position> _positionRepository;

        public EmployeeBusinessRules(
            IRepository<Employee> employeeRepository,
            IRepository<Position> positionRepository)
        {
            _employeeRepository = employeeRepository;
            _positionRepository = positionRepository;
        }

        public async Task ValidateForCreateAsync(CreateEmployeeDTO dto)
        {
            var errors = new List<string>();
            errors.AddRange(ValidationHelper.ValidateModel(dto));

            var position = await _positionRepository.GetByIdAsync(dto.PositionId);
            if (position is null)
                errors.Add($"Position with Id {dto.PositionId} does not exist.");

            var emailExists = await _employeeRepository
                .ExistsAsync(e => e.Email == dto.Email);

            if (emailExists)
                errors.Add($"Email '{dto.Email}' is already in use.");

            var nationalIdExists = await _employeeRepository
                .ExistsAsync(e => e.NationalId == dto.NationalId);

            if (nationalIdExists)
                errors.Add($"National ID '{dto.NationalId}' is already in use.");

            if (dto.Salary <= 0)
                errors.Add("Salary must be greater than zero.");

            if (position != null && (dto.Salary < position.MinSalary || dto.Salary > position.MaxSalary))
                errors.Add($"Salary must be between {position.MinSalary} and {position.MaxSalary}.");

            if (dto.Status.HasValue && !Enum.IsDefined(typeof(EmployeeStatus), dto.Status.Value))
                errors.Add("Invalid employee status.");

            if (errors.Any())
                throw new Exceptions.ValidationException(errors);
        }

        public async Task ValidateForUpdateAsync(int employeeId,UpdateEmployeeDTO dto,Employee existingEmployee)
        {
            var errors = new List<string>();
            errors.AddRange(ValidationHelper.ValidateModel(dto));

            var effectiveEmail = dto.Email ?? existingEmployee.Email;
            var effectiveNationalId = dto.NationalId ?? existingEmployee.NationalId;
            var effectiveSalary = dto.Salary ?? existingEmployee.Salary;
            var effectivePositionId = dto.PositionId ?? existingEmployee.PositionId;
            var effectiveStatus = dto.Status ?? existingEmployee.Status;

            var position = await _positionRepository.GetByIdAsync(effectivePositionId);
            if (position is null)
                errors.Add($"Position with Id {effectivePositionId} does not exist.");

            var emailExists = await _employeeRepository.ExistsAsync(e => e.Email == effectiveEmail && e.Id != employeeId);

            if (emailExists)
                errors.Add($"Email '{effectiveEmail}' is already in use.");

            var nationalIdExists = await _employeeRepository.ExistsAsync(e => e.NationalId == effectiveNationalId && e.Id != employeeId);

            if (nationalIdExists)
                errors.Add($"National ID '{effectiveNationalId}' is already in use.");

            if (effectiveSalary <= 0)
                errors.Add("Salary must be greater than zero.");

            if (position != null &&(effectiveSalary < position.MinSalary || effectiveSalary > position.MaxSalary))
                errors.Add($"Salary must be between {position.MinSalary} and {position.MaxSalary}.");

            if (effectiveStatus.HasValue &&!Enum.IsDefined(typeof(EmployeeStatus), effectiveStatus.Value))
                errors.Add("Invalid employee status.");

            if (errors.Any())
                throw new Exceptions.ValidationException(errors);
        }
    }
}
