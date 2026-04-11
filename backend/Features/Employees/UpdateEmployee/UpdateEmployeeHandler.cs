namespace backend.Features.Employees.Handlers.Implementations
{
    public class UpdateEmployeeHandler
        : IRequestHandler<UpdateEmployeeCommand, EmployeeActionResult>
    {
        private readonly IRepository<Employee> _repo;
        private readonly IEmployeeBusinessRules _rules;

        public UpdateEmployeeHandler(
            IRepository<Employee> repo,
            IEmployeeBusinessRules rules)
        {
            _repo = repo;
            _rules = rules;
        }

        public async Task<EmployeeActionResult> Handle(
            UpdateEmployeeCommand request,
            CancellationToken cancellationToken)
        {
            // 🔴 1. Validate Id
            if (request.Id <= 0)
            {
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });
            }

            // 🔴 2. Get Employee
            var employee = await _repo.GetByIdAsync(request.Id);
            if (employee is null)
                throw new NotFoundException($"Employee with Id {request.Id} not found.");

            var dto = request.dto;
            await _rules.ValidateForUpdateAsync(request.Id, dto, employee);

            string? managerRemovalMessage = null;

            if (dto.Status == EmployeeStatus.Terminated &&
                employee.Status != EmployeeStatus.Terminated)
            {
                var deptName = await _rules.HandleManagerRemovalAsync(request.Id);

                if (!string.IsNullOrEmpty(deptName))
                {
                    managerRemovalMessage = $" Manager '{employee.FirstName} {employee.Lastname}' was removed from department '{deptName}' due to termination. Please assign a new manager.";
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