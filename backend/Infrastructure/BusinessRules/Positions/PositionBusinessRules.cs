namespace backend.Infrastructure.BusinessRules.Positions
{
    public class PositionBusinessRules : BaseBusinessRules, IPositionBusinessRules
    {
        private readonly IRepository<Position> _positionRepository;
        private readonly IRepository<Department> _departmentRepository;

        public PositionBusinessRules(
            IRepository<Position> positionRepository,
            IRepository<Department> departmentRepository,
            IRepository<Employee> employeeRepository
            )
        {
            _positionRepository = positionRepository;
            _departmentRepository = departmentRepository;
        }

        public async Task ValidateForCreateAsync(CreatePositionDto dto)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            if (await _positionRepository.ExistsAsync(p => p.PositionName == dto.PositionName))
                AddError(errors, "positionName", "Position name already exists.");

            if (dto.MaxSalary <= dto.MinSalary)
                AddError(errors, "maxSalary", "Max salary must be greater than min salary.");

            if (!await _departmentRepository.ExistsAsync(d => d.Id == dto.DepartmentId && !d.IsDeleted))
                AddError(errors, "departmentId", "Department does not exist.");

            ThrowIfAny(errors);
        }

        public async Task ValidateForUpdateAsync(int id, UpdatePositionDto dto, Position existing)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            var name = dto.PositionName ?? existing.PositionName;

            if (await _positionRepository.ExistsAsync(p => p.PositionName == name && p.Id != id))
                AddError(errors, "positionName", "Position name already exists.");

            var minSalary = dto.MinSalary ?? existing.MinSalary;
            var maxSalary = dto.MaxSalary ?? existing.MaxSalary;
            if (maxSalary <= minSalary)
                AddError(errors, "maxSalary", "Max salary must be greater than min salary.");

            var departmentId = dto.DepartmentId ?? existing.DepartmentId;
            if (!await _departmentRepository.ExistsAsync(d => d.Id == departmentId && !d.IsDeleted))
                AddError(errors, "departmentId", "Department does not exist.");

            ThrowIfAny(errors);
        }
    }
}