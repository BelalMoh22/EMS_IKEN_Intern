namespace backend.Features.Employees.DeleteEmployee
{
    public class DeleteEmployeeHandler : IRequestHandler<DeleteEmployeeCommand, EmployeeActionResult>
    {
        private readonly IRepository<Employee> _repo;
        private readonly UserRepository _userRepo;
        private readonly IEmployeeBusinessRules _rules;

        public DeleteEmployeeHandler(IRepository<Employee> repo, UserRepository userRepo, IEmployeeBusinessRules rules)
        {
            _repo = repo;
            _userRepo = userRepo;
            _rules = rules;
        }

        public async Task<EmployeeActionResult> Handle(DeleteEmployeeCommand request, CancellationToken cancellationToken)
        {
            if (request.id <= 0)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });

            var employee = await _repo.GetByIdAsync(request.id);
            if (employee == null)
                throw new NotFoundException($"Employee with Id {request.id} not found.");

            // Check if manager in any department
            var deptName = await _rules.HandleManagerRemovalAsync(request.id);

            var rows = await _repo.DeleteAsync(request.id);

            // If employee has an associated user account, delete it as well
            if (rows > 0 && employee.UserId > 0)
            {
                var user = await _userRepo.GetByIdAsync(employee.UserId);
                if (user != null && !user.IsDeleted)
                {
                    await _userRepo.DeleteAsync(employee.UserId);
                }
            }

            var message = rows > 0 ? "Employee deleted successfully." : "No employee was deleted.";
            if (!string.IsNullOrEmpty(deptName))
            {
                message += $" Note: Manager '{employee.FirstName} {employee.Lastname}' was removed from department '{deptName}'. Please assign a new manager.";
            }

            return new EmployeeActionResult(rows, message);
        }
    }
}