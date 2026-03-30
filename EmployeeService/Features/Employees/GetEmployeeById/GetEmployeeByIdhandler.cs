namespace EmployeeService.Features.Employees.GetEmployeeById
{
    public class GetEmployeeByIdHandler : IRequestHandler<GetEmployeeByIdQuery, Employee?>
    {
        private readonly IRepository<Employee> _repo;

        public GetEmployeeByIdHandler(IRepository<Employee> repo)
        {
            _repo = repo;
        }

        public async Task<Employee> Handle(GetEmployeeByIdQuery request, CancellationToken cancellationToken)
        {
            if(request.Id <= 0)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });

            var employee = await _repo.GetByIdAsync(request.Id);
            if(employee == null)
                throw new NotFoundException($"Employee with Id {request.Id} not found.");

            return employee;
        }
    }
}