namespace EmployeeService.Features.Employees.DeleteEmployee
{
    public class DeleteEmployeeHandler : IRequestHandler<DeleteEmployeeCommand,int>
    {
        private readonly IRepository<Employee> _repo;

        public DeleteEmployeeHandler(IRepository<Employee> repo)
        {
            _repo = repo;
        }

        public async Task<int> Handle(DeleteEmployeeCommand request, CancellationToken cancellationToken)
        {
            if (request.id <= 0)
                throw new Exceptions.ValidationException(new() {"Invalid employee Id." });

            var rows = await _repo.DeleteAsync(request.id);
            if (rows == 0)
                throw new NotFoundException($"Employee with Id {request.id} not found.");

            return rows;
        }
    }
}