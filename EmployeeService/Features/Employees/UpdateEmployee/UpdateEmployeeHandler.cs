namespace EmployeeService.Features.Employees.Handlers.Implementations
{
    public class UpdateEmployeeHandler
    : IRequestHandler<UpdateEmployeeCommand, EmployeeActionResult>
    {
        private readonly IRepository<Employee> _repo;
        private readonly IEmployeeBusinessRules _rules;

        public UpdateEmployeeHandler(IRepository<Employee> repo,IEmployeeBusinessRules rules)
        {
            _repo = repo;
            _rules = rules;
        }

        public async Task<EmployeeActionResult> Handle(UpdateEmployeeCommand request,CancellationToken cancellationToken)
        {
            if (request.Id <= 0)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });

            var employee = await _repo.GetByIdAsync(request.Id);
            if (employee is null)
                throw new NotFoundException($"Employee with Id {request.Id} not found.");

            var dto = request.dto;
            await _rules.ValidateForUpdateAsync(request.Id, dto, employee);

            var deptNames = new List<string>();
            if (dto.Status == EmployeeStatus.Terminated && employee.Status != EmployeeStatus.Terminated)
            {
                 // Employee is being terminated, check if he is a manager
                 deptNames = await _rules.HandleManagerRemovalAsync(request.Id);
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
            var message = rows > 0 ? "Employee updated successfully." : "No employee was updated.";
            if (deptNames.Any())
            {
                message += $" Note: Manager '{employee.FirstName} {employee.Lastname}' was removed from departments: {string.Join(", ", deptNames)} due to termination. Please assign a new manager.";
            }

            return new EmployeeActionResult(rows, message);
        }
    }
}