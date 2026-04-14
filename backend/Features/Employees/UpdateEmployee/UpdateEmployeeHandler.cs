namespace backend.Features.Employees.Handlers.Implementations
{
    public class UpdateEmployeeHandler: IRequestHandler<UpdateEmployeeCommand, EmployeeActionResult>
    {
        private readonly IRepository<Employee> _repo;
        private readonly IEmployeeBusinessRules _rules;
        private readonly IRepository<Position> _positionRepository;
        private readonly UserRepository _userRepository;

        public UpdateEmployeeHandler(
            IRepository<Employee> repo,
            IEmployeeBusinessRules rules,
            IRepository<Position> positionRepository,
            UserRepository userRepository)
        {
            _repo = repo;
            _rules = rules;
            _positionRepository = positionRepository;
            _userRepository = userRepository;
        }

        public async Task<EmployeeActionResult> Handle(UpdateEmployeeCommand request,CancellationToken cancellationToken)
        {
            if (request.Id <= 0)
            {
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });
            }

            var employee = await _repo.GetByIdAsync(request.Id);
            if (employee is null)
                throw new NotFoundException($"Employee with Id {request.Id} not found.");

            var dto = request.dto;
            await _rules.ValidateForUpdateAsync(request.Id, dto, employee);

            string? managerRemovalMessage = null;

            if (dto.Status == EmployeeStatus.Terminated &&employee.Status != EmployeeStatus.Terminated)
            {
                var deptName = await _rules.HandleManagerRemovalAsync(request.Id);

                if (!string.IsNullOrEmpty(deptName))
                {
                    managerRemovalMessage = $" Manager '{employee.FirstName} {employee.Lastname}' was removed from department '{deptName}' due to termination. Please assign a new manager.";
                }
            }

            // Handle role update (Explicitly provided or automatically derived)
            var user = await _userRepository.GetByIdAsync(employee.UserId);
            if (user != null)
            {
                Roles? newRole = null;

                // 1. Explicit Role update from DTO takes priority
                if (dto.Role.HasValue)
                {
                    newRole = dto.Role.Value;
                }
                // 2. Otherwise handle automatic role update if position changed
                else if (dto.PositionId.HasValue && dto.PositionId.Value != employee.PositionId)
                {
                    var oldPosition = await _positionRepository.GetByIdAsync(employee.PositionId);
                    var newPosition = await _positionRepository.GetByIdAsync(dto.PositionId.Value);

                    if (oldPosition != null && newPosition != null && oldPosition.IsManager != newPosition.IsManager)
                    {
                        if (user.Role != Roles.HR)
                        {
                            newRole = newPosition.IsManager ? Roles.Manager : Roles.Employee;
                        }
                    }
                }

                if (newRole.HasValue && newRole.Value != user.Role)
                {
                    await _userRepository.UpdateRoleAsync(employee.UserId, newRole.Value);
                }
            }

            employee.Update(
                dto.FirstName,
                dto.Lastname,
                dto.NationalId,
                dto.Email,
                dto.PhoneNumber,
                dto.DateOfBirth,
                dto.Address,
                dto.Salary,
                dto.HireDate,
                dto.Status,
                dto.PositionId
            );

            var rows = await _repo.UpdateAsync(request.Id, employee);

            var message = rows > 0? "Employee updated successfully." : "No employee was updated.";

            if (!string.IsNullOrEmpty(managerRemovalMessage))
            {
                message += managerRemovalMessage;
            }

            return new EmployeeActionResult(rows, message);
        }
    }
}