namespace EmployeeService.Features.Employees.DeleteEmployee
{
    public class DeleteEmployeeHandler : IRequestHandler<DeleteEmployeeCommand,int>
    {
        private readonly IRepository<Employee> _repo;
        private readonly UserRepository _userRepo;

        public DeleteEmployeeHandler(IRepository<Employee> repo, UserRepository userRepo)
        {
            _repo = repo;
            _userRepo = userRepo;
        }

        public async Task<int> Handle(DeleteEmployeeCommand request, CancellationToken cancellationToken)
        {
            if (request.id <= 0)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });

            var employee = await _repo.GetByIdAsync(request.id);
            if (employee == null)
                throw new NotFoundException($"Employee with Id {request.id} not found.");

            var rows = await _repo.DeleteAsync(request.id);
            
            if (rows > 0 && employee.UserId > 0)
            {
                await _userRepo.DeleteAsync(employee.UserId);
            }

            return rows;
        }
    }
}