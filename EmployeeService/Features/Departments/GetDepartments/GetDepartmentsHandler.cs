namespace EmployeeService.Features.Departments.GetDepartments
{
    public class GetDepartmentsHandler : IRequestHandler<GetDepartmentsQuery, IEnumerable<Department>>
    {
        private readonly IRepository<Department> _repo;
        private readonly IRepository<Employee> _employeeRepo;

        public GetDepartmentsHandler(IRepository<Department> repo, IRepository<Employee> employeeRepo)
        {
            _repo = repo;
            _employeeRepo = employeeRepo;
        }

        public async Task<IEnumerable<Department>> Handle(GetDepartmentsQuery request, CancellationToken cancellationToken)
        {
            if (request.UserRole == Roles.HR.ToString())
            {
                return await _repo.GetAllAsync();
            }

            if (request.UserRole == Roles.Manager.ToString())
            {
                if (_repo is DepartmentRepository deptRepo && _employeeRepo is EmployeeRepository empRepo)
                {
                    var manager = await empRepo.GetByUserIdAsync(request.UserId);
                    if (manager == null) return Enumerable.Empty<Department>();

                    return await deptRepo.GetByManagerIdAsync(manager.Id);
                }
            }

            return Enumerable.Empty<Department>();
        }
    }
}
