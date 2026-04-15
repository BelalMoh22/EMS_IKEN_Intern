namespace backend.Features.TimeTrack.Projects.GetFilteredProjects
{
    public class GetProjectsHandler : IRequestHandler<GetProjectsQuery, IEnumerable<ProjectListDto>>
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectBusinessRules _rules;
        private readonly ICurrentUserService _currentUser;
        private readonly DepartmentRepository _departmentRepository;
        private readonly EmployeeRepository _employeeRepository;

        public GetProjectsHandler(IProjectRepository projectRepository, IProjectBusinessRules rules, ICurrentUserService currentUser, DepartmentRepository departmentRepository, EmployeeRepository employeeRepository)
        {
            _projectRepository = projectRepository;
            _rules = rules;
            _currentUser = currentUser;
            _departmentRepository = departmentRepository;
            _employeeRepository = employeeRepository;
        }
        public async Task<IEnumerable<ProjectListDto>> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
        {
            await _rules.ValidateFilterAsync(request);

            var deptId = request.departmentId;

            // HR sees all projects — no department restriction
            var role = _currentUser.UserRole;
            if (role != "HR")
            {
                var loggedInUserId = _currentUser.UserId;
                var employee = await _employeeRepository.GetByUserIdAsync(loggedInUserId);
                if (employee != null)
                {
                    // Check if they are a manager first
                    var managerDept = await _departmentRepository.GetByManagerIdAsync(employee.Id);
                    if (managerDept != null)
                    {
                        // Manager: restrict to their managed department
                        deptId = managerDept.Id;
                    }
                    else
                    {
                        // Regular employee: restrict to their own department
                        var employeeDept = await _departmentRepository.GetDepartmentByEmployeeIdAsync(employee.Id);
                        if (employeeDept != null)
                        {
                            deptId = employeeDept.Id;
                        }
                    }
                }
            }

            var projects = await _projectRepository.GetAsync(deptId, request.month, request.year, request.status);

            var result = projects.Select(p => new ProjectListDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Status = p.Status,
                DepartmentId = p.DepartmentId,
                CreatedAt = p.CreatedAt
            });

            return result;
        }

    }
}
