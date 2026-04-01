namespace EmployeeService.Features.Employees.GetEmployees
{
    public class GetEmployeesHandler : IRequestHandler<GetEmployeesQuery, IEnumerable<Employee>>
    {
        private readonly IRepository<Employee> _repo;

        public GetEmployeesHandler(IRepository<Employee> repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<Employee>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
        {
            if (request.UserRole == Roles.HR.ToString())
            {
                return await _repo.GetAllAsync();
            }

            if (request.UserRole == Roles.Manager.ToString())
            {
                if (_repo is EmployeeRepository employeeRepo)
                {
                    var manager = await employeeRepo.GetByUserIdAsync(request.UserId);
                    if (manager == null) return Enumerable.Empty<Employee>();

                    return await employeeRepo.GetEmployeesByManagerIdAsync(manager.Id);
                }
            }

            return Enumerable.Empty<Employee>();
        }
    }
}
