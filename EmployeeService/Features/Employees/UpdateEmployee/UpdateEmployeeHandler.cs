namespace EmployeeService.Features.Employees.Handlers.Implementations
{
    public class UpdateEmployeeHandler
    : IRequestHandler<UpdateEmployeeCommand, int>
    {
        private readonly IRepository<Employee> _repo;
        private readonly IEmployeeBusinessRules _rules;

        public UpdateEmployeeHandler(IRepository<Employee> repo,IEmployeeBusinessRules rules)
        {
            _repo = repo;
            _rules = rules;
        }

        public async Task<int> Handle(UpdateEmployeeCommand request,CancellationToken cancellationToken)
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
            return await _repo.UpdateAsync(request.Id, employee);
        }
    }
}