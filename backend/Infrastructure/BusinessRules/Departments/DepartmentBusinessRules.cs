namespace backend.Infrastructure.BusinessRules.Departments
{
    public class DepartmentBusinessRules : BaseBusinessRules, IDepartmentBusinessRules
    {
        private readonly IRepository<Department> _departmentRepository;
        private readonly IRepository<Position> _positionRepository;

        public DepartmentBusinessRules(
            IRepository<Department> departmentRepository,
            IRepository<Position> positionRepository
            )
        {
            _departmentRepository = departmentRepository;
            _positionRepository = positionRepository;
        }

        public async Task ValidateForCreateAsync(CreateDepartmentDto dto)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            if (await _departmentRepository.ExistsAsync(d => d.DepartmentName == dto.DepartmentName))
                AddError(errors, "departmentName", "Department name already exists.");

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

        public async Task ValidateForDeleteAsync(int departmentId)
        {
            if (await _positionRepository.ExistsAsync(p => p.DepartmentId == departmentId && !p.IsDeleted))
                throw new BusinessException("This department cannot be deleted because it has assigned positions.");
        }
    }
}