namespace backend.Features.Employees.GetEmployees
{
    public class GetEmployeesHandler : IRequestHandler<GetEmployeesQuery, IEnumerable<Employee>>
    {
        private readonly EmployeeRepository _repo;

        public GetEmployeesHandler(EmployeeRepository repo)
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
                var manager = await _repo.GetByUserIdAsync(request.UserId);
                if (manager == null) return Enumerable.Empty<Employee>();

                return await _repo.GetEmployeesByManagerIdAsync(manager.Id);
            }
            return Enumerable.Empty<Employee>();
        }
    }
}